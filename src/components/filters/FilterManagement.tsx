import React, { useState, useRef } from "react";
import { Edit, Trash2, Loader2, RotateCcw, FileText, SquarePen, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { ApiError } from "../../store/utils/apiError";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { ConfigurableTable } from "../common";
import { TableColumn } from "../common/Table";
import Pagination from "../common/Pagination";
import Select, { SelectValue } from "../common/Select";
import { Button, SimpleTooltip } from "../common";
import { ConfigsPanelSkeleton } from "./Skeleton";
import { DEFAULT_ITEMS_PER_PAGE_OPTIONS, MasterConfigCategory } from "../../constants";
import Input from "../common/Input";
import RadioButton from "../common/RadioButton";
import Badge from "../common/Badge";
import { useMasterConfig } from "../../store/hooks/useMasterConfig";

interface Category {
  categoryName: string;
  categoryCode: string;
}

interface FilterData {
  id?: string;
  categoryName: string;
  displayName: string;
  filterCode: string;
  categoryCode: string;
  isActive: boolean;
}

interface FilterFormData {
  categoryCode: string;
  categoryName: string;
  displayName: string;
  filterCode: string;
  isActive: boolean;
}

const FilterManagement: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const {
    categoryCodes,
    configsByCategory,
    paginatedConfigs,
    selectedCategoryCode,
    setCategory,
    setPage,
    skip,
    limit,
    createMasterConfig,
    updateMasterConfig,
    deleteMasterConfig,
    isLoading,
  } = useMasterConfig();

  const [editingFilter, setEditingFilter] = useState<FilterData | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [formData, setFormData] = useState<FilterFormData>({
    categoryCode: "",
    categoryName: "",
    displayName: "",
    filterCode: "",
    isActive: true,
  });

  const categories: Category[] = Array.isArray(categoryCodes?.data) ? categoryCodes?.data : [];
  
  const isAllView =
    !selectedCategoryCode || selectedCategoryCode === MasterConfigCategory.ALL_CONFIGS;

  const getSafeList = (response: unknown): FilterData[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response as FilterData[];
    const resp = response as Record<string, unknown>;
    if (Array.isArray(resp.data)) return resp.data as FilterData[];
    const nestedData = resp.data as Record<string, unknown> | undefined;
    if (nestedData && Array.isArray(nestedData.data)) return nestedData.data as FilterData[];
    if (Array.isArray(resp.result)) return resp.result as FilterData[];
    return [];
  };

  const filters = isAllView
    ? getSafeList(paginatedConfigs)
    : getSafeList(configsByCategory);

  const getTotalItems = (response: unknown): number => {
    const resp = response as Record<string, Record<string, Record<string, number>>> | undefined;
    if (resp?.data?.pagination?.total) return resp.data.pagination.total;
    const resp2 = response as Record<string, Record<string, number>> | undefined;
    if (resp2?.pagination?.total) return resp2.pagination.total;
    return 0;
  };

  const totalItems = isAllView
    ? getTotalItems(paginatedConfigs)
    : getTotalItems(configsByCategory);

  const currentPage = Math.floor(skip / limit) + 1;

  const handleCategoryChange = (categoryCode: string) => {
    const newCategory =
      categoryCode === MasterConfigCategory.ALL_CONFIGS ? null : categoryCode;
    setCategory(newCategory);
  };

  const handleFormCategoryChange = (categoryCode: string) => {
    const category = categories.find((c: Category) => c.categoryCode === categoryCode);
    setFormData({
      ...formData,
      categoryCode: categoryCode,
      categoryName: category?.categoryName || "",
    });
  };

  const handlePageChange = (page: number) => {
    const newSkip = (page - 1) * limit;
    setPage(newSkip, limit);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setPage(0, newLimit); // Reset to first page when changing limit
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const filterCode =
        formData.filterCode ||
        formData.displayName.toLowerCase().replace(/\s+/g, "_");

      const submitData = {
        ...formData,
        filterCode,
      };

      if (editingFilter) {
        await updateMasterConfig({ 
            id: editingFilter.id!, 
            data: submitData 
        }).unwrap();
        toast.success("Config updated successfully!");
      } else {
        await createMasterConfig(submitData).unwrap();
        toast.success("Config created successfully!");
      }

      setEditingFilter(null);
      resetForm();
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Error saving filter:", err);
      const rawMessage = err?.data?.message || "Failed to save config";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      toast.error(errorMessage);
    }
  };

  const handleDelete = (id: string) => {
    setFilterToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteFilter = async () => {
    if (!filterToDelete) return;

    try {
      setIsDeleting(true);
      await deleteMasterConfig(filterToDelete).unwrap();
      
      toast.success("Config deleted successfully!");
      setShowDeleteConfirmation(false);
      setFilterToDelete(null);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Error deleting filter:", err);
      const rawMessage = err?.data?.message || "Failed to delete config";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      toast.error(errorMessage);
    } finally {
        setIsDeleting(false);
    }
  };

  const cancelDeleteFilter = () => {
    setShowDeleteConfirmation(false);
    setFilterToDelete(null);
  };

  const handleEdit = (filter: FilterData) => {
    setEditingFilter(filter);
    setFormData({
      categoryCode: filter.categoryCode,
      categoryName: filter.categoryName,
      displayName: filter.displayName,
      filterCode: filter.filterCode,
      isActive: filter.isActive,
    });

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const resetForm = () => {
    const currentCategoryObj = categories.find((c: Category) => c.categoryCode === selectedCategoryCode);
    
    setFormData({
      categoryCode: selectedCategoryCode || "",
      categoryName: currentCategoryObj?.categoryName || "",
      displayName: "",
      filterCode: "",
      isActive: true,
    });
  };

  const handleReset = () => {
    setEditingFilter(null);
    resetForm();
  };

  const columns: TableColumn<FilterData>[] = [
    {
      key: "displayName",
      title: "Config Name",
      dataIndex: "displayName",
      sortable: false,
      required: true,
    },
    {
      key: "categoryName",
      title: "Config Category",
      dataIndex: "categoryName",
    },
    {
      key: "isActive",
      title: "Status",
      dataIndex: "isActive",
      render: (value: unknown) => (
        <>
          {value ? (
            <Badge size="middle" variant="green" icon={<CheckCircle className="w-4 h-4 text-green-500" />}>
              Active
            </Badge>
          ) : (
            <Badge size="middle" variant="red" icon={<XCircle className="w-4 h-4 text-red-500" />}>
              Inactive
            </Badge>
          )}
        </>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      required: true,
      render: (_: unknown, record: FilterData) => (
        <div className="flex space-x-2 ">
          <SimpleTooltip
            label="Edit"
            side="top"
            className="inline-block"
            tooltipClassName="text-xs shadow-soft border-0"
          >
            <button
              onClick={() => handleEdit(record)}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <SquarePen className="w-4 h-4" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip
            label="Delete"
            side="top"
            className="inline-block"
            tooltipClassName="text-xs shadow-soft border-0"
          >
            <button
              onClick={() => handleDelete(record.id!)}
              disabled={isDeleting && filterToDelete === record.id}
              className={`flex items-center transition-colors ${
                 isDeleting && filterToDelete === record.id
                  ? "text-primary-600"
                  : "text-red-600 hover:text-red-800"
              }`}
            >
              {isDeleting && filterToDelete === record.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mb-[1px]" />
              )}
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Master Data Config
          </h1>
        </div>

        <div ref={formRef} className="mb-8 p-6 bg-white rounded-lg shadow-soft">
          <h2 className="text-xl font-semibold mb-4">
            {editingFilter ? "Edit Config" : "Add New Config"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  className="w-full"
                  disabled={!!editingFilter}
                  value={formData.categoryCode}
                  onChange={(value: SelectValue) => handleFormCategoryChange(value as string)}
                  options={[
                    { value: "", label: "Select Category" },
                    ...categories.map((category: Category) => ({
                      label: category.categoryName,
                      value: category.categoryCode,
                    })),
                  ]}
                />
              </div>

              <div>
                <Input
                  label="Display Name"
                  required
                  placeholder="e.g., Pending"
                  value={formData.displayName}
                  onChange={(value) =>
                    setFormData({ ...formData, displayName: value as string })
                  }
                />
              </div>

              <div>
                <RadioButton
                  name="status"
                  label="Status"
                  value={formData.isActive ? "active" : "inactive"}
                  onChange={(val) =>
                    setFormData({ ...formData, isActive: val === "active" })
                  }
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                  direction="row"
                />
              </div>
            </div>

            <div className="flex space-x-3 justify-end">
              <Button
                htmlType="button"
                appearance="secondary"
                size="large"
                onClick={handleReset}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </Button>

              <Button
                htmlType="submit"
                size="large"
                appearance="primary"
                disabled={isLoading}
                icon={editingFilter ? <Edit className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              >
                {isLoading && (editingFilter || formData.displayName) ? "Saving..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <ConfigurableTable
            maxHeight="1200px"
            columns={columns}
            data={filters}
            loading={isLoading}
            skeleton={<ConfigsPanelSkeleton />}
            emptyMessage={
                isAllView
                  ? "No Configs found"
                  : "No Configs found for this category"
              }
              rowKey="id"
              configOptions={{ persistenceKey: "master-config-table" }}
              renderColumnSelector={(selector) => (
                <div className="bg-white rounded-lg shadow-soft p-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900 mb-0">
                      Filters
                    </h3>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                        <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                          Category:
                        </label>

                        <div className="w-full sm:w-56 md:w-64 lg:w-72">
                          <Select
                            value={selectedCategoryCode || MasterConfigCategory.ALL_CONFIGS}
                            searchable={true}
                            placeholder="Select Category"
                            onChange={(val) => handleCategoryChange(val as string)}
                            options={[
                              {
                                label: "All Configs",
                                value: MasterConfigCategory.ALL_CONFIGS,
                              },
                              ...categories.map((category: Category) => ({
                                label: category.categoryName,
                                value: category.categoryCode,
                              })),
                            ]}
                          />
                        </div>
                      </div>
                      {selector}
                    </div>
                  </div>
                </div>
              )}
            />

            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={DEFAULT_ITEMS_PER_PAGE_OPTIONS}
              />
            )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={cancelDeleteFilter}
        onConfirm={confirmDeleteFilter}
        title="Delete Config"
        message="Are you sure you want to delete this configuration? This action cannot be undone."
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FilterManagement;