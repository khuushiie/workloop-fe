import React, { useMemo } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { RoleTypeEnum } from "../../utils/constants";
import { getDisplayName } from "../../utils/nameUtils";
import FilterWrapper from "../common/FilterWrapper";
import {
  AttendanceFilters,
  AttendanceLegend,
  AttendanceTable,
  useAttendance,
} from "./index";
import { AttendanceTableSkeleton } from "./Skeleton";
import { useAuth } from "../../store/hooks/useAuth";

const AttendanceReports: React.FC = () => {
  const { user } = useAuth();
  const canManageReports = useHasPermission(
    PERMISSIONS.REPORTS_ATTENDANCE_MANAGE
  );
  const isHrUser = user?.department === RoleTypeEnum.HR;
  const isAdminRole =
    user?.role?.toLowerCase() === RoleTypeEnum.ADMIN?.toLowerCase() || user?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN?.toLowerCase();
  const isAdminView = Boolean(isHrUser || isAdminRole);

  const showAdvancedFilters = Boolean(canManageReports);
  const isManagerRole =
    user?.role?.toLowerCase() === RoleTypeEnum.MANAGER?.toLowerCase();

  const isManagerView = !isAdminView && isManagerRole;

  const {
    holidays,
    loading,
    error,
    success,
    filters,
    handleFilterChange,
    employeeSearch,
    setEmployeeSearch,
    departments,
    statuses,
    pagination,
    handlePageChange,
    handleItemsPerPageChange,
    hasAdminAccess,
    hasManagerAccess,
    downloadReportExcel,
    isDownloadingExcel,
    // User-centric data from backend (each user has their attendance data embedded)
    users,
  } = useAttendance({
    isAdmin: isAdminView,
    isManager: isManagerView,
  });


  const currentUserData = useMemo(() => {
    if (!user?.id) return null;
    return {
      _id: user.id,
      name: getDisplayName(user),
      workEmail: user.workEmail,
      department: user.department || "",
      employeeId: user.employeeId,
      status: "active" as const,
      attendanceStatus: {},
      summary: {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        halfDays: 0,
        leaveDays: 0,
        totalLeaves: 0,
        totalWorkHours: 0,
        totalBreakHours: 0,
        netWorkHours: 0,
      },
      attendanceRecords: [],
    };
  }, [user]);

  // Users are already filtered and paginated by the backend
  // Only need to move current user to top if needed
  const scopedUsers = useMemo(() => {
    // Use backend users if available, otherwise fall back to current user
    let baseList: typeof users;
    if (users.length > 0) {
      baseList = [...users];
    } else if (currentUserData) {
      baseList = [currentUserData];
    } else {
      baseList = [];
    }

    // Move current user to top of list
    if (user?.id && baseList.length > 1) {
      const currentUserIndex = baseList.findIndex(
        (u) => u._id === user.id
      );
      if (currentUserIndex > 0) {
        const [currentUserRecord] = baseList.splice(currentUserIndex, 1);
        return [currentUserRecord, ...baseList];
      }
    }

    return baseList;
  }, [users, currentUserData, user?.id]);

  const canViewMultiple = hasAdminAccess || hasManagerAccess;

  const handleExport = async () => {
    try {
      await downloadReportExcel();
    } catch {
      // Error already logged in useAttendance
    }
  };

  return (
    <div className="p-6">
     <div className="mb-4">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
        Attendance Reports
      </h1>
     </div>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <FilterWrapper>
        <AttendanceFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          departments={departments}
          statuses={statuses}
          loading={loading}
          isAdmin={showAdvancedFilters}
          employeeSearch={showAdvancedFilters ? employeeSearch : ""}
          onEmployeeSearchChange={
            showAdvancedFilters ? setEmployeeSearch : undefined
          }
        />
      </FilterWrapper>

      {loading? <AttendanceTableSkeleton /> : <AttendanceTable
        users={scopedUsers}
        holidays={holidays}
        filters={filters}
        loading={loading}
        isAdmin={canViewMultiple}
        pagination={canViewMultiple ? pagination : undefined}
        onPageChange={canViewMultiple ? handlePageChange : undefined}
        onItemsPerPageChange={
          canViewMultiple ? handleItemsPerPageChange : undefined
        }
        currentUser={currentUserData}
        onExport={handleExport}
        isExporting={isDownloadingExcel}
      />}
      

      <AttendanceLegend />
    </div>
  );
};

export default AttendanceReports;
