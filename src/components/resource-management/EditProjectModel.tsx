import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import { ConfirmationModal, DatePicker, Select } from "../common";
import Modal, { ModalFooter, ModalButton } from "../common/Modal";
import ResourceAllocationModal from "./ResourceAllocationModal";
import { PlusCircle, X, XCircle } from "lucide-react";
import { ResourceAllocationPayload } from "../../types/resource-allocation";
import { capitalizeWords } from "../../utils/nameUtils";
import Input from "../common/Input";
import { TextArea } from "../common/TextArea";
import { useGetUsersForFilterQuery } from "../../store/apis/user.api";
import { useGetConfigsByCategoryCodeQuery } from "../../store/apis/masterConfig.api";
import { useUpdateProjectMutation } from "../../store/apis/resource-allocation/project-management.api";
import { useDeleteAllocationMutation } from "../../store/apis/resource-allocation/resource-allocation.api";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

interface EditProjectModelProps {
  data: any;
  onClose: () => void;
  loading: boolean;
  onSuccess: () => void;
}

interface SelectOption {
  label: string;
  value: string;
}

const formatConfigOptions = (response: any) => {
  if (!response) return [];
  
  const list = Array.isArray(response.data) ? response.data : 
               Array.isArray(response) ? response : [];
               
  return list.map((item: any) => ({
    label: item.displayName,
    value: item.id ?? item._id,
  }));
};


const getInitialId = (options: SelectOption[], label: string) => {
  return options.find(opt => opt.label === label)?.value || label || "";
};

const EditProjectModel: React.FC<EditProjectModelProps> = ({
  data,
  onClose,
  loading,
  onSuccess,
}) => {
  const { data: rawEmployees } = useGetUsersForFilterQuery({ includeInactive: false });
  const { data: rawDomains } = useGetConfigsByCategoryCodeQuery({categoryCode: "project_domain"});
  const { data: rawStatuses } = useGetConfigsByCategoryCodeQuery({categoryCode: "project_status"});
  const { data: rawPriorities } = useGetConfigsByCategoryCodeQuery({categoryCode: "project_priority"});
  const { data: rawCategories } = useGetConfigsByCategoryCodeQuery({categoryCode: "project_category"});
  const { data: rawGrades } = useGetConfigsByCategoryCodeQuery({categoryCode: "allocation_grade"});
  const { data: rawRoles } = useGetConfigsByCategoryCodeQuery({categoryCode: "project_role"});

  const employeeOptions = useMemo(() => 
    (Array.isArray(rawEmployees) ? rawEmployees : []).map((u: any) => ({
      label: u.fullName,
      value: u.id
    })), [rawEmployees]);
  
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteAllocation, { isLoading: isDeleting }] = useDeleteAllocationMutation();

  const domainOptions = useMemo(() => formatConfigOptions(rawDomains), [rawDomains]);
  const statusOptions = useMemo(() => formatConfigOptions(rawStatuses), [rawStatuses]);
  const priorityOptions = useMemo(() => formatConfigOptions(rawPriorities), [rawPriorities]);
  const categoryOptions = useMemo(() => formatConfigOptions(rawCategories), [rawCategories]);
  const gradeOptions = useMemo(() => formatConfigOptions(rawGrades), [rawGrades]);
  const roleOptions = useMemo(() => formatConfigOptions(rawRoles), [rawRoles]);

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentDeletionId, setCurrentDeletionId] = useState<string | null>(null);
  const [currentDeletionIndex, setCurrentDeletionIndex] = useState<number | null>(null);
  
  const [openAllocationModal, setOpenAllocationModal] = useState(false);

  const [allocatedResources, setAllocatedResources] = useState<any[]>(
    (data?.allocatedResources || []).map((r: any) => ({
      ...r,
      projectRole: r.projectRole || "", 
      grade: r.grade || "",
      
      // 2. Ensure dates are formatted if needed
      startDate: r.startDate,
      endDate: r.endDate,
    }))
  );

  useEffect(() => {
    if (!data) return;

    setFormData((prev) => ({
      ...prev,
      // Only update if the current value matches the original data (user hasn't changed it yet)
      // AND we can now find a valid ID in the loaded options
      domain: prev.domain === data.domain ? getInitialId(domainOptions, data.domain) : prev.domain,
      priority: prev.priority === data.priority ? getInitialId(priorityOptions, data.priority) : prev.priority,
      status: prev.status === data.status ? getInitialId(statusOptions, data.status) : prev.status,
      category: prev.category === data.category ? getInitialId(categoryOptions, data.category) : prev.category,
    }));
  }, [
    // dependency array ensures this runs when options finally load
    domainOptions, 
    priorityOptions, 
    statusOptions, 
    categoryOptions, 
    data
  ]);

  const [formData, setFormData] = useState({
    projectName: data?.name || "",
    projectDescription: data?.description || "",
    clientName: data?.clientName || "",
    capacity: data?.capacity || 0,

    startDate: data?.startDate || "",
    endDate: data?.endDate || "",
    domain: getInitialId(domainOptions, data?.domain),
    priority: getInitialId(priorityOptions, data?.priority),
    status: getInitialId(statusOptions, data?.status),
    category: getInitialId(categoryOptions, data?.category),
    poc: data?.poc?._id || "",
    billable: data?.billable || false,

    inActiveReason: data?.inActiveReason || "",
  });

  const projectId = data?.id || data?._id;
  

  const handleChange = (
    name: string,
    value: string | number | boolean | (string | number)[],
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const hasActiveAllocationConflict = (resources: any[]) => {
    const today = dayjs().startOf("day");
    const activeUserTracking = new Set<string>();

    for (const r of resources) {
      const userId =
        typeof r.userId === "string" ? r.userId : r.userId?._id?.toString();
      if (!userId) continue;

      const end = dayjs(r.endDate);

      if (end.isSameOrAfter(today, "day")) {
        if (activeUserTracking.has(userId)) {
          return true;
        }

        activeUserTracking.add(userId);
      }
    }

    return false;
  };

  const selectedStatusLabel = useMemo(() => {
    const selectedOption = statusOptions.find((opt: { label: string; value: string }) => 
      opt.value === formData.status
    );
    return selectedOption?.label?.toLowerCase() || "";
  }, [formData.status, statusOptions]);


  const updateResourceField = (index: number, field: string, value: any) => {
    setAllocatedResources((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const fieldLabels: Record<string, string> = {
    projectName: "Project Name",
    clientName: "Client Name",
    capacity: "Capacity",
    domain: "Domain",
    priority: "Project Priority",
    startDate: "Project Start Date",
    endDate: "Project End Date",
    status: "Project Status",
    poc: "Point of Contact",
    category: "Project Category",
    inActiveReason: "Inactive Reason",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Trim & normalize ---
    const cleanedFormData = {
      ...formData,
      projectName: formData.projectName?.trim() || "",
      clientName: formData.clientName?.trim() || "",
      projectDescription: formData.projectDescription?.trim() || "",
      inActiveReason: formData.inActiveReason?.trim() || "",
    };

    const required = [
      "projectName",
      "clientName",
      "capacity",
      "domain",
      "priority",
      "startDate",
      "endDate",
      "status",
      "poc",
      "category",
    ];

    // --- Required validation ---
    for (let k of required) {
      const value = cleanedFormData[k as keyof typeof cleanedFormData];

      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      ) {
        const label = fieldLabels[k] || k;
        return toast.error(`${label} is required`);
      }
    }

    // --- Capacity validation ---
    if (
      Number(cleanedFormData.capacity) <= 0 ||
      Number(cleanedFormData.capacity) > 500
    ) {
      return toast.error("Capacity must be between 1 and 500");
    }

    // --- Project date validation ---
    if (
      dayjs(cleanedFormData.endDate).isBefore(dayjs(cleanedFormData.startDate))
    ) {
      return toast.error("Project end date cannot be before start date");
    }

    // --- Inactive reason validation (FIXED precedence bug) ---
    if (
      (selectedStatusLabel === "inactive") &&
      !cleanedFormData.inActiveReason
    ) {
      return toast.error("Inactive reason required");
    }

    // --- Allocated resources validation ---
    for (let i = 0; i < allocatedResources.length; i++) {
      const r = allocatedResources[i];

      if (!r.userId) {
        return toast.error(`Resource ${i + 1}: User is required`);
      }

      if (
        !r.allocationPercentage ||
        r.allocationPercentage <= 0 ||
        r.allocationPercentage > 100
      ) {
        return toast.error(
          `Resource ${i + 1}: Allocation % must be between 1 and 100`,
        );
      }

      if (!r.projectRole) {
        return toast.error(`Resource ${i + 1}: Role is required`);
      }

      if (!r.startDate || !r.endDate) {
        return toast.error(`Resource ${i + 1}: Start & End dates are required`);
      }

      if (dayjs(r.endDate).isBefore(dayjs(r.startDate))) {
        return toast.error(
          `Resource ${i + 1}: End date cannot be before start date`,
        );
      }
      if (
        dayjs(r.startDate).isBefore(cleanedFormData.startDate) ||
        dayjs(r.endDate).isAfter(cleanedFormData.endDate)
      ) {
        return toast.error(
          `Resource ${i + 1}: Dates must be within project timeline`,
        );
      }
    }
    if (hasActiveAllocationConflict(allocatedResources)) {
      return toast.error(
        "Same resource cannot have overlapping allocation dates",
      );
    }

    // --- Payload ---
    const payload = {
      name: cleanedFormData.projectName,
      description: cleanedFormData.projectDescription,
      clientName: cleanedFormData.clientName,
      capacity: Number(cleanedFormData.capacity),
      startDate: cleanedFormData.startDate,
      endDate: cleanedFormData.endDate,
      domain: cleanedFormData.domain,
      priority: cleanedFormData.priority,
      status: cleanedFormData.status,
      category: cleanedFormData.category,
      poc: cleanedFormData.poc,
      billable: cleanedFormData.billable,
      inActiveReason: selectedStatusLabel === "inactive" 
        ? cleanedFormData.inActiveReason 
        : undefined,
        allocatedResources: allocatedResources.map((r) => ({
        id: r._id,
        userId: typeof r.userId === "string" ? r.userId : r.userId?._id,
        allocationPercentage: Number(r.allocationPercentage),
        startDate: r.startDate,
        endDate: r.endDate,
        projectRole: typeof r.projectRole === "object" ? r.projectRole.id : r.projectRole,
        grade: typeof r.grade === "object" ? r.grade.id : r.grade,
      })),
    };

    try {
      const response = await updateProject({ id: projectId, payload }).unwrap();

      toast.success(response?.message || "Project updated successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update project";
      toast.error(msg);
    }
  };

  const handleInitiateDelete = (index: number, resource: any) => {
    if (resource.id || resource._id) {
      setCurrentDeletionId(resource.id || resource._id);
      setCurrentDeletionIndex(index);
      setShowConfirmationModal(true);
    } else {
      setAllocatedResources((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const confirmDelete = async () => {
    if (!currentDeletionId) return;

    try {
      const response = await deleteAllocation(currentDeletionId).unwrap();
      toast.success("Allocation deleted successfully");

      if (currentDeletionIndex !== null) {
        setAllocatedResources((prev) =>
          prev.filter((_, i) => i !== currentDeletionIndex),
        );
      }

      closeModal();
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || "An unexpected error occurred while deleting.";
      toast.error(errorMessage);
      console.error("Delete failed:", err);
    }
  };

  const closeModal = () => {
    setCurrentDeletionId(null);
    setCurrentDeletionIndex(null);
    setShowConfirmationModal(false);
  };

  const formId = "edit-project-form";

  return (
    <>
      <Modal
        isOpen={true}
        onClose={loading ? () => {} : onClose}
        title="Edit Project"
        size="4xl"
        loading={loading}
        maskClosable={false}
        footer={
          <ModalFooter>
            <ModalButton
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </ModalButton>
            <ModalButton
              variant="primary"
              type="submit"
              form={formId}
              loading={isUpdating}
            >
              Update Project
            </ModalButton>
          </ModalFooter>
        }
      >
        <form id={formId} onSubmit={handleSubmit} className="space-y-8">
          {/* Project Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Project Information
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input
                  label="Project Name"
                  required
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={(val) => handleChange("projectName", val)}
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Client Name"
                  required
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={(val) => handleChange("clientName", val)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Domain <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.domain}
                  onChange={(v) => handleChange("domain", v)}
                  options={domainOptions}
                  placeholder="Select Domain"
                  searchable
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Priority <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.priority}
                  onChange={(v) => handleChange("priority", v)}
                  options={priorityOptions}
                  placeholder="Select Priority"
                  searchable
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.category}
                  onChange={(v) => handleChange("category", v)}
                  options={categoryOptions}
                  placeholder="Select Category"
                  searchable
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Resource Count"
                  placeholder="Enter Resource Count"
                  required
                  type="number"
                  value={formData.capacity ?? ""}
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "Tab",
                      "ArrowLeft",
                      "ArrowRight",
                    ];

                    if (allowedKeys.includes(e.key)) return;

                    // Allow digits only
                    if (/^[0-9]$/.test(e.key)) {
                      const current = String(formData.capacity ?? "");

                      if (current.length >= 3) {
                        e.preventDefault();
                      }
                      return;
                    }

                    e.preventDefault();
                  }}
                  onChange={(val) => {
                    let clean = String(val).replace(/\D/g, "");

                    // Restrict max 3 digits
                    clean = clean.slice(0, 3);

                    let num = Number(clean);

                    // Auto-correct if > 500
                    if (num > 500) {
                      clean = "500";
                      num = 500;
                    }
                    handleChange("capacity", clean === "" ? "" : num);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <TextArea
                label="Project Description"
                value={formData.projectDescription}
                onChange={(value) => handleChange("projectDescription", value)}
                required
                placeholder="Enter project description"
                minRows={4}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Timeline & Management
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={formData.startDate ? dayjs(formData.startDate) : null}
                  onChange={(d) =>
                    handleChange("startDate", d ? d.format("YYYY-MM-DD") : "")
                  }
                  format="DD/MM/YYYY"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={formData.endDate ? dayjs(formData.endDate) : null}
                  onChange={(d) =>
                    handleChange("endDate", d ? d.format("YYYY-MM-DD") : "")
                  }
                  format="DD/MM/YYYY"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  POC (Point of Contact) <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.poc}
                  onChange={(val) => handleChange("poc", val as string)}
                  options={employeeOptions}
                  position="top"
                  placeholder="Select POC"
                  searchable
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  options={statusOptions}
                  onChange={(v) => handleChange("status", v)}
                />
              </div>
            </div>

            {selectedStatusLabel === "inactive" && (
              <div className="space-y-2">
                <TextArea
                  label="Inactive Reason"
                  required
                  value={formData.inActiveReason}
                  onChange={(value) =>
                    handleChange("inActiveReason", value)
                  }
                  placeholder="Provide reason for making project inactive"
                  minRows={4}
                  maxLength={500}
                />
              </div>
            )}
          </div>

          {/* Allocated Resources */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Allocated Resources
            </h3>

            {allocatedResources.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">No resources allocated.</p>
                <button
                  type="button"
                  onClick={() => setOpenAllocationModal(true)}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium"
                >
                  <PlusCircle className="w-5 h-5" /> Add Resource Allocation
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {allocatedResources.map((r, index) => (
                  <div
                    key={index}
                    className="relative p-4 border border-slate-200 rounded-lg bg-white shadow-soft hover:shadow-soft transition-shadow"
                  >
                    <div className="space-y-4 pb-1">
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-slate-500 mb-1">
                            Resource
                          </span>
                          <span
                            onClick={() => handleInitiateDelete(index, r)}
                            className="group p-1 border border-red-500 hover:border-red-600 hover:bg-red-100/50 rounded-full cursor-pointer"
                          >
                            <X className="h-3 w-3 text-red-500 group-hover:text-red-600" />
                          </span>
                        </div>
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {capitalizeWords(
                            `${r.userId?.firstName || ""} ${r.userId?.lastName || ""}`,
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col space-y-2">
                          <Input
                            type="number"
                            label="Allocation %"
                            required
                            min={1}
                            max={100}
                            value={r.allocationPercentage}
                            onChange={(val) =>
                              updateResourceField(
                                index,
                                "allocationPercentage",
                                Number(val),
                              )
                            }
                          />
                        </div>

                        <div className="flex flex-col space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Grade
                          </label>
                          <Select
                            value={r.grade}
                            onChange={(v) =>
                              updateResourceField(index, "grade", v)
                            }
                            options={gradeOptions}
                            placeholder="Select Grade"
                            searchable
                          />
                        </div>

                        <div className="flex flex-col space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Role <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={r.projectRole}
                            onChange={(v) =>
                              updateResourceField(index, "projectRole", v)
                            }
                            options={roleOptions}
                            placeholder="Select Role"
                            searchable
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <DatePicker
                            value={r?.startDate ? dayjs(r?.startDate) : null}
                            onChange={(d) =>
                              updateResourceField(
                                index,
                                "startDate",
                                d ? d.format("YYYY-MM-DD") : "",
                              )
                            }
                            format="DD/MM/YYYY"
                          />
                        </div>

                        <div className="flex flex-col space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            End Date <span className="text-red-500">*</span>
                          </label>
                          <DatePicker
                            value={r?.endDate ? dayjs(r?.endDate) : null}
                            onChange={(d) =>
                              updateResourceField(
                                index,
                                "endDate",
                                d ? d.format("YYYY-MM-DD") : "",
                              )
                            }
                            format="DD/MM/YYYY"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setOpenAllocationModal(true)}
                  className="flex items-center justify-center gap-2 w-full lg:w-auto px-4 py-3 text-primary-600 hover:text-primary-700 hover:bg-primary-50 font-medium rounded-lg border-2 border-dashed border-slate-300 hover:border-primary-400 transition-all"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add Resource Allocation</span>
                </button>
              </div>
            )}
          </div>

          {/* Billable */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Additional Details
            </h3>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="billable-checkbox"
                checked={formData.billable}
                onChange={(e) => handleChange("billable", e.target.checked)}
                className="w-4 h-4 text-primary-600 border-slate-300 rounded"
              />
              <label
                htmlFor="billable-checkbox"
                className="text-sm font-semibold text-slate-700 cursor-pointer"
              >
                Billable
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {openAllocationModal && (
        <ResourceAllocationModal
          projectId={projectId}
          onClose={() => setOpenAllocationModal(false)}
          onSave={(newResource: ResourceAllocationPayload) => {
            setAllocatedResources((prev) => [...prev, newResource]);
            setOpenAllocationModal(false);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={showConfirmationModal}
        type="danger"
        title="Delete Allocation"
        message="Are you sure you want to delete this allocation?"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        onClose={() => setShowConfirmationModal(false)}
      />
    </>
  );
};

export default EditProjectModel;
