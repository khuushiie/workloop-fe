import {
  AlertCircle, BarChart3,
  CheckCircle,
  Clock,
  Coffee,
  LogIn, LogOut,
  User,
  Utensils,
  ForkKnife
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux"; // <--- 1. Import useSelector
import {
  ILocation,
  ITodayStatus,
  useCheckInMutation,
  useCheckOutMutation,
  useEndBreakMutation,
  useGetOfficeLocationQuery,
  useGetTodayStatusQuery,
  useStartBreakMutation,
} from "../../store/apis/attendance.api";
import { useAuth } from "../../store/hooks/useAuth";
import { useHasPermission } from "../../store/hooks/useRbac";
import { AttendanceUtils } from "../../store/utils/attendanceUtils";
import { getAttendanceStatusVariant } from "../../utils/badgeVariants";
import { OFFICE_CONFIG } from "../../utils/config";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { Button } from "../common";
import Badge from "../common/Badge";
import { AttendanceDashboardSkeleton } from "./Skeleton";
import {IAttendanceState} from '../../store/slices/attendanceSlice'

// --- Geolocation Hook ---
const useGeoLocation = () => {
  const [location, setLocation] = useState<ILocation | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);

  const getCurrentLocation = async () => {
    setIsGeoLoading(true);
    setGeoError(null);
    try {
      if (!navigator.geolocation) throw new Error("Geolocation not supported");
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 15000, maximumAge: 300000,
        });
      });
      setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
    } catch (err: unknown) {
      const error = err as Error;
      setGeoError(error.message || "Failed to get location");
    } finally {
      setIsGeoLoading(false);
    }
  };
  return { location, geoError, isGeoLoading, getCurrentLocation };
};

const EmployeeAttendance: React.FC = () => {
  const { user } = useAuth();
  const canManageAttendance = useHasPermission(PERMISSIONS.MY_ATTENDANCE_MANAGE);

  // --- 1. Access Redux Slice (Source of Truth for Status) ---
  const attendanceState = useSelector((state: IAttendanceState) => state);

  // --- 2. Queries (Data fetching for Stats/History) ---
  const { 
    data: statusResponse, 
    isLoading: isStatusLoading, 
    error: statusError,
    // refetch is removed because invalidatesTags handles it automatically!
  } = useGetTodayStatusQuery(undefined, {
    skip: !user, 
    // We rely on cache unless mutated
  });

  const { data: officeLocResponse } = useGetOfficeLocationQuery();

  // --- 3. Mutations ---
  const [checkIn, { isLoading: isCheckInLoading, error: checkInError, isSuccess: isCheckInSuccess }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckOutLoading, error: checkOutError, isSuccess: isCheckOutSuccess }] = useCheckOutMutation();
  const [startBreak, { isLoading: isBreakStartLoading, error: breakStartError, isSuccess: isBreakStartSuccess }] = useStartBreakMutation();
  const [endBreak, { isLoading: isBreakEndLoading, error: breakEndError, isSuccess: isBreakEndSuccess }] = useEndBreakMutation();
   
  // --- 4. Derived "Merged" State ---
  // We combine the Instant Redux State with the Rich API Data
// --- 4. Derived "Merged" State ---
  const todayStatus = useMemo(() => {
    const apiData = statusResponse?.data as ITodayStatus;
    // If Redux hasn't initialized yet and we have no API data, return null
    if (!attendanceState && !apiData.status) return null;

    // 1. Get Status (Prioritize Redux for Optimistic UI)
    // Normalize to lowercase to handle "Present" vs "present"
    const s = (attendanceState?.status || apiData?.status || "not_checked_in").toLowerCase();
    const checkInTime = attendanceState?.checkInTime || apiData?.checkInTime;
    const breakStartTime = attendanceState?.breakStartTime || apiData?.activeBreak?.startTime;

    return {
      id: apiData?.id,
      status: s,
      checkInTime: checkInTime,
      checkOutTime: apiData?.checkOutTime, 
      totalWorkHours: apiData?.totalWorkHours || 0,
      netWorkHours: apiData?.netWorkHours || 0,
      totalBreakHours: apiData?.totalBreakHours || 0,
      breaks: apiData?.breaks || [],
      activeBreak: apiData?.activeBreak,
      canCheckIn: apiData?.canCheckIn,
      canCheckOut: apiData?.canCheckOut,
      canStartBreak: apiData?.canStartBreak,
      canEndBreak: apiData?.canEndBreak,
    };
  }, [attendanceState, statusResponse]);

  // --- 5. Local State & Computed Values ---
  const [distance, setDistance] = useState<number | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);
  const [uiSuccess, setUiSuccess] = useState<string | null>(null);

  const { location, geoError, isGeoLoading, getCurrentLocation } = useGeoLocation();

  const locationConfig = user?.locationConfig;
  const enforceOfficeCheckin = locationConfig?.enforceOfficeCheckin ?? false;

  const officeLocation = enforceOfficeCheckin
    ? {
        latitude: locationConfig!.latitude!,
        longitude: locationConfig!.longitude!,
      }
    : officeLocResponse?.data || {
        latitude: OFFICE_CONFIG.latitude,
        longitude: OFFICE_CONFIG.longitude,
      };

  const allowedRadius =
    locationConfig?.allowedRadiusMeters ?? OFFICE_CONFIG.allowedRadiusMeters;

  // --- 6. Effects ---

  // Initial load
  useEffect(() => { getCurrentLocation(); }, []);

  // Distance Calculation
  useEffect(() => {
    if (location && officeLocation) {
      const dist = AttendanceUtils.calculateDistance(
        location.latitude, location.longitude,
        officeLocation.latitude, officeLocation.longitude
      );
      setDistance(dist);
    }
  }, [location, officeLocation]);

  // Mutation Feedback
  useEffect(() => {
    const activeError = checkInError || checkOutError || breakStartError || breakEndError || statusError || geoError;
    if (activeError) {
      const msg = typeof activeError === 'string' ? activeError : AttendanceUtils.getErrorMessage(activeError);
      setUiError(msg);
      const timer = setTimeout(() => setUiError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [checkInError, checkOutError, breakStartError, breakEndError, statusError, geoError]);

  useEffect(() => {
    let msg = "";
    if (isCheckInSuccess) msg = "Successfully checked in!";
    if (isCheckOutSuccess) msg = "Successfully checked out!";
    if (isBreakStartSuccess) msg = "Break started successfully.";
    if (isBreakEndSuccess) msg = "Break ended successfully.";

    if (msg) {
      setUiSuccess(msg);
      const timer = setTimeout(() => setUiSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [isCheckInSuccess, isCheckOutSuccess, isBreakStartSuccess, isBreakEndSuccess]);


  // --- 7. Handlers ---

  // Helper to format date for API (YYYY-MM-DD)
  const getPayloadBase = () => {
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0], // YYYY-MM-DD
      time: now.toISOString().split('T')[1].split('.')[0] // HH:mm:ss
    };
  };

  const validateLocation = () => {
    if (!enforceOfficeCheckin) return true;

    if (!location) {
      getCurrentLocation();
      return false;
    }
    if (!AttendanceUtils.isLocationValid(distance, allowedRadius)) {
      setUiError(`You are too far (${distance?.toFixed(0)}m). Max allowed: ${allowedRadius}m`);
      return false;
    }
    return true;
  };

  const handleCheckIn = async () => {
    if (!validateLocation()) return;
    if (enforceOfficeCheckin && !location) return;
    const { date, time } = getPayloadBase();
    await checkIn({
      date,
      checkInTime: time,
      checkInLocation: location ?? { latitude: 0, longitude: 0, accuracy: 0 },
    });
  };

  const handleCheckOut = () => {
    if (!validateLocation()) return;
    if (enforceOfficeCheckin && !location) return;
    const { date, time } = getPayloadBase();
    checkOut({
      date,
      checkOutTime: time,
      checkOutLocation: location ?? { latitude: 0, longitude: 0, accuracy: 0 },
    });
  };

  const handleStartBreak = (type: "lunch" | "tea" | "personal") => {
    if (validateLocation()) {
      const { date, time } = getPayloadBase();
      startBreak({ date, startTime: time, type });
    }
  };

  const handleEndBreak = () => {
    // For end break, we don't strictly need location usually, but good to have
    const { date, time } = getPayloadBase();
    endBreak({ date, endTime: time });
  };

  const isGlobalLoading = isCheckInLoading || isCheckOutLoading || isBreakStartLoading || isBreakEndLoading || isGeoLoading;
  const isLocationValid = AttendanceUtils.isLocationValid(distance);

  // --- 8. Render ---

  return (
    <div className="p-6 max-full mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 md:mb-0 md:text-3xl">Attendance Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isLocationValid ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-sm text-slate-600 flex gap-2 items-center">
            {isLocationValid && !isGeoLoading ? "In Office" : "Out of Office"}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {uiError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" /> {uiError}
        </div>
      )}
      {uiSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" /> {uiSuccess}
        </div>
      )}

      {/* Main Card */}
      <div className="mb-6 bg-white rounded-xl shadow-soft border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-green-600" /> Today's Status
        </h2>

        {isStatusLoading ? (
          <AttendanceDashboardSkeleton />
        ) : todayStatus ? (
          <div className="space-y-4">

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-600">Current Status</p>
                <Badge variant={getAttendanceStatusVariant(todayStatus.status)} size="large">
                  {AttendanceUtils.getStatusLabel(todayStatus.status)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Work Hours</p>
                <p className="font-medium">{AttendanceUtils.formatHoursToHHMM(todayStatus.netWorkHours)}</p>
              </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-50 rounded-lg p-4">
                <p className="text-sm text-primary-600 mb-1">Check In</p>
                <p className="font-medium">{AttendanceUtils.formatTime(todayStatus.checkInTime)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">Check Out</p>
                <p className="font-medium">{AttendanceUtils.formatTime(todayStatus.checkOutTime)}</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              {todayStatus.canCheckIn && canManageAttendance && (
                <div className="relative group">
                  <Button
                    onClick={handleCheckIn}
                    disabled={isGlobalLoading || !isLocationValid}
                    size="large" appearance="success" icon={<LogIn className="w-4 h-4" />}
                  >
                    Check In
                  </Button>
                  {!isLocationValid && <div className="hidden group-hover:block absolute bottom-full mb-2 bg-black text-white text-xs p-2 rounded">Not in office</div>}
                </div>
              )}

              {todayStatus.canCheckOut && canManageAttendance && (
                <div className="relative group">
                  <Button
                    onClick={handleCheckOut}
                    disabled={isGlobalLoading || !isLocationValid}
                    size="large" appearance="danger" icon={<LogOut className="w-4 h-4" />}
                  >
                    Check Out
                  </Button>
                  {!isLocationValid && <div className="hidden group-hover:block absolute bottom-full mb-2 bg-black text-white text-xs p-2 rounded">Not in office</div>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p>No attendance record found for today</p>
            {canManageAttendance && (
              <Button onClick={handleCheckIn} disabled={isGlobalLoading} className="mt-4" appearance="success">
                Start Day (Check In)
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Breaks Section */}
      {todayStatus && todayStatus.checkInTime && !todayStatus.checkOutTime && (
        <div className="mb-6 bg-white rounded-xl shadow-soft border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Coffee className="w-5 h-5 mr-2 text-orange-600" /> Break Management
          </h2>

          {todayStatus.activeBreak ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-orange-600 font-bold capitalize">{todayStatus.activeBreak.type || "Break"}</p>
                <p className="text-sm text-slate-600">Started: {AttendanceUtils.formatTime(todayStatus.activeBreak.startTime)}</p>
              </div>
              <Button onClick={handleEndBreak} disabled={isGlobalLoading} size="large" className="bg-orange-600 text-white">End Break</Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {['lunch', 'tea', 'personal'].map((type) => (
                <Button
                  key={type}
                  onClick={() => handleStartBreak(type as any)}
                  disabled={isGlobalLoading || !isLocationValid}
                  size="large"
                  className={type === 'lunch' ? 'bg-yellow-600 text-white' : type === 'tea' ? 'bg-orange-600 text-white' : 'bg-purple-600 text-white'}
                  icon={type === 'lunch' ? <Utensils className="w-4 h-4" /> : type === 'tea' ? <Coffee className="w-4 h-4" /> : <User className="w-4 h-4" />}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Break
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Work Summary */}
      {todayStatus &&
        ((todayStatus.totalWorkHours || 0) > 0 ||
          (todayStatus.totalBreakHours || 0) > 0) && (
          <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
              Work Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary-50 rounded-lg p-4">
                <p className="text-sm text-primary-600 mb-1">Total Work Hours</p>
                <p className="font-medium">
                  {AttendanceUtils.formatHoursToHHMM(
                    todayStatus.totalWorkHours || 0
                  )}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-600 mb-1">Break Hours</p>
                <p className="font-medium">
                  {AttendanceUtils.formatHoursToHHMM(
                    todayStatus.totalBreakHours || 0
                  )}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">Net Work Hours</p>
                <p className="font-medium">
                  {AttendanceUtils.formatHoursToHHMM(
                    todayStatus.netWorkHours || 0
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      {/* Break History */}
      {(todayStatus?.breaks?.length ?? 0) > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-soft border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-600" />
            Today's Breaks
          </h3>

          <div className="space-y-3">
            {todayStatus?.breaks.map((b: any, index: number) => {
              const isActive = !b.endTime;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${isActive
                      ? "bg-orange-50"
                      : "bg-slate-50 "
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-md font-semibold capitalize text-slate-800 flex items-center">
                        {/* {b.type === "lunch" && <ForkKnife className="w-5 h-5 mr-2 text-yellow-600" />}
                        {b.type === "tea" && <Coffee className="w-5 h-5 mr-2 text-yellow-600" />}
                        {b.type === "personal" && <User className="w-5 h-5 mr-2 text-yellow-600" />} */}
                        {b.type} Break

                      </p>
                      <p className="text-sm text-slate-500">
                        {AttendanceUtils.formatTime(b.startTime)}{" "}
                        {b.endTime && `- ${AttendanceUtils.formatTime(b.endTime)}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-md font-medium">
                        {isActive
                          ? "Ongoing"
                          : AttendanceUtils.formatHoursToHHMM(
                            b.duration || 0
                          )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;