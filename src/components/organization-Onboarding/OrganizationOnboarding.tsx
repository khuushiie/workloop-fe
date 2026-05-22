import React, { useEffect, useMemo, useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetOrganizationsQuery,
  useGetOrganizationStatsQuery,
  useGetOrganizationByIdQuery,
  useDeleteOrganizationMutation,
  useLazyDownloadOrganizationsQuery,
} from "../../store/apis/organization.api";
import {
  useGetMasterConfigByCategoryQuery,
  type IMasterConfigOption,
} from "../../store/apis/masterConfig.api";
import type {
  IOrganizationListItem,
  IOrganizationQueryParams,
} from "../../types/organization.types";
import { useDebounce, DEBOUNCE_DELAYS } from "../../utils/debounce";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import FilterWrapper from "../common/FilterWrapper";
import { Button } from "../common";
import { ConfirmationModal } from "../common/ConfirmationModal";
import type { SelectOption } from "../common/Select";
import OrganizationStatsCards, {
  IOrganizationStats,
} from "./sub-component/OrganizationStats";
import OrganizationFilters from "./sub-component/OrganizationFilters";
import OrganizationTableSection from "./sub-component/OrganizationTableSection";
import { StatCardSkeleton } from "../employees/Skeleton"; // reuse existing skeleton
import AddOrganizationModal from "./sub-component/AddOrganizationModal";
import ViewOrganizationModal from "./sub-component/ViewOrganizationModal";
import { useGetPermissionTreeQuery } from "../../store/apis/rbac.api";
import { MasterConfigCategory } from "../../constants";
import {
  OrganizationFiltersSkeleton,
  OrganizationTableSectionSkeleton,
} from "./sub-component/OrganizationSkeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormMode = "create" | "edit" | "view";

interface IModalState {
  open: boolean;
  mode: FormMode;

  selectedId: string | null;
}

interface IDeleteState {
  open: boolean;
  organizationId: string | null;
}

interface IFiltersState {
  search: string;
  status: string;
}

interface IPaginationState {
  page: number;
  limit: number;
  total: number;
}

// ─── Stat mapping ─────────────────────────────────────────────────────────────

const mapStatsFromApi = (api: {
  total: number;
  active: number;
  inactive: number;
}): IOrganizationStats => ({
  total: api.total,
  active: api.active,
  inactive: api.inactive,
});

// ─── Component ────────────────────────────────────────────────────────────────

const OrganizationOnboarding: React.FC = () => {
  const canManage = useHasPermission(
    PERMISSIONS.ORGANIZATION_ONBOARDING_MANAGE,
  );

  // ── Filters & Pagination ──────────────────────────────────────────────────

  const [filters, setFilters] = useState<IFiltersState>({
    search: "",
    status: "",
  });

  const debouncedSearch = useDebounce(filters.search, DEBOUNCE_DELAYS.SEARCH);

  const [pagination, setPagination] = useState<IPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  });

  // ── API Queries ───────────────────────────────────────────────────────────
  const queryParams = useMemo<IOrganizationQueryParams>(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
    }),
    [pagination.page, pagination.limit, debouncedSearch, filters.status],
  );

  const {
    data: OrganizationsPayload,
    isLoading: listLoading,
    error: listErrorResponse,
    refetch: refetchOrganizations,
  } = useGetOrganizationsQuery(queryParams);

  const { data: statsPayload, isLoading: statsLoading } =
    useGetOrganizationStatsQuery();

  const [deleteOrganization] = useDeleteOrganizationMutation();

  const { data: permissionTreeData } = useGetPermissionTreeQuery({
    modulesOnly: true,
  });

  const { data: organizationStatusList, isLoading: statusLoading } =
    useGetMasterConfigByCategoryQuery(MasterConfigCategory.ORGANIZATION_STATUS);

  const statusOptions: SelectOption[] = useMemo(
    () =>
      (organizationStatusList ?? []).map((item: IMasterConfigOption) => ({
        value: item.id,
        label: item.displayName,
      })),
    [organizationStatusList],
  );
  // ── Derived state ─────────────────────────────────────────────────────────

  const Organizations: IOrganizationListItem[] =
    OrganizationsPayload?.data ?? [];

  const paginationMeta = OrganizationsPayload?.pagination;

  const listError =
    listErrorResponse && !listLoading ? "Failed to load organizations" : "";

  const stats: IOrganizationStats = statsPayload
    ? mapStatsFromApi(statsPayload)
    : { total: 0, active: 0, inactive: 0 };

  const [downloadOrganizations] = useLazyDownloadOrganizationsQuery();

  // ── Side effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (paginationMeta) {
      setPagination((prev) => ({ ...prev, total: paginationMeta.total }));
    }
  }, [paginationMeta]);

  // ── Modal state ───────────────────────────────────────────────────────────

  const [modalState, setModalState] = useState<IModalState>({
    open: false,
    mode: "create",
    selectedId: null,
  });

  const [deleteState, setDeleteState] = useState<IDeleteState>({
    open: false,
    organizationId: null,
  });

  const { data: selectedDetail, isFetching: detailLoading } =
    useGetOrganizationByIdQuery(modalState.selectedId as string, {
      skip: !modalState.open || !modalState.selectedId,
    });

  // CACHE the detail to prevent modal flicker
  const stableSelectedDetail = useMemo(() => {
    return selectedDetail ?? null;
  }, [selectedDetail]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    if (!canManage) return;
    setModalState({ open: true, mode: "create", selectedId: null });
  };

  const handleOpenEdit = (Organization: IOrganizationListItem) => {
    if (!canManage) return;
    setModalState({ open: true, mode: "edit", selectedId: Organization.id });
  };

  const handleOpenView = (Organization: IOrganizationListItem) => {
    setModalState({ open: true, mode: "view", selectedId: Organization.id });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, mode: "create", selectedId: null });
  };

  const handleDeleteOrganization = (organizationId: string) => {
    if (!canManage) return;
    setDeleteState({ open: true, organizationId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteState.organizationId || !canManage) return;
    try {
      await deleteOrganization(deleteState.organizationId).unwrap();
      setDeleteState({ open: false, organizationId: null });
      refetchOrganizations();
      toast.success("Organization deleted successfully");
    } catch {
      toast.error("Failed to delete Organization. Please try again.");
    }
  };
  const handleExport = async () => {
    try {
      const blob = await downloadOrganizations({
        search: filters.search || undefined,
        status: filters.status || undefined,
        limit: 10000,
      }).unwrap();

      //create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Organizations_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel downloaded");
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        (err as { message?: string })?.message ??
        "Failed to download Excel file";
      toast.error(message);
    }
  };

  const handleFilterChange = (key: keyof IFiltersState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination({ page: 1, limit, total: pagination.total });
  };

  const handleModalSuccess = () => {
    refetchOrganizations();
  };

  // ── Skeleton placeholder count ────────────────────────────────────────────

  const statSkeletons = Array.from({ length: 3 });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex max-[830px]:flex-col items-start sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 md:text-3xl">
            Organization Onboarding
          </h1>
        </div>

        {canManage && (
          <Button
            htmlType="button"
            size="large"
            appearance="primary"
            onClick={handleOpenCreate}
            icon={<Plus className="w-3 h-3 md:w-5 md:h-5" />}
          >
            Add Organization
          </Button>
        )}
      </div>

      {/* Error banner */}
      {listError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{listError}</span>
        </div>
      )}

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {statSkeletons.map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <OrganizationStatsCards stats={stats} />
      )}

      {/* Filters */}
      <FilterWrapper>
        {statusLoading ? (
          <OrganizationFiltersSkeleton />
        ) : (
          <OrganizationFilters
            searchTerm={filters.search}
            onSearchChange={(value) => handleFilterChange("search", value)}
            statusOptions={statusOptions}
            loading={statusLoading}
            selectedStatus={filters.status}
            onStatusChange={(value) => handleFilterChange("status", value)}
          />
        )}
      </FilterWrapper>

      {/* Table */}
      {listLoading ? (
        <OrganizationTableSectionSkeleton />
      ) : (
        <OrganizationTableSection
          Organizations={Organizations}
          loading={listLoading}
          currentPage={pagination.page}
          itemsPerPage={pagination.limit}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleLimitChange}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteOrganization}
          onExport={handleExport}
          canManage={canManage}
        />
      )}
      <AddOrganizationModal
        isOpen={modalState.open && modalState.mode !== "view"}
        mode={modalState.mode === "view" ? "edit" : modalState.mode}
        initialData={modalState.mode === "edit" ? stableSelectedDetail : null}
        initialSelectedNodeIds={
          modalState.mode === "edit"
            ? (stableSelectedDetail?.permissions ?? [])
            : []
        }
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        loadingData={detailLoading}
      />
      <ViewOrganizationModal
        isOpen={modalState.open && modalState.mode === "view"}
        loading={false}
        organization={stableSelectedDetail}
        tree={permissionTreeData?.tree ?? []}
        permissions={stableSelectedDetail?.permissions ?? []}
        onClose={handleCloseModal}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={deleteState.open}
        onClose={() => setDeleteState({ open: false, organizationId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Organization"
        message="Are you sure you want to delete this Organization? This action cannot be undone."
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default OrganizationOnboarding;
