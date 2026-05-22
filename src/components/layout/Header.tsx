import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { getDisplayName } from "../../utils/nameUtils";
import {
  Menu,
  X,
  Clock,
  Coffee,
  LogIn,
  LogOut,
  ChevronDown,
  Utensils,
  User,
  Download,
  Lock,
  Link,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useGetDocumentsQuery,
  useDownloadDocumentMutation,
} from "../../store/apis/uploads.api";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { useAuth } from "../../store/hooks/useAuth";
import { ConfirmationModal } from "../common";
import { RoleTypeEnum } from "../../utils/constants";
import {
  useGetTodayStatusQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useStartBreakMutation,
  useEndBreakMutation,
} from "../../store/apis/attendance.api";
import type { ILocation } from "../../store/apis/attendance.api";
import { AttendanceUtils } from "../../store/apis/utils/attendanceUtils";
import { useSignedUrl } from "../../store/hooks/useSignedUrl";
import { toast } from "react-hot-toast";
import { OFFICE_CONFIG } from "../../utils/config";

/** Single document option for Quick Links dropdown (from GET /v2/files/documents). */
export interface QuickLinkDocument {
  _id?: string;
  id: string;
  path: string;
  name: string;
  filename: string;
  title?: string;
}

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

// Helper: Format Date

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profilePicSrc = useSignedUrl(user?.profilePic);
  const attendanceEnabled = useHasPermission(PERMISSIONS.MY_ATTENDANCE_MANAGE);

  // --- 1. Access Global Redux State (The "Source of Truth") ---
  const attendanceState = useAppSelector((state) => state.attendance);

  // --- 2. Keep Query for Background Sync ---
  // This fetches data on load and populates the slice via onQueryStarted
  const { isLoading: isStatusLoading } = useGetTodayStatusQuery(undefined, {
    skip: !user || !attendanceEnabled,
    refetchOnMountOrArgChange: true,
  });

  const [checkIn, { isLoading: isCheckInLoading }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckOutLoading }] = useCheckOutMutation();
  const [startBreak, { isLoading: isStartBreakLoading }] =
    useStartBreakMutation();
  const [endBreak, { isLoading: isEndBreakLoading }] = useEndBreakMutation();
  const {
    data: documentsResponse,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useGetDocumentsQuery(
    { prefix: "Documents" },
    { skip: !user, refetchOnMountOrArgChange: false },
  );
  const [downloadDocument] = useDownloadDocumentMutation();

  const loading =
    isStatusLoading ||
    isCheckInLoading ||
    isCheckOutLoading ||
    isStartBreakLoading ||
    isEndBreakLoading;

  const todayStatus = React.useMemo(() => {
    if (!attendanceState) return null;
    const s = attendanceState.status?.toLowerCase() || "not_checked_in";

    return {
      checkInTime: attendanceState.checkInTime,
      checkOutTime:
        s === "checked_out" || s === "completed" ? "completed" : null,
      canStartBreak: s === "present" || s === "working",
      canEndBreak: s === "on_break" || s === "break",
      activeBreak:
        s === "on_break" || s === "break"
          ? { startTime: attendanceState.breakStartTime }
          : null,
      status: s,
    };
  }, [attendanceState]);

  // --- Local UI State ---
  const [showBreakTypes, setShowBreakTypes] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [checkOutWarning, setCheckOutWarning] = useState(false);
  const [logoutWarning, setLogoutWarning] = useState(false);
  const [imgError, setImgError] = useState(false);

  const downloadOptions: QuickLinkDocument[] = React.useMemo(() => {
    const filePaths: string[] = documentsResponse?.data ?? [];
    return filePaths
      .filter(
        (path): path is string =>
          typeof path === "string" && !path.endsWith("/"),
      )
      .map((path) => ({
        id: path,
        path,
        name: path.split("/").pop() || path,
        filename: path.split("/").pop() || path,
      }));
  }, [documentsResponse?.data]);

  // --- Effects ---

  // Native Bridge Sync
  useEffect(() => {
    if (todayStatus && window.ReactNativeWebView) {
      const isActive = !!todayStatus.checkInTime && !todayStatus.checkOutTime;
      if (isActive) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "START_MOBILE_SERVICES",
            payload: {
              status: "checked_in",
              checkInTime: todayStatus.checkInTime,
              source: "header_sync",
            },
          }),
        );
        console.log("📦 NATIVE BRIDGE: Reload Sync -> START_MOBILE_SERVICES");
      }
    }
  }, [todayStatus]);

  // Click Outside Listeners
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".break-dropdown")) setShowBreakTypes(false);
      if (!target.closest(".download-dropdown")) setShowDownloadDropdown(false);
      if (!target.closest(".user-dropdown")) setShowUserDropdown(false);
    };

    if (showBreakTypes || showDownloadDropdown || showUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBreakTypes, showDownloadDropdown, showUserDropdown]);

  // Refetch documents from backend (S3/GCS) when user opens Quick Links dropdown
  const handleDownloadDropdownToggle = () => {
    const next = !showDownloadDropdown;
    setShowDownloadDropdown(next);
    if (next && user) refetchDocuments();
  };

  // --- Helper Functions ---

  const getCurrentLocation = (): Promise<ILocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true },
      );
    });
  };

  const handleDownload = async (item: QuickLinkDocument) => {
    try {
      setLoadingDownloads(true);
      const fileName = item.path || item.id;
      const blob = await downloadDocument(fileName).unwrap();

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          item.filename ||
          item.name ||
          item.title ||
          `download-${item.id || item._id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setLoadingDownloads(false);
      setShowDownloadDropdown(false);
    }
  };

  // --- HANDLERS (No Refetch Needed! Slice updates automatically) ---
  const [handleCheckInLoading, setHandleCheckInLoading] = useState(false);
  const [handleCheckOutLoading, setHandleCheckOutLoading] = useState(false);

  const locationConfig = user?.locationConfig;
  const enforceOfficeCheckin = locationConfig?.enforceOfficeCheckin ?? false;

  const handleCheckIn = async () => {
    setHandleCheckInLoading(true);
    try {
      let location: ILocation = { latitude: 0, longitude: 0, accuracy: 0 };
      try {
        location = await getCurrentLocation();
      } catch (error) {
        if (enforceOfficeCheckin) {
          toast.error("Error fetching location");
          console.error("Error fetching location:", error);
          return;
        }
      }

      if (enforceOfficeCheckin) {
        const officeLat = locationConfig!.latitude!;
        const officeLng = locationConfig!.longitude!;
        const allowedRadius = locationConfig!.allowedRadiusMeters ?? OFFICE_CONFIG.allowedRadiusMeters;

        const distance = AttendanceUtils.calculateDistance(
          location.latitude,
          location.longitude,
          officeLat,
          officeLng,
        );

        const isValid = AttendanceUtils.isLocationValid(distance, allowedRadius);

        if (!isValid) {
          toast.error(
            `You are outside office premises. Distance: ${Math.round(distance)}m`,
          );
          return;
        }
      }

      const { date, time } = AttendanceUtils.getFormattedDateTime();

      await checkIn({
        date: date,
        checkInTime: time,
        checkInLocation: location,
      }).unwrap();

      if (window.ReactNativeWebView) {
        const packet = JSON.stringify({
          type: "START_MOBILE_SERVICES",
          payload: { status: "checked_in", time: new Date().toISOString() },
        });
        window.ReactNativeWebView.postMessage(packet);
        console.log("Signal Sent: START_MOBILE_SERVICES");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Error checking in");
    } finally {
      setHandleCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setHandleCheckOutLoading(true);
    try {
      let location: ILocation = { latitude: 0, longitude: 0, accuracy: 0 };
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.warn(
          "Could not fetch location during checkout, proceeding anyway:",
          error,
        );
      }

      const { date, time } = AttendanceUtils.getFormattedDateTime();
      await checkOut({
        date: date,
        checkOutTime: time,
        checkOutLocation: location,
      }).unwrap();

      if (window.ReactNativeWebView) {
        const packet = JSON.stringify({
          type: "STOP_MOBILE_SERVICES",
          payload: { status: "checked_out", time: new Date().toISOString() },
        });
        window.ReactNativeWebView.postMessage(packet);
        console.log("Signal Sent: STOP_MOBILE_SERVICES");
      }
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error("Error checking out");
    } finally {
      setCheckOutWarning(false);
      setHandleCheckOutLoading(false);
    }
  };

  const handleStartBreak = async (breakType: string = "lunch") => {
    try {
      const type = breakType as "lunch" | "tea" | "personal";
      const { date, time } = AttendanceUtils.getFormattedDateTime();

      await startBreak({
        date: date,
        startTime: time,
        type: type,
      }).unwrap();

      setShowBreakTypes(false);
    } catch (error) {
      console.error("Error starting break:", error);
    }
  };

  const handleEndBreak = async () => {
    try {
      const { date, time } = AttendanceUtils.getFormattedDateTime();
      await endBreak({
        date: date,
        endTime: time,
      }).unwrap();
    } catch (error) {
      console.error("Error ending break:", error);
    }
  };

  return (
    <>
      <header className="relative z-40 bg-white/80 backdrop-blur-md shadow-soft border-b border-slate-100 px-3 sm:px-6 py-2 sm:py-4">
        <div className="flex items-center justify-end">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 mr-auto"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 ml-1" />
            ) : (
              <Menu className="w-5 h-5 ml-1" />
            )}
          </button>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Quick Actions for Employees */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Quick Links Dropdown */}
              <div className="relative download-dropdown">
                <button
                  onClick={handleDownloadDropdownToggle}
                  disabled={loadingDownloads}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                >
                  <Link className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">Quick Links</span>
                  <ChevronDown
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${
                      showDownloadDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDownloadDropdown && (
                  <div
                    className={`absolute top-full left-0 sm:right-0 sm:left-auto mt-2 bg-white border border-slate-100 rounded-xl shadow-soft-hover z-50 sm:w-72 md:w-80 ${
                      loadingDownloads
                        ? "w-auto min-w-[100px] max-w-[150px]"
                        : "w-[calc(100vw-4rem)]"
                    }`}
                  >
                    {loadingDownloads || isLoadingDocuments ? (
                      <div className="flex items-center justify-center py-2 sm:py-3 px-3">
                        <span className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                          Loading...
                        </span>
                      </div>
                    ) : downloadOptions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center">
                        No documents available
                      </div>
                    ) : (
                      <div className="py-1 max-y-48 overflow-y-auto  px-0">
                        {downloadOptions.map((item) => (
                          <button
                            key={item.id || item._id || item.path}
                            onClick={() => handleDownload(item)}
                            className="w-full text-left px-1.5 py-2 text-sm text-slate-600 hover:bg-slate-100 flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="break-words whitespace-normal font-medium text-xs sm:text-sm">
                              {item.name.split(".")[0] ||
                                item.title ||
                                item.filename ||
                                "Download"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Check In/Out Button */}
              {attendanceEnabled && !todayStatus?.checkInTime ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading || handleCheckInLoading}
                  className="flex items-center justify-center sm:justify-start space-x-0 sm:space-x-1 px-2 py-0 sm:px-3 sm:py-2 bg-emerald-600 text-white text-xs sm:text-sm rounded-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <LogIn className="w-4 h-4 sm:w-4 sm:h-4  " />
                  <span className="hidden sm:inline">Check In</span>
                </button>
              ) : attendanceEnabled && !todayStatus?.checkOutTime ? (
                <button
                  onClick={() => setCheckOutWarning(true)}
                  disabled={loading || handleCheckOutLoading}
                  className="flex items-center justify-center sm:justify-start space-x-0 sm:space-x-1 px-2 py-0 sm:px-3 sm:py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Check Out</span>
                </button>
              ) : null}

              {/* Break Management */}
              {attendanceEnabled &&
                todayStatus?.checkInTime &&
                todayStatus.checkInTime !== null &&
                todayStatus.status !== "not_checked_in" &&
                !todayStatus?.checkOutTime && (
                  <div className="flex items-center space-x-1">
                    {todayStatus?.canEndBreak ? (
                      <button
                        onClick={handleEndBreak}
                        disabled={loading || !todayStatus?.checkInTime}
                        className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-2 bg-primary-600 text-white text-xs sm:text-sm rounded-lg hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                      >
                        <Clock className="w-4 h-4 ml-1 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">End Break</span>
                      </button>
                    ) : todayStatus?.canStartBreak ? (
                      <div className="relative break-dropdown">
                        <button
                          onClick={() => setShowBreakTypes(!showBreakTypes)}
                          disabled={loading || !todayStatus?.checkInTime}
                          className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-2 bg-amber-500 text-white text-xs sm:text-sm rounded-lg hover:bg-amber-600 hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        >
                          <Coffee className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Break</span>
                          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>

                        {/* Break Type Dropdown */}
                        {showBreakTypes && (
                          <div className="absolute top-full left-0 mt-2 w-36 bg-white border border-slate-100 rounded-xl shadow-soft-hover z-50">
                            <div className="py-1">
                              <button
                                onClick={() => handleStartBreak("lunch")}
                                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 flex items-center"
                              >
                                <Utensils className="w-4 h-4 mr-2" />
                                Lunch
                              </button>
                              <button
                                onClick={() => handleStartBreak("tea")}
                                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 flex items-center"
                              >
                                <Coffee className="w-4 h-4 mr-2" />
                                Tea
                              </button>
                              <button
                                onClick={() => handleStartBreak("personal")}
                                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 flex items-center"
                              >
                                <User className="w-4 h-4 mr-2" />
                                Personal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 p-0 hover:ring-2 hover:ring-primary-300 hover:ring-offset-1 focus:outline-none focus:ring-0 active:outline-none transition-all duration-200 cursor-pointer"
                  aria-haspopup="true"
                  aria-expanded={showUserDropdown}
                  aria-label="User menu"
                >
                  {user?.profilePic && !imgError ? (
                    <img
                      src={profilePicSrc}
                      alt="User Profile"
                      className="w-full h-full sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 text-xs sm:text-sm font-semibold text-white select-none">
                      {user
                        ? getDisplayName(user).trim().split(" ")[0][0]?.toUpperCase()
                        : "U"}
                    </span>
                  )}
                  {/* Status indicator */}
                  {user?.role !== RoleTypeEnum.ADMIN && todayStatus && (
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        todayStatus.checkOutTime
                          ? "bg-red-500"
                          : todayStatus.canEndBreak
                            ? "bg-yellow-500"
                            : todayStatus.checkInTime
                              ? "bg-green-500"
                              : "bg-slate-400"
                      }`}
                    ></div>
                  )}
                </button>

                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-44 sm:w-56 bg-white border border-slate-100 rounded-xl shadow-soft-hover z-50">
                    <div className="py-3 px-4 border-b border-slate-100">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {user ? user.fullName?.trim() : "Unknown User"}
                      </div>
                      {user?.role && (
                        <div className="text-xs text-slate-400 truncate font-medium">
                          {user.role}
                        </div>
                      )}
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          navigate("/my-profile");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-primary-50 hover:text-primary-700 flex items-center transition-all duration-200 font-medium"
                      >
                        <User className="w-4 h-4 mr-2.5" />
                        My Profile
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          navigate("/change-password");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-primary-50 hover:text-primary-700 flex items-center transition-all duration-200 font-medium"
                      >
                        <Lock className="w-4 h-4 mr-2.5" />
                        Change Password
                      </button>

                      <button
                        onClick={() => {
                          setLogoutWarning(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 flex items-center transition-all duration-200 font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <ConfirmationModal
        type="danger"
        title="Check Out"
        message="Are you sure you want to check out?"
        onConfirm={handleCheckOut}
        isOpen={checkOutWarning}
        onClose={() => setCheckOutWarning(false)}
        confirmText={isCheckOutLoading ? "Checking out..." : "Check Out"}
        isLoading={isCheckOutLoading}
      />

      <ConfirmationModal
        type="danger"
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={() => {
          logout.mutate();
          setLogoutWarning(false);
        }}
        isOpen={logoutWarning}
        onClose={() => setLogoutWarning(false)}
      />
    </>
  );
};

export default Header;
