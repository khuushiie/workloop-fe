import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  User,
} from "lucide-react";
import { useAuth } from "../../store/hooks/useAuth";
import { useGetTodayStatusQuery } from "../../store/apis/attendance.api";
import HolidayCard from "../holiday/HolidayCard";
import EmployeeCard from "./EmployeeCard";
import BirthdayAnniversaryCard from "./BirthdayAnniversaryCard";
import RecentJoinersCard from "./RecentJoinersCard";
import MyCalendar, { CalendarCardSkeleton } from "./MyCalendar";
import { RoleTypeEnum } from "../../utils/constants";
import { formatDate } from "../../utils/timeUtils";
import { BirthdayAnniversaryCardSkeleton, EmployeeInfoSkeleton, HolidaysCardSkeleton, MonthlyJoinersSkeleton, TeamStatusSkeleton } from "./Skeleton";
import { capitalizeWords } from "../../utils/nameUtils";
import { useGetUserByIdQuery, useGetAdminDashboardStatsQuery } from "../../store/apis/user.api";
import { useSignedUrl } from "../../store/hooks/useSignedUrl";
import { SimpleTooltip } from "../common";

// ✅ 1. NATIVE BRIDGE TYPE DEFINITION
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin =
  user?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN.toLowerCase();
  const isAdminLike = !!(
    user?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN.toLowerCase() ||
    user?.role?.toLowerCase() === RoleTypeEnum.ADMIN.toLowerCase()
  );
  const [imgError, setImgError] = useState(false);

  const { data: employeeData, isLoading: loadingEmployee } = useGetUserByIdQuery(user?.id || "", {
    skip: !user?.id,
  });
  const profilePicSrc = useSignedUrl(employeeData?.profilePic);
  const { data: adminStats, isLoading: loadingAdminStats } = useGetAdminDashboardStatsQuery(undefined, {
    skip: !user?.id || !isAdminLike,
  });

  const loading = loadingEmployee || (isAdminLike && loadingAdminStats);
  const { data: todayStatusResponse } = useGetTodayStatusQuery(undefined, { skip: !user?.id });
  const [_attendanceStatus, setAttendanceStatus] = useState<string>("checked_out");

  // ✅ NATIVE BRIDGE SYNC – uses v2 attendance today-status API
  useEffect(() => {
    if (!user?.id) return;
    const statusData = todayStatusResponse?.data;
    const isActive = !!statusData?.checkInTime && !statusData?.checkOutTime;
    const currentStatus = isActive ? "checked_in" : "checked_out";
    setAttendanceStatus(currentStatus);

    const bridge = window.ReactNativeWebView;
    if (bridge) {
      const messageType = isActive ? "START_MOBILE_SERVICES" : "STOP_MOBILE_SERVICES";
      bridge.postMessage(
        JSON.stringify({
          type: messageType,
          payload: {
            status: currentStatus,
            checkInTime: statusData?.checkInTime ?? null,
            source: "dashboard_sync",
          },
        })
      );
      console.log(`📦 NATIVE BRIDGE: Projection Sync Fired -> ${messageType}`);
    }
  }, [user?.id, todayStatusResponse]);

  // Dashboard stats from single API GET /v2/users/dashboard/admin-stats
  const dashboardData = React.useMemo(() => ({
    leaveBalance: adminStats?.leaveBalance ?? 0,
    hoursThisMonth: adminStats?.timesheetHoursThisMonth ?? 0,
    approvedLeaves: adminStats?.leaveApproved ?? 0,
    pendingTimesheetRequests: adminStats?.pendingTimesheetRequests ?? 0,
  }), [adminStats]);

  const stats = [
    {
      title: "Leave Balance",
      value: `${dashboardData.leaveBalance} days`,
      change:
        dashboardData.leaveBalance > 0
          ? `+${dashboardData.leaveBalance} days`
          : "0 days",
      icon: Calendar,
      iconBg: "bg-primary-50",
      iconColor: "text-primary-600",
      description: "Remaining this year",
    },
    {
      title: "Hours This Month",
      value: `${Number(dashboardData.hoursThisMonth).toFixed(2)} hrs`,
      change: dashboardData.hoursThisMonth > 160 ? "+8 hrs" : "-8 hrs",
      icon: Clock,
      iconBg: "bg-secondary-50",
      iconColor: "text-secondary-600",
      description: "Target: 168 hrs",
    },
    {
      title: "Approved Leaves",
      value: `${dashboardData.approvedLeaves}`,
      change:
        dashboardData.approvedLeaves > 0
          ? `+${dashboardData.approvedLeaves}`
          : "0",
      icon: CheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      description: "This quarter",
    },
    {
      title: "Pending Timesheet Requests",
      value: `${dashboardData.pendingTimesheetRequests}`,
      change:
        dashboardData.pendingTimesheetRequests > 0
          ? `+${dashboardData.pendingTimesheetRequests}`
          : "0",
      icon: FileText,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      description: "Awaiting approval",
    },
  ];

  const capitalize = (value = "") =>
    value
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {isAdminLike && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 my-0">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-soft border border-slate-100 p-3 sm:p-4 md:p-6 hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-500 mb-1">
                {stat.title}
              </h3>
              <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-slate-400 font-medium">{stat.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {!isSuperAdmin && (employeeData || loading) && (
          loading ? (
            <EmployeeInfoSkeleton />
          ) : (
            <div className="bg-white rounded-xl shadow-soft border border-slate-100 p-4 sm:p-6 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col hover:shadow-soft-hover transition-all duration-200">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  Employee Information
                </h2>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top Section (Profile Pic & Name) - Added shrink-0 and pb-4 so it stays fixed */}
                <div className="flex items-start space-x-4 shrink-0 pb-4">
                  <div className="flex-shrink-0">
                    {employeeData?.profilePic && !imgError ? (
                      <img
                        src={profilePicSrc}
                        alt="Profile Picture"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover flex-shrink-0"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-brand-button">
                        <span className="text-white text-xl sm:text-2xl font-extrabold">
                          {employeeData?.firstName?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 tracking-tight">
                      {capitalize(employeeData?.firstName || "")}
                      {employeeData?.lastName ? ` ${capitalize(employeeData?.lastName)}` : ""}
                    </h3>
                    <p className="text-sm text-slate-500 mb-1 ">
                      <SimpleTooltip side="bottom" delay={500} className="truncate" label={employeeData?.workEmail || "N/A"}>
                        {employeeData?.workEmail || "N/A"}
                      </SimpleTooltip>
                    </p>
                    <p className="text-sm text-slate-500">{employeeData?.employeeId}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex-1 overflow-y-auto scrollbar-thin pr-2">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400 shrink-0 font-medium">Department:</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {capitalizeWords(
                          employeeData?.departmentName ?? employeeData?.department ?? ""
                        ) || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400 shrink-0 font-medium">Position:</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {capitalizeWords(
                          employeeData?.designationName ?? employeeData?.designation ?? ""
                        ) || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400 shrink-0 font-medium">Functional Manager:</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {capitalizeWords(employeeData?.functionalManagerName) || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400 shrink-0 font-medium">Reporting Manager:</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {capitalizeWords(employeeData?.reportingManagerName) || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400 shrink-0 font-medium">Phone:</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {employeeData?.phone ? `+91 ${employeeData.phone}` : "Not Provided"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400 shrink-0 font-medium">Date of Joining:</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {employeeData?.joinDate ? formatDate(employeeData?.joinDate) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )
        }
        <div className="h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
          {loading ? <TeamStatusSkeleton /> : <EmployeeCard />}
        </div>

        <div className="h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
          {loading ? <CalendarCardSkeleton /> : <MyCalendar />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] ">
          {loading ? <HolidaysCardSkeleton /> : <HolidayCard />}
        </div>

        <div className="h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
          {loading ? <MonthlyJoinersSkeleton /> : <RecentJoinersCard />}
        </div>

        <div className="h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
          {loading ? <BirthdayAnniversaryCardSkeleton /> : <BirthdayAnniversaryCard />}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
