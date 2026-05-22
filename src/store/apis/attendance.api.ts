import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import {
    setAttendanceState,
    markCheckIn,
    markCheckOut,
    markBreakStart,
    markBreakEnd,
    AttendanceStatus
} from "../slices/attendanceSlice";
// Assuming you keep the event service for non-redux side effects (like socket emits)
import { attendanceEventService } from "../../services/attendanceEvents";

// --- Interfaces (Adapted from your old code) ---

export interface ILocation {
    latitude: number;
    longitude: number;
    accuracy: number;
}

// Request Interfaces
export interface ICheckInRequest {
    date: string;
    checkInTime: string;
    checkInLocation: ILocation;
}

export interface ICheckOutRequest {
    date: string;
    checkOutTime: string;
    checkOutLocation: ILocation;
}

export interface IBreakRequest {
    date: string;
    startTime: string;
    type: "lunch" | "tea" | "personal";
}

export interface IEndBreakRequest {
    date: string;
    endTime: string;
}

// Filter Interfaces
export interface IAttendanceReportParams {
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    isHalfDay?: boolean;
    month?: number;
    year?: number;
    department?: string;
    search?: string;
    statuses?: string;
    employeeId?: string;
    page?: number;
    limit?: number;
}

export interface ICalendarDay {
  day: number;
  date: string;
  status: string;
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalWorkHours?: number;
  netWorkHours?: number;
  isRegularized?: boolean;
  isHoliday?: boolean;
  isWeekend?: boolean;
  holidayName?: string;
  leaveType?: string;
}

export interface ICalendarHoliday {
  _id: string;
  name: string;
  date: string;
  description?: string;
  isMandatory?: boolean;
  year?: number;
}

export interface ICalendarResponse {
  month: number;
  year: number;
  days: ICalendarDay[];
  holidays: ICalendarHoliday[];
}

export interface IOfficeLocation {
  latitude: number;
  longitude: number;
  radius?: number;
  name?: string;
  address?: string;
}

export interface IAttendanceReportData {
  data: IAttendance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAttendanceStats {
  totalPresent?: number;
  totalAbsent?: number;
  totalHalfDay?: number;
  totalLeave?: number;
  totalLate?: number;
  totalWorkingDays?: number;
  averageWorkHours?: number;
  totalRegularizations?: number;
}

export interface IEmployeeListItem {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  workEmail: string;
  department?: string;
  position?: string;
  status?: string;
}

export interface IDepartment {
  _id?: string;
  name: string;
  code?: string;
}

export interface IBulkAttendanceUpdate {
  userId: string;
  date: string;
  status: string;
  isHalfDay?: boolean;
  notes?: string;
}

// Response Interfaces (Generic wrapper assumed)

export interface ILocation {
  latitude: number;
  longitude: number;
}


export interface IBreak {
  id?: string;
  startTime: string;
  endTime?: string;
  type?: string;
  duration?: number;
}

export interface IAttendance {
  id: string;
  userId: string;

  date: string;

  checkInTime?: string;
  checkOutTime?: string;

  checkInLocation?: ILocation;
  checkOutLocation?: ILocation;

  breaks: IBreak[];

  status: "present" | "absent" | "half-day" | string;

  totalWorkHours: number;
  netWorkHours: number;

  isRegularized: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ITodayStatus {
  id: string;
  status: "present" | "absent" | "half-day" | string;
  message: string;

  canCheckIn: boolean;
  canCheckOut: boolean;
  canStartBreak: boolean;
  canEndBreak: boolean;

  date: string;

  checkInTime: string | null;
  checkOutTime: string | null;

  totalWorkHours: number;
  totalBreakHours: number;
  netWorkHours: number;

  breaks: IBreak[];
  activeBreak: IBreak | null;
}


export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  statusCode: number;
}



// --- API Definition ---

export const attendanceApi = createApi({
    reducerPath: "attendanceApi",
    baseQuery: baseQuery,
    tagTypes: ["Attendance", "AttendanceHistory", "Employees", "Stats"],

    endpoints: (builder) => ({

        // ==========================================
        // USER ACTIONS (Mutations)
        // ==========================================

        checkIn: builder.mutation<IApiResponse<IAttendance>, ICheckInRequest>({
            query: (body) => ({
                url: "v2/attendance/check-in",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Attendance", "AttendanceHistory"],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // 1. Update Redux State
                    dispatch(markCheckIn({ time: arg.checkInTime }));
                    // 2. Trigger legacy event service
                    if (data.data?.userId) attendanceEventService.onAttendanceUpdate(data.data.userId);
        } catch {}
            },
        }),

        checkOut: builder.mutation<IApiResponse<IAttendance>, ICheckOutRequest>({
            query: (body) => ({
                url: "v2/attendance/check-out",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Attendance", "AttendanceHistory"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(markCheckOut()) 
                    if (data.data?.userId) attendanceEventService.onAttendanceUpdate(data.data.userId);
                    console.log(data);
                } catch {}
            },
        }),

        startBreak: builder.mutation<IApiResponse<IAttendance>, IBreakRequest>({
            query: (body) => ({
                url: "v2/attendance/break/start",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Attendance"],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(markBreakStart({ time: arg.startTime }));
                    const userStr = localStorage.getItem("hrms_user");
                    if (userStr) attendanceEventService.onAttendanceUpdate(JSON.parse(userStr).id);
        } catch {}
            },
        }),

        endBreak: builder.mutation<IApiResponse<IAttendance>, IEndBreakRequest>({
            query: (body) => ({
                url: "v2/attendance/break/end",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Attendance"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(markBreakEnd());
                    const userStr = localStorage.getItem("hrms_user");
                    if (userStr) attendanceEventService.onAttendanceUpdate(JSON.parse(userStr).id);
        } catch {}
            },
        }),

        // ==========================================
        // DATA FETCHING (Queries)
        // ==========================================

        // 1. Get Today's Status (Critical for initializing UI state)
        getTodayStatus: builder.query<IApiResponse<ITodayStatus>, void>({
            query: () => ({
                url: "v2/attendance/today-status",
                method: "GET",
            }),
            providesTags: ["Attendance"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const record = data?.data;

                    // Logic to map Backend Response -> Frontend Status State
                    let status: AttendanceStatus = "IDLE";
                    let breakStart = undefined;

                    if (record) {
                        // Adapt these conditions based on your exact backend response shape
                        if (record.checkOutTime) {
                            status = "COMPLETED";
                        } else if (record.activeBreak) {
                            status = "ON_BREAK";
                            breakStart = record.activeBreak.startTime;
                        } else if (record.checkInTime) {
                            status = "WORKING";
                        }

                        dispatch(setAttendanceState({
                            status,
                            checkInTime: record.checkInTime,
                            breakStartTime: breakStart
                        }));
                    }
                } catch (err) {
                    // Optional: If 404 means "not checked in yet", handle it here
                }
            },
        }),

        // 1b. Get status for a specific date (v2 today-status with date query) – for regularization form/details only
        getTodayStatusByDate: builder.query<IApiResponse<ITodayStatus>, string | undefined>({
            query: (date) => ({
                url: "v2/attendance/today-status",
                method: "GET",
                params: date ? { date } : {},
            }),
            providesTags: ["Attendance"],
        }),

        // 2. My History
        getMyAttendanceHistory: builder.query<IApiResponse<IAttendance[]>, { startDate?: string; endDate?: string }>({
            query: (params) => ({
                url: "v2/attendance/my-attendance",
                method: "GET",
                params, // RTK automatically serializes this to query string
            }),
            providesTags: ["AttendanceHistory"],
        }),

        // 3. My Specific Date
        getMyAttendanceByDate: builder.query<IApiResponse<IAttendance>, string>({
            query: (date) => `v2/attendance/my-attendance/${date}`,
        }),

        // 4. Calendar View
        getCalendarData: builder.query<IApiResponse<ICalendarResponse>, { month: number; year: number; userId?: string }>({
            query: (params) => ({
                url: "v2/attendance/calendar",
                method: "GET",
                params: {
                    month: params.month,
                    year: params.year,
                    userId: params.userId
                },
            }),
        }),

        // 5. Office Config
        getOfficeLocation: builder.query<IApiResponse<IOfficeLocation>, void>({
            query: () => "v2/attendance/office-location",
        }),

        // ==========================================
        // ADMIN / REPORTING
        // ==========================================

        getAttendanceReport: builder.query<IApiResponse<IAttendanceReportData>, IAttendanceReportParams>({
            query: (params) => {
                const cleanedParams = Object.fromEntries(
                    Object.entries(params).filter(([_, v]) => v != null && v !== "")
                );
                return {
                    url: "v2/attendance/report",
                    method: "GET",
                    params: cleanedParams, 
                };
            },
            providesTags: ["AttendanceHistory"],
        }),

        getAttendanceReportDownload: builder.query<
            Blob,
            IAttendanceReportParams | void
        >({
            query: (params) => {
                const safeParams = (params ?? {}) as Record<string, unknown>;
                const cleanedParams = Object.fromEntries(
                    Object.entries(safeParams).filter(
                        ([_, v]) => v != null && v !== ""
                    )
                );
                return {
                    url: "v2/attendance/report/doc",
                    method: "GET",
                    params: cleanedParams,
                    responseHandler: (response) => response.blob(),
                };
            },
            keepUnusedDataFor: 0,
        }),

        getAttendanceStats: builder.query<IApiResponse<IAttendanceStats>, { userId?: string; startDate?: string; endDate?: string }>({
            query: (params) => ({
                url: "v2/attendance/stats",
                method: "GET",
                params,
            }),
            providesTags: ["Stats"],
        }),

        getEmployees: builder.query<IApiResponse<IEmployeeListItem[]>, { search?: string; year?: number; month?: number }>({
            query: (params) => ({
                url: "v2/employees",
                method: "GET",
                params: {
                    ...params,
                    status: "active"
                },
            }),
            providesTags: ["Employees"],
        }),

        getDepartments: builder.query<IApiResponse<IDepartment[]>, void>({
            query: () => "v2/employees/departments",
        }),

        // Admin Update
        updateAttendanceStatus: builder.mutation<IApiResponse<void>, { attendanceId: string; status: string; isHalfDay?: boolean; notes?: string }>({
            query: ({ attendanceId, ...body }) => ({
                url: `v2/attendance/status/${attendanceId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["AttendanceHistory", "Stats"],
        }),

        bulkUpdateAttendance: builder.mutation<IApiResponse<void>, { attendances: IBulkAttendanceUpdate[] }>({
            query: (body) => ({
                url: "v2/attendance/bulk-update",
                method: "POST",
                body,
            }),
            invalidatesTags: ["AttendanceHistory", "Stats"],
        }),
    }),

});

export const {
    useCheckInMutation,
    useCheckOutMutation,
    useStartBreakMutation,
    useEndBreakMutation,
    useGetTodayStatusQuery,
    useLazyGetTodayStatusByDateQuery,
    useGetMyAttendanceHistoryQuery,
    useGetCalendarDataQuery,
    useLazyGetCalendarDataQuery,
    useGetOfficeLocationQuery,
    useGetAttendanceReportQuery,
    useLazyGetAttendanceReportDownloadQuery,
    useGetAttendanceStatsQuery,
    useGetEmployeesQuery,
    useGetDepartmentsQuery,
    useUpdateAttendanceStatusMutation,
    useBulkUpdateAttendanceMutation,

} = attendanceApi;