import React, { useState, useEffect } from "react";
import { Users, Calendar, Clock, AlertCircle } from "lucide-react";
import { useGetRegularizationStatsQuery } from "../../store/apis/attendanceRegularization.api";
import HolidayCard from "../holiday/HolidayCard";
import EmployeeCard from "./EmployeeCard";
import BirthdayAnniversaryCard from "./BirthdayAnniversaryCard";
import RecentJoinersCard from "./RecentJoinersCard";
import MyCalendar, { CalendarCardSkeleton } from "./MyCalendar";
import { WorkflowQueryStatus } from "../../utils/constants";
import {
  BirthdayAnniversaryCardSkeleton,
  HolidaysCardSkeleton,
  MonthlyJoinersSkeleton,
  StatCardSkeleton,
  TeamStatusSkeleton,
} from "./Skeleton";
import { useAuth } from "../../store/hooks/useAuth";
import { useGetTodayStatusQuery } from "../../store/apis/attendance.api";
import { useGetStatsQuery } from "../../store/apis/user.api";
import { useGetLeavesQuery } from "../../store/apis/leave.api";
import { useGetTimesheetStatsQuery } from "../../store/apis/timesheet.api";

// ✅ 1. NATIVE BRIDGE TYPE DEFINITION
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const currentDate = new Date();

  // ✅ V2 API Hooks
  const { data: userStats, isLoading: loadingUserStats } = useGetStatsQuery();
  const { data: timesheetStats, isLoading: loadingTimesheetStats } = useGetTimesheetStatsQuery();
  const { data: pendingLeaves, isLoading: loadingPendingLeaves } = useGetLeavesQuery({
    status: WorkflowQueryStatus.PENDING,
  });
  const { data: todayStatusResponse } = useGetTodayStatusQuery(undefined, { skip: !user?.id });

  const { data: arStats, isLoading: loadingArStats } = useGetRegularizationStatsQuery();
  const arPendingCount = arStats?.pending || 0;
  const loading = loadingUserStats || loadingTimesheetStats || loadingPendingLeaves;
  // Native bridge sync using v2 today-status from Redux
  useEffect(() => {
    if (!user?.id) return;
    const statusData = todayStatusResponse?.data;
    const isActive = !!statusData?.checkInTime && !statusData?.checkOutTime;
    const bridge = window.ReactNativeWebView;
    if (bridge) {
      const messageType = isActive ? "START_MOBILE_SERVICES" : "STOP_MOBILE_SERVICES";
      bridge.postMessage(
        JSON.stringify({
          type: messageType,
          payload: {
            status: isActive ? "checked_in" : "checked_out",
            source: "admin_dashboard_sync",
          },
        })
      );
      console.log(`📦 NATIVE BRIDGE (ADMIN): Sync Fired -> ${messageType}`);
    }
  }, [user?.id, todayStatusResponse]);
  const stats = React.useMemo(() => {
    return [
      {
        title: "Total Employees",
        value: String(userStats?.totalEmployees || 0),
        change: "+0%",
        icon: Users,
        iconBg: "bg-primary-50",
        iconColor: "text-primary-600",
        trend: "up",
      },
      {
        title: "Pending Leaves",
        value: String(pendingLeaves?.total || 0),
        change: "+0%",
        icon: Calendar,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        trend: "up",
      },
      {
        title: "Pending Timesheets",
        value: String(timesheetStats?.pending || 0),
        change: timesheetStats?.change || "+0%",
        icon: Clock,
        iconBg: "bg-secondary-50",
        iconColor: "text-secondary-600",
        trend: "up",
      },
      {
        title: "AR Pending",
        value: String(arPendingCount),
        change: "+0%",
        icon: AlertCircle,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
        trend: "up",
      },
    ];
  }, [userStats, pendingLeaves, timesheetStats, arPendingCount]);

  const statCards = Array.from({ length: 4 });

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {loading
          ? statCards.map((_, index) => <StatCardSkeleton key={`skeleton-${index}`} />)
          : stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white rounded-xl shadow-soft border border-slate-100 p-3 sm:p-5 lg:p-6 hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex px-0 sm:flex-row sm:items-start sm:justify-between h-full">
                  <div className="flex-1 min-w-0 mb-3 sm:mb-0 pr-2 card-content">
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1 sm:mb-2 break-words leading-tight card-title">
                      {stat.title}
                    </p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-0 leading-tight card-value tracking-tight">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
          {loading ? <CalendarCardSkeleton /> : <MyCalendar />}
        </div>

        <div className="h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
          {loading ? <TeamStatusSkeleton /> : <EmployeeCard />}
        </div>

        <div className="h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
          {loading ? <HolidaysCardSkeleton /> : <HolidayCard />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
          {loading ? <MonthlyJoinersSkeleton /> : <RecentJoinersCard />}
        </div>

        <div className="h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
          {loading ? (
            <BirthdayAnniversaryCardSkeleton />
          ) : (
            <BirthdayAnniversaryCard />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
