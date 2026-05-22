import React, { useState, useRef } from "react";
import {
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  Loader2,
  Upload,
  RotateCcw,
  FileText,
  SquarePen,
} from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmationModal } from "../common/ConfirmationModal";
import HolidayBulkUploadModal from "./HolidayBulkUploadModal";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import {
  Button,
  DatePicker,
  Pagination,
  Select,
  SimpleTooltip,
  ConfigurableTable,
} from "../common";
import { HolidaysSectionSkeleton } from "./Skeleton";
import { TableColumn } from "../common/Table";
import dayjs from "dayjs";
import Input from "../common/Input";
import RadioButton from "../common/RadioButton";
import { TextArea } from "../common/TextArea";
import {
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
  IHoliday,
} from "../../store/apis/holidayManagement.api";

// Interface for RTK Query Error
interface IApiError {
  data?: {
    message?: string;
  };
  message?: string;
}
interface IHolidayFormData {
  name: string;
  date: string;
  year: string;
  isMandatory: boolean;
  description?: string;
}


const HolidayManagement: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const canManage = useHasPermission(PERMISSIONS.HOLIDAY_MANAGEMENT_MANAGE);
  const formRef = useRef<HTMLDivElement>(null);

  const [selectedYear, setSelectedYear] = useState<number | string>(currentYear);

  const {
    data: holidaysResponse,
    isLoading: isFetchingHolidays,
    isFetching
  } = useGetHolidaysQuery(
    selectedYear === "All Year" ? undefined : { year: Number(selectedYear) }
  );

  // Only destructure isLoading
  const [createHoliday, { isLoading: isCreating }] = useCreateHolidayMutation();
  const [updateHoliday, { isLoading: isUpdating }] = useUpdateHolidayMutation();
  const [deleteHoliday, { isLoading: isDeleting }] = useDeleteHolidayMutation();

  const [editingHoliday, setEditingHoliday] = useState<IHoliday | null>(null);
  const [holidayPage, setHolidayPage] = useState(1);
  const [holidayLimit, setHolidayLimit] = useState(10);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  const [formData, setFormData] = useState<IHolidayFormData>({
    name: "",
    date: "",
    year: "",
    isMandatory: true,
    description: "",
  });

  const allHolidays = holidaysResponse?.data || [];
  const holidaysTotal = allHolidays.length;
  const paginatedHolidays = allHolidays.slice(
    (holidayPage - 1) * holidayLimit,
    holidayPage * holidayLimit
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Holiday name is required");
      return false;
    }
    if (!formData.date) {
      toast.error("Please select a date");
      return false;
    }

    const selectedDate = dayjs(formData.date);
    if (!selectedDate.isValid()) {
      toast.error("Invalid date selected");
      return false;
    }

    if (!selectedYear) {
      toast.error("Please select a year");
      return false;
    }

    if (selectedDate.year() !== Number(formData.year)) {
      toast.error("Please select a valid year according to selected date");
      return false;
    }

    return true;
  };

  // Fixed with proper typing
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!canManage || !validateForm()) return;

    const yearValue = Number(formData.year);
    if (Number.isNaN(yearValue) || yearValue <= 0) {
      toast.error("Please select a valid year");
      return;
    }

    const submitData = { ...formData, year: yearValue };

    try {
      await (editingHoliday?.id
        ? updateHoliday({ id: editingHoliday.id, ...submitData })
        : createHoliday(submitData)
      ).unwrap();

      toast.success(
        editingHoliday
          ? "Holiday updated successfully!"
          : "Holiday created successfully!"
      );
      setEditingHoliday(null);
      resetForm();

    } catch (err) {
      const error = err as IApiError;
      const msg = error?.data?.message || error?.message || "Operation failed";
      toast.error(msg);
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    if (!canManage) return;
    setHolidayToDelete(id);
    setShowDeleteConfirmation(true);
  };

  // Fixed with proper typing
  const confirmDeleteHoliday = async (): Promise<void> => {
    if (!canManage || !holidayToDelete) return;

    try {
      await deleteHoliday(holidayToDelete).unwrap();

      toast.success("Holiday deleted successfully!");
      setShowDeleteConfirmation(false);
      setHolidayToDelete(null);

    } catch (err) {
      const error = err as IApiError;
      const msg = error?.data?.message || error?.message || "Delete failed";
      toast.error(msg);
      console.error(error);
    }
  };

  const handleEdit = (holiday: IHoliday) => {
    if (!canManage) return;
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date.split("T")[0],
      year: String(holiday.year),
      isMandatory: holiday.isMandatory,
      description: holiday.description || "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      year: "",
      isMandatory: true,
      description: ""
    });
  };

  const handleReset = () => {
    setEditingHoliday(null);
    resetForm();
  };

  const columns: TableColumn<IHoliday>[] = [
    { key: "name", title: "Holiday Name", label: "Holiday Name", required: true, dataIndex: "name" },
    { key: "date", title: "Date", label: "Date", render: (_: unknown, h: IHoliday) => formatDate(h.date) },
    {
      key: "type",
      title: "Type",
      label: "Type",
      render: (_: unknown, h: IHoliday) => (
        <div className="flex items-center">
          <CheckCircle
            className={`w-4 h-4 mr-2 ${h.isMandatory ? "text-green-600" : "text-yellow-600"
              }`}
          />
          <span
            className={`text-sm font-medium ${h.isMandatory ? "text-green-800" : "text-orange-800"
              }`}
          >
            {h.isMandatory ? "Mandatory" : "Optional"}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      title: "Description",
      label: "Description",
      dataIndex: "description",
    },
    ...(canManage ? [{
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      align: "center" as const,
      render: (_: unknown, holiday: IHoliday) => {
        const hId = holiday?.id;
        const isMutating = isCreating || isUpdating || isDeleting;

        return (
          <div className="flex justify-center gap-2">
            <SimpleTooltip
              label="Edit"
              side="top"
              className="inline-block"
              tooltipClassName="text-xs shadow-soft border-0"
            >
              <button
                onClick={() => handleEdit(holiday)}
                disabled={isMutating}
                className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClick={() => handleDelete(hId as string)}
                disabled={isMutating}
                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting && holidayToDelete === hId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </SimpleTooltip>
          </div>
        );
      },
    }] : []),
  ];

  const years = Array.from(
    { length: 7 },
    (_, index) => String(currentYear - 3 + index)
  );

  return (
    <div ref={formRef} className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-full mx-auto">

        <div className="mb-8 flex flex-col md:flex-row md:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Holiday Management
          </h1>
          {canManage && (
            <Button
              appearance="success"
              size="large"
              onClick={() => setShowBulkUploadModal(true)}
              icon={<Upload className="w-4 h-4" />}
              className="self-start"
            >
              <span className="text-sm md:text-base">Bulk Upload</span>
            </Button>
          )}
        </div>

        {canManage && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold mb-4">
              {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Holiday Name"
                  required
                  placeholder="e.g., New Year's Day"
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v as string })}
                />
                <DatePicker
                  label="Date"
                  required
                  value={formData.date ? dayjs(formData.date) : undefined}
                  onChange={(v: any) => setFormData({
                    ...formData,
                    date: v ? v.format("YYYY-MM-DD") : ""
                  })}
                  format="DD/MM/YYYY"
                />
                <Select
                  className="w-full"
                  placeholder="Select Year"
                  label="Year"
                  required
                  value={formData.year}
                  onChange={(v) => setFormData({ ...formData, year: v as string })}
                  options={years.map((y) => ({ label: y, value: y }))}
                />
                <RadioButton
                  name="mandatory"
                  label="Type"
                  value={formData.isMandatory ? "mandatory" : "optional"}
                  onChange={(v) => setFormData({
                    ...formData,
                    isMandatory: v === "mandatory"
                  })}
                  options={[
                    { label: "Mandatory", value: "mandatory" },
                    { label: "Optional", value: "optional" }
                  ]}
                  direction="row"
                />
              </div>
              <TextArea
                label="Description"
                value={formData.description}
                onChange={(v) => setFormData({
                  ...formData,
                  description: v
                })}
                placeholder="Optional description..."
              />
              <div className="flex space-x-3 justify-end">
                <Button
                  htmlType="button"
                  appearance="secondary"
                  size="large"
                  onClick={handleReset}
                  icon={<RotateCcw className="w-4 h-4" />}
                  disabled={isCreating || isUpdating}
                >
                  Reset
                </Button>
                <Button
                  htmlType="submit"
                  appearance="primary"
                  size="large"
                  loading={isCreating || isUpdating}
                  disabled={isCreating || isUpdating}
                  icon={editingHoliday ? <Edit className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        )}

        {isFetchingHolidays ? (
          <HolidaysSectionSkeleton hasActions={canManage} />
        ) : (
          <div className="bg-white rounded-lg shadow-soft">
            {paginatedHolidays.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">
                  No holidays found for {selectedYear}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <ConfigurableTable
                    columns={columns}
                    data={paginatedHolidays}
                    loading={isFetching}
                    emptyMessage="No holidays found"
                    rowKey={(r) => r.id}
                    hoverable
                    striped
                    stickyHeader
                    className="mb-4"
                    configOptions={{ persistenceKey: "holiday-management-table" }}
                    renderColumnSelector={(selector) => (
                      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900">
                          Holidays for {selectedYear}
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="w-32 lg:w-48">
                            <Select
                              className="w-full"
                              defaultValue="All Year"
                              searchable
                              value={selectedYear ? String(selectedYear) : "All Year"}
                              onChange={(v) => {
                                setSelectedYear(v === "All Year" ? "All Year" : Number(v));
                                setHolidayPage(1);
                              }}
                              options={[
                                { value: "All Year", label: "All Year" },
                                ...years.map((y) => ({ label: y, value: y }))
                              ]}
                            />
                          </div>
                          {selector}
                        </div>
                      </div>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <Pagination
                    currentPage={holidayPage}
                    totalItems={holidaysTotal}
                    itemsPerPage={holidayLimit}
                    onPageChange={setHolidayPage}
                    onItemsPerPageChange={(l: number) => {
                      setHolidayLimit(l);
                      setHolidayPage(1);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {canManage && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setHolidayToDelete(null);
          }}
          onConfirm={confirmDeleteHoliday}
          title="Delete Holiday"
          message="Are you sure you want to delete this holiday? This action cannot be undone."
          type="danger"
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={isDeleting}
        />
      )}

      {canManage && (
        <HolidayBulkUploadModal
          isOpen={showBulkUploadModal}
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={() => {
            setShowBulkUploadModal(false);
            toast.success("Holidays uploaded successfully!");
          }}
        />
      )}
    </div>
  );
};

export default HolidayManagement;