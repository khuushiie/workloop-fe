import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getWorkflowStatusColor,
  isPendingWorkflowStatus,
  RoleTypeEnum,
  VIEW_MODE,
  ViewMode,
  WorkflowQueryStatus,
} from "../../../utils/constants";
import { AccordionSection } from "./types";
import { useHasPermission } from "../../../store/hooks/useRbac";
import { PERMISSIONS } from "../../../utils/rbac/permissions";
import { useGetMasterConfigByCategoryQuery, IMasterConfigOption } from "../../../store/apis/masterConfig.api";
import {
  useGetRegularizationRequestsQuery,
  useActionRegularizationMutation,
  IRegularizationRequest,
  IRegularizationFilters,
} from "../../../store/apis/attendanceRegularization.api";
import { useDebounce } from "../../../utils/debounce";
import { useAuth } from "../../../store/hooks/useAuth";
import { ApiError } from "../../../store/utils/apiError";
// IRegularizationFilters is now imported from API

export const useRegularizationManagement = () => {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;
  const isAdmin =
    currentUser?.role?.toLowerCase() === RoleTypeEnum.ADMIN?.toLowerCase() ||
    currentUser?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN?.toLowerCase();
  const canManage = useHasPermission(PERMISSIONS.REGULARIZATION_MANAGEMENT_MANAGE);

  // --- UI STATE ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeAccordion, setActiveAccordion] = useState<AccordionSection>(AccordionSection.PENDING);
  const [pendingViewMode, setPendingViewMode] = useState<ViewMode>(VIEW_MODE.ALL);
  const [historyViewMode, setHistoryViewMode] = useState<ViewMode>(VIEW_MODE.ALL);

  // --- PENDING STATE ---
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLimit, setPendingLimit] = useState(10);
  const [pendingFilters, setPendingFilters] = useState<IRegularizationFilters>({
    search: "",
    regularizationType: "",
    department: "",
    userId: "",
    fromDate: "",
    toDate: "",
  });

  // --- HISTORY STATE (Fixed to match Pending pattern) ---
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  // Changed type from RegularizationFilters to IRegularizationFilters to support search/dates
  const [historyFilters, setHistoryFilters] = useState<IRegularizationFilters>({
    search: "",
    regularizationType: "",
    department: "",
    userId: "",
    fromDate: "",
    toDate: "",
  });

  // Modal & Processing States
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<IRegularizationRequest | null>(null);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRejectAllModal, setShowRejectAllModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // --- API MUTATIONS & DATA ---
  const [actionRequest, { isLoading: isMutating }] = useActionRegularizationMutation();
  const { data: regularizationTypesData } = useGetMasterConfigByCategoryQuery("attendance_regularization_reason");
  const { data: departmentsData } = useGetMasterConfigByCategoryQuery("department");
  const { data: allRequestsData, isLoading: isEmployeeDataLoading } = useGetRegularizationRequestsQuery({
    sortBy: 'userName',
    sortOrder: 'asc',
  });

  // --- DEBOUNCERS ---
  const debouncedSearch = useDebounce(pendingFilters.search || "", 500);
  // Added specific debouncer for History search
  const debouncedHistorySearch = useDebounce(historyFilters.search || "", 500);

  // --- HANDLERS ---
  const handlePendingFilterChange = (key: keyof IRegularizationFilters, value: string) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
    setPendingPage(1);
  };

  // Added handler for History filters
  const handleHistoryFilterChange = (key: keyof IRegularizationFilters, value: string) => {
    setHistoryFilters((prev) => ({ ...prev, [key]: value }));
    setHistoryPage(1);
  };

  // --- QUERIES ---

  // 1. Pending Query
  const pendingQueryParams = useMemo(() => ({
    page: pendingPage,
    limit: pendingLimit,
    status: WorkflowQueryStatus.PENDING,
    search: debouncedSearch || undefined,
    regularizationType: pendingFilters.regularizationType || undefined,
    department: pendingFilters.department || undefined,
    userId: pendingFilters.userId || undefined,
    dateFrom: pendingFilters.fromDate || undefined,
    dateTo: pendingFilters.toDate || undefined,
    sortBy: "createdAt",
    sortOrder: "desc" as const,
    reporteesOnly: isAdmin && pendingViewMode === VIEW_MODE.REPORTEES,
  }), [pendingPage, pendingLimit, debouncedSearch, pendingFilters, isAdmin, pendingViewMode]);

  const { data: pendingResponse, isFetching: pendingLoading } = useGetRegularizationRequestsQuery(pendingQueryParams);

  // 2. History Query
  const historyQueryParams = useMemo(() => ({
    page: historyPage,
    limit: historyLimit,
    status: WorkflowQueryStatus.HISTORY,
    sortBy: "createdAt",
    sortOrder: "desc" as const,
    reporteesOnly: isAdmin && historyViewMode === VIEW_MODE.REPORTEES,
    regularizationType: historyFilters.regularizationType || undefined,
    department: historyFilters.department || undefined,
    userId: historyFilters.userId || undefined,
    search: debouncedHistorySearch || undefined,
    dateFrom: historyFilters.fromDate || undefined,
    dateTo: historyFilters.toDate || undefined,
  }), [
    historyPage,
    historyLimit,
    isAdmin,
    historyViewMode,
    historyFilters,
    debouncedHistorySearch // added dependency
  ]);

  const { data: historyResponse, isFetching: historyLoading } = useGetRegularizationRequestsQuery(historyQueryParams);

  // --- DERIVED DATA ---
  const pendingRequests = pendingResponse?.data || [];
  
  const pendingTotal = pendingResponse?.total || 0;
  const historyRequests = historyResponse?.data || [];
  const historyTotal = historyResponse?.total || 0;

  const regularizationTypeOptions = useMemo(() => {
    return (Array.isArray(regularizationTypesData) ? regularizationTypesData : []).map((type: IMasterConfigOption) => ({
      value: type.id,
      label: type.displayName,
    }));
  }, [regularizationTypesData]);

  const departments = useMemo(() => {
    return (Array.isArray(departmentsData) ? departmentsData : []).map((type: IMasterConfigOption) => ({
      value: type.id,
      label: type.displayName,
    }));
  }, [departmentsData]);

  // --- ACTIONS (Unchanged) ---
  const handleApproveClick = async (request: IRegularizationRequest) => {
    try {
      setProcessingId(request.id);
      await actionRequest({ id: request.id, body: { decision: "approved" } }).unwrap();
      toast.success("Request approved successfully");
    } catch (err: unknown) {
      const error = err as ApiError;
      const rawMessage = error?.data?.message || error?.message || "Failed to approve request";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleModalReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;
    try {
      setProcessingId(selectedRequest.id);
      await actionRequest({
        id: selectedRequest.id,
        body: { decision: "rejected", remarks: rejectReason },
      }).unwrap();
      toast.success("Request rejected successfully");
      setShowRejectModal(false);
      setRejectReason("");
    } catch (err: unknown) {
      const error = err as ApiError;
      const rawMessage = error?.data?.message || error?.message || "Failed to reject request";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveAll = async (requestIds: string[]) => {
    try {
      await Promise.all(requestIds.map((id) => actionRequest({ id, body: { decision: "approved" } }).unwrap()));
      toast.success("Requests approved successfully");
      setSelectedIds([]);
    } catch (err: unknown) {
      const error = err as ApiError;
      const rawMessage = error?.data?.message || error?.message || "Bulk approval failed";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      toast.error(errorMessage);
    }
  };

  const handleModalAllReject = async () => {
    if (!selectedRequestIds.length || !rejectReason.trim()) return;
    try {
      await Promise.all(
        selectedRequestIds.map((id) =>
          actionRequest({ id, body: { decision: "rejected", remarks: rejectReason } }).unwrap()
        )
      );
      toast.success("Requests rejected successfully");
      setShowRejectAllModal(false);
      setRejectReason("");
      setSelectedIds([]);
    } catch (err: unknown) {
      const error = err as ApiError;
      const rawMessage = error?.data?.message || error?.message || "Bulk rejection failed";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      toast.error(errorMessage);
    }
  };

  const canActOnRequest = (request: IRegularizationRequest): boolean => {
    if (!canManage) return false;
    if (isAdmin) return true;
    return (request as any).currentActorIds.includes(currentUserId);
  };

  return {
    isAdmin,
    activeAccordion,
    toggleAccordion: (section: AccordionSection) => {
      setActiveAccordion((prev) =>
        prev === section
          ? section === AccordionSection.PENDING
            ? AccordionSection.HISTORY
            : AccordionSection.PENDING
          : section
      );
    },
    // Data & Loading
    pendingRequests,
    pendingLoading,
    pendingPage,
    setPendingPage,
    pendingLimit,
    setPendingLimit,
    pendingTotal,
    pendingViewMode,
    setPendingViewMode,
    historyRequests,
    historyLoading,
    historyPage,
    setHistoryPage,
    historyLimit,
    setHistoryLimit,
    historyTotal,
    historyFilters,
    historyViewMode,
    setHistoryFilters,
    setHistoryViewMode,

    pendingFilters,
    setPendingFilters,
    handlePendingFilterChange,
    handleHistoryFilterChange, // Exported new handler

    employeeLoading: isEmployeeDataLoading,
    departments,
    regularizationTypeOptions,
    // Modals & Action Status
    selectedRequest,
    showDetailsModal,
    setShowDetailsModal,
    showRejectModal,
    setShowRejectModal,
    showRejectAllModal,
    setShowRejectAllModal,
    rejectReason,
    setRejectReason,
    processing: processingId,
    loadingApprove: isMutating,
    loadingReject: isMutating,
    selectedIds,
    setSelectedIds,
    // Handlers
    handleViewDetails: (req: IRegularizationRequest) => {
      setSelectedRequest(req);
      setShowDetailsModal(true);
    },
    handleApproveClick,
    handleRejectClick: (req: IRegularizationRequest) => {
      setSelectedRequest(req);
      setRejectReason("");
      setShowRejectModal(true);
    },
    handleRejectAll: (ids: string[]) => {
      setSelectedRequestIds(ids);
      setRejectReason("");
      setShowRejectAllModal(true);
    },
    handleModalReject,
    handleModalAllReject,
    canActOnRequest,
    getStatusColor: getWorkflowStatusColor,
    handleApproveAll,
  };
};