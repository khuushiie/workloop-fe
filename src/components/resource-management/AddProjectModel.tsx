import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DatePicker, Select } from "../common";
import Modal, { ModalFooter, ModalButton } from "../common/Modal";
import { apiService } from "../../services/api";
import { capitalizeWords } from "../../utils/nameUtils";
import Input from "../common/Input";
import { IUserDetail } from "../../types/user.api.types";
import { TextArea } from "../common/TextArea";
import { useGetConfigsByCategoryCodeQuery } from "../../store/apis/masterConfig.api";
import { useAuth } from "../../store/hooks/useAuth";
import { useGetUsersForFilterQuery } from "../../store/apis/user.api";
import { useCreateProjectMutation } from "../../store/apis/resource-allocation/project-management.api";

dayjs.extend(utc);
dayjs.extend(timezone);

interface AddProjectModelProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddProjectModel: React.FC<AddProjectModelProps> = ({
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const [employees, setEmployees] = useState<IUserDetail[]>([]);

  const { data: rawDomain } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_domain" });
  const { data: rawStatus } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_status" });
  const { data: rawPriority } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_priority" }); 
  const { data: rawCategories } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_category" });

  const categoryOptions = useMemo(() => {
      const list = rawCategories?.data || [];
      return list.map((item: any) => ({
        label: item.displayName || item.filterCode,
        value: item.id ?? item._id,
      }));
    }, [rawCategories]);
  
  const statusOptions = useMemo(() => {
      const list = rawStatus?.data || [];
      return list.map((item: any) => ({
        label: item.displayName || item.filterCode,
        value: item.id ?? item._id,
      }));
    }, [rawStatus]);
  
  const domainOptions = useMemo(() => {
      const list = rawDomain?.data || [];
      return list.map((item: any) => ({
        label: item.displayName || item.filterCode,
        value: item.id ?? item._id,
      }));
    }, [rawDomain]);
  
  const priorityOptions = useMemo(() => {
      const list = rawPriority?.data || [];
      return list.map((item: any) => ({
        label: item.displayName || item.filterCode,
        value: item.id ?? item._id,
      }));
    }, [rawPriority]);

  const { data: rawEmployees } = useGetUsersForFilterQuery({ 
    includeInactive: false 
  });

  const employeeOptions = useMemo(() => {
    const list = Array.isArray(rawEmployees) ? rawEmployees : [];

    return list.map((user: any) => ({
      label: user.fullName,
      value: user.id,
    }));
  }, [rawEmployees]);

  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    clientName: "",
    capacity: null as number | null,
    domain: "",
    priority: "",
    startDate: "",
    endDate: "",
    status: "active",
    poc: "",
    billable: false,
    category: "",
    inActiveReason: "",
  });

  const { user } = useAuth();

  const handleChange = (
    name: string,
    value: string | number | boolean | (string | number)[] | null,
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const selectedStatusLabel = useMemo(() => {
    const selectedOption = statusOptions.find(opt => opt.value === formData.status);
    return selectedOption?.label?.toLowerCase() || "";
  }, [formData.status, statusOptions]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

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

    // --- Required field validation ---
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
      cleanedFormData.capacity === null ||
      cleanedFormData.capacity <= 0 ||
      cleanedFormData.capacity > 500
    ) {
      return toast.error("Capacity must be between 1 and 500");
    }

    // --- Date validation ---
    if (
      dayjs(cleanedFormData.endDate).isBefore(dayjs(cleanedFormData.startDate))
    ) {
      return toast.error("End Date cannot be before Start Date");
    }

    // --- Inactive reason validation (FIXED precedence bug) ---
    if (
      (selectedStatusLabel === "inactive") &&
      !cleanedFormData.inActiveReason
    ) {
      return toast.error("Inactive reason required");
    }

    // --- Payload ---
    const payload = {
      name: cleanedFormData.projectName,
      description: cleanedFormData.projectDescription,
      clientName: cleanedFormData.clientName,
      capacity: Number(cleanedFormData.capacity),
      startDate: cleanedFormData.startDate,
      endDate: cleanedFormData.endDate,
      poc: cleanedFormData.poc,
      billable: cleanedFormData.billable,
      domain: cleanedFormData.domain,
      priority: cleanedFormData.priority,
      status: cleanedFormData.status,
      category: cleanedFormData.category,
      createdBy: user?.id,
      inActiveReason:
        selectedStatusLabel === "inactive"
          ? cleanedFormData.inActiveReason
          : undefined,
    };

    try {
      const response = await createProject(payload).unwrap();
      toast.success(response?.message || "Project created successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to create project";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const formId = "add-project-form";

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Add New Project"
      size="4xl"
      loading={loading}
      maskClosable={false}
      footer={
        <ModalFooter>
          <ModalButton
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </ModalButton>
          <ModalButton
            variant="primary"
            type="submit"
            form={formId}
            loading={isLoading}
          >
            Add Project
          </ModalButton>
        </ModalFooter>
      }
      closable={!loading}
      bodyClassName="space-y-8"
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-8 ">
        {/* Project Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
            Project Information
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Input
                label="Project Name"
                required
                type="text"
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
                min={0}
                max={500}
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

                  handleChange("capacity", clean === "" ? null : num);
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <TextArea
              label="Project Description"
              value={formData.projectDescription}
              required
              onChange={(value) => handleChange("projectDescription", value)}
              placeholder="Enter project description"
              minRows={4}
            />
          </div>
        </div>

        {/* Timeline & Management Section */}
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
                placeholder="Select POC"
                searchable
                position="top"
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
                value={formData.inActiveReason}
                onChange={(value) =>
                  handleChange("inActiveReason", value)
                }
                placeholder="Provide reason for making project inactive"
                minRows={4}
                required
              />
            </div>
          )}
        </div>

        {/* Additional Details Section */}
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
  );
};

export default AddProjectModel;
