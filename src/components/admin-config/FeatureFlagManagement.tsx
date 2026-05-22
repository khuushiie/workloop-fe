import React, { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import Pagination from "../common/Pagination";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { FeatureFlagsTableSkeleton } from "./Skeleton";
import { SearchInput, SimpleTooltip, ConfigurableTable } from "../common";
import Badge from "../common/Badge";
import {
  useGetFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
  useDeleteFeatureFlagMutation,
  type IFeatureFlag,
} from "../../store/apis/featureFlag.api";
import { TableColumn } from "../common/Table";
import { ApiError } from "../../store/utils/apiError";

type BannerState = {
  type: "success" | "error";
  message: string;
} | null;

const FeatureFlagManagement: React.FC = () => {
  // UI State
  const [banner, setBanner] = useState<BannerState>(null);
  const [deleteTarget, setDeleteTarget] = useState<IFeatureFlag | null>(null);

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // --- RTK QUERY HOOKS ---
  const {
    data: response,
    isLoading,
    isFetching,
  } = useGetFeatureFlagsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
  });

  const [updateFlag, { isLoading: isUpdating }] = useUpdateFeatureFlagMutation();
  const [deleteFlag, { isLoading: isDeleting }] = useDeleteFeatureFlagMutation();

  const flags = response?.data || [];
  const totalItems = response?.pagination?.total || 0;

  // --- EFFECTS ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (banner) {
      const timeout = setTimeout(() => setBanner(null), 3200);
      return () => clearTimeout(timeout);
    }
  }, [banner]);

  // --- HANDLERS ---
  const setSuccess = (message: string) => setBanner({ type: "success", message });
  const setError = (message: string) => setBanner({ type: "error", message });

  const handleToggle = async (flag: IFeatureFlag) => {
    const { id, updatedAt, ...editableFields } = flag;
    const result = await updateFlag({
      key: flag.key,
      data: { ...editableFields, enabled: !flag.enabled },
    });

    if ("data" in result) {
      const updated = result.data?.data;
      setSuccess(`Feature '${updated?.name || updated?.key}' is now ${updated?.enabled ? "enabled" : "disabled"}.`);
    } else {
      const error = result.error as ApiError;
      const rawMessage = error?.data?.message || error?.response?.data?.message || error?.message || "Failed to toggle feature flag.";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      setError(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteFlag(deleteTarget.key);

    if ("data" in result) {
      setSuccess(`Feature '${deleteTarget.name || deleteTarget.key}' deleted.`);
      if (flags.length === 1 && currentPage > 1) setCurrentPage((prev) => prev - 1);
    } else {
      const error = result.error as ApiError;
      const rawMessage = error?.data?.message || error?.response?.data?.message || error?.message || "Failed to delete feature flag.";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      setError(errorMessage);
    }
    setDeleteTarget(null);
  };

  // --- TABLE COLUMN DEFINITION ---
  const columns = useMemo<TableColumn<IFeatureFlag>[]>(() => [
    {
      key: "name",
      title: "Name",
      label: "Feature Name",
      required: true,
      render: (_, flag: IFeatureFlag) => (
        <p className="text-sm font-medium text-slate-900 mb-0">
          {flag.name || flag.key}
        </p>
      ),
    },
    {
      key: "description",
      title: "Description",
      label: "Description",
      render: (value: any) => (
        <p className="text-xs md:text-sm text-slate-600 mb-0">
          {value || "—"}
        </p>
      ),
      dataIndex: "description",
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      render: (_, flag: IFeatureFlag) => (
        <Badge variant={flag.enabled ? "emerald" : "gray"} size="middle">
          {flag.enabled ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_, flag: IFeatureFlag) => (
        <div className="flex items-center space-x-3">
          <SimpleTooltip label={flag.enabled ? "Disable" : "Enable"} side="top">
            <button
              onClick={() => handleToggle(flag)}
              disabled={isUpdating || isDeleting}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-md transition-colors ${isUpdating ? "opacity-50 cursor-not-allowed" : "hover:text-emerald-600"
                }`}
            >
              {flag.enabled ? (
                <ToggleRight className="w-6 h-6 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-red-700" />
              )}
            </button>
          </SimpleTooltip>

          <SimpleTooltip label="Delete" side="top">
            <button
              onClick={() => setDeleteTarget(flag)}
              disabled={isDeleting || isUpdating}
              className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ], [isUpdating, isDeleting]);

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Control Center</h1>
        </div>

        {banner && (
          <div className={`mb-6 rounded-md border px-4 py-3 flex items-center space-x-3 ${banner.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
            }`}>
            {banner.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <p className="text-sm font-medium mb-0">{banner.message}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <ConfigurableTable<IFeatureFlag>
            columns={columns}
            data={flags}
            loading={isLoading || isFetching}
            skeleton={<FeatureFlagsTableSkeleton />}
            emptyMessage="No feature flags found. Adjust your search to find feature flags."
            rowKey="key"
            configOptions={{ persistenceKey: "feature-flags-table" }}
            renderColumnSelector={(selector) => (
              <div className="p-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-lg font-bold text-slate-900">
                  Flags ({totalItems})
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-full sm:w-72">
                    <SearchInput
                      value={searchTerm}
                      onChange={(value: string) => setSearchTerm(value)}
                      placeholder="Search by name or description"
                    />
                  </div>
                  {selector}
                </div>
              </div>
            )}
          />

          {totalItems > 0 && (
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(count) => {
                  setItemsPerPage(count);
                  setCurrentPage(1);
                }}
                itemsPerPageOptions={[5, 10, 20, 50]}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Feature Flag"
        message={`Are you sure you want to delete '${deleteTarget?.name || deleteTarget?.key}'? This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FeatureFlagManagement;