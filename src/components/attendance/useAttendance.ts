import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../store/hooks/useAuth";
import { apiService } from "../../services/api";
import {
  AttendanceRecord,
  LeaveRequest,
  Employee,
  AttendanceFilters,
  UserAttendanceData,
} from "./types";
import { RoleTypeEnum } from "../../utils/constants";
import { 
  useGetAttendanceReportQuery,
  useLazyGetAttendanceReportDownloadQuery,
} from "../../store/apis/attendance.api"; 
import { useGetMasterConfigByCategoryQuery } from "../../store/apis/masterConfig.api";

interface IHoliday {
  date: string;
  isMandatory: boolean;
  name?: string;
  [key: string]: unknown;
}

interface UseAttendanceProps {
  isAdmin?: boolean;
  isManager?: boolean;
}

export const useAttendance = ({
  isAdmin = false,
  isManager = false,
}: UseAttendanceProps = {}) => {
  const { user } = useAuth();
  
  // State for data display
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<IHoliday[]>([]);
  const [users, setUsers] = useState<UserAttendanceData[]>([]);
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [employeeSearch, setEmployeeSearch] = useState<string>("");
  
  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Access Control
  const isHrUser = user?.role?.toLowerCase() === RoleTypeEnum.HR?.toLowerCase();
  const isManagerUser = isManager || user?.role?.toLowerCase() === RoleTypeEnum.MANAGER?.toLowerCase();
  const hasAdminAccess = isAdmin || isHrUser;
  const hasManagerAccess = !hasAdminAccess && isManagerUser;

  // Initial Filters
  const currentDate = new Date();
  const [filters, setFilters] = useState<AttendanceFilters>({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    department: "",
    employeeId: "",
    isActive: "all",
  });

  // --- 1. REPLACED: Fetch Departments (RTK Query) ---
  const { data: departmentConfigs } = useGetMasterConfigByCategoryQuery("department", {
  });


  // --- 2. REPLACED: Fetch Statuses (RTK Query) ---
  const { data: statusConfigs } = useGetMasterConfigByCategoryQuery("employment_status", {
    skip: !hasAdminAccess, // Only fetch if admin
  });

  // --- 3. DERIVE DATA: Keep full master config options (id = ObjectId for API, displayName for label)
  const departments = useMemo(() => {
    if (!departmentConfigs) return [];
    return departmentConfigs.map((d) => ({ id: d.id, displayName: d.displayName }));
  }, [departmentConfigs]);

  const statuses = useMemo(() => {
    if (!statusConfigs) return [];
    return statusConfigs.map((s) => ({ id: s.id, displayName: s.displayName ?? s.filterCode }));
  }, [statusConfigs]);


  // --- 4. ATTENDANCE REPORT QUERY ---
  const queryParams = useMemo(() => {
    let statusFilter = filters.statuses;
    if (!statusFilter && filters.isActive && filters.isActive !== "all") {
      if (filters.isActive === "active") {
        statusFilter = "active";
      } else if (filters.isActive === "inactive") {
        statusFilter = "inactive,terminated";
      }
    }

    return {
      month: filters.month,
      year: filters.year,
      department: filters.department,
      userId: filters.employeeId,
      search: employeeSearch,
      page: pagination.page,
      statuses: filters.statuses,
      limit: pagination.limit,
    };
  }, [filters, employeeSearch, pagination.page, pagination.limit,filters.statuses]);

  const { 
    data: reportResponse, 
    isLoading: isReportLoading, 
    isFetching: isReportFetching,
    error: reportError,
    refetch: fetchAttendanceReport 
  } = useGetAttendanceReportQuery(queryParams, {
    refetchOnMountOrArgChange: true, 
  });

  const [triggerDownload, { isLoading: isDownloadingExcel }] =
    useLazyGetAttendanceReportDownloadQuery();

  // --- 5. PROCESS RESPONSE DATA ---
  useEffect(() => {
    if (reportResponse?.data) {
      const data = reportResponse.data;

      setUsers(data.users || []);
      setHolidays(data.holidays || []);
      
      const extractedEmployees: Employee[] = (data.users || []).map((u: UserAttendanceData) => ({
        _id: u._id,
        name: u.name,
        workEmail: u.workEmail,
        department: u.department,
        employeeId: u.employeeId,
        firstName: u.firstName,
        lastName: u.lastName,
        joiningDate: u.joiningDate,
        status: u.status,
        deactivatedAt: u.deactivatedAt,
        terminatedAt: u.terminatedAt,
      }));
      setEmployees(extractedEmployees);

      const allRecords: AttendanceRecord[] = [];
      for (const u of data.users || []) {
        allRecords.push(...(u.attendanceRecords || []));
      }
      setAttendanceRecords(allRecords);

      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
        }));
      }
      
      setError(null);
    } 
    
    if (reportError) {
      console.error("Attendance Report Error:", reportError);
      setError("Failed to fetch attendance report");
    }
  }, [reportResponse, reportError]);

  // --- 6. VISIBLE EMPLOYEES LOGIC ---
  const [visibleEmployees, setVisibleEmployees] = useState<Employee[]>([]);
  
  useEffect(() => {
    if (employees.length > 0) {
      if (hasManagerAccess && user?.id) {
        const sorted = [...employees].sort((a, b) => {
          if (a._id === user.id) return -1;
          if (b._id === user.id) return 1;
          return 0;
        });
        setVisibleEmployees(sorted);
      } else {
        setVisibleEmployees(employees);
      }
    } else {
      setVisibleEmployees([]);
    }
  }, [employees, hasManagerAccess, user?.id]);

  // --- ACTIONS ---

  const handleFilterChange = <K extends keyof AttendanceFilters>(key: string, value: AttendanceFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (["department", "statuses", "employeeId", "isActive", "month", "year"].includes(key)) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const toggleFilters = () => setShowFilters(!showFilters);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleEmployeeSearchChange = (value: string) => {
    setEmployeeSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  return {
    // Data
    attendanceRecords,
    employees,
    visibleEmployees,
    departments, 
    statuses,
    leaveRequests,
    holidays,
    users, 
    
    // UI State
    loading: isReportLoading || isReportFetching, 
    error,
    success,
    filters,
    showFilters,
    user,
    employeeSearch,
    pagination,

    // Access
    isHrUser,
    hasAdminAccess,
    hasManagerAccess,

    // Actions
    setFilters,
    handleFilterChange,
    toggleFilters,
    clearError,
    clearSuccess,
    fetchAttendanceReport, 
    setEmployeeSearch: handleEmployeeSearchChange,
    handlePageChange,
    handleItemsPerPageChange,

    // Excel download from backend (uses same filters: month, year, search, department, statuses, userId)
    downloadReportExcel: async () => {
      try {
        const blob = await triggerDownload(queryParams).unwrap();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const dateStr = new Date().toISOString().slice(0, 10);
        link.download = `attendance-report-${dateStr}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to download attendance report:", err);
        throw err;
      }
    },
    isDownloadingExcel,
  };
};