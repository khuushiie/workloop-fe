import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DatePicker, Select } from "../common";
import Modal, { ModalFooter, ModalButton } from "../common/Modal";
import Input from "../common/Input";
import { useGetUsersForFilterQuery } from "../../store/apis/user.api";
import { useGetProjectDropdownQuery } from "../../store/apis/resource-allocation/project-management.api";
import { useGetConfigsByCategoryCodeQuery } from "../../store/apis/masterConfig.api";
import { IUpsertAllocationRequest, useUpsertAllocationMutation } from "../../store/apis/resource-allocation/resource-allocation.api";

dayjs.extend(utc);
dayjs.extend(timezone);

interface ResourceAllocationModalProps {
  mode?: "projectToUser" | "userToProject"; 
  projectId?: string;
  userId?: string; 
  onClose: () => void;
  onSave: (resource: any) => void;
}

const formatOption = (item: any) => ({
  label: item?.displayName,
  value: item?.id ?? item?._id,
});

const ResourceAllocationModal: React.FC<ResourceAllocationModalProps> = ({
  mode = "projectToUser", 
  projectId,
  userId,
  onClose,
  onSave,
}) => {

  const [upsertAllocation, { isLoading: isSaving }] = useUpsertAllocationMutation();
  
  const { data: rawEmployees, isFetching } = useGetUsersForFilterQuery(
    { includeInactive: false }, 
  );
  
  const { data: projectOptions = [] } = useGetProjectDropdownQuery(
    undefined, 
    { skip: mode === "projectToUser" }
  );

  const { data: rawRoles } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_role" });
  const { data: rawGrades } = useGetConfigsByCategoryCodeQuery({ categoryCode: "allocation_grade" });

  const employeeOptions = useMemo(() => {
    const list = Array.isArray(rawEmployees) ? rawEmployees : [];
    return list.map((u: any) => ({
      label: u.fullName,
      value: u.id,
    }));
  }, [rawEmployees]);

  const roleOptions = useMemo(() => {
    const list = Array.isArray(rawRoles?.data) ? rawRoles.data : [];
    const items = list.map(formatOption);
    return Array.from(new Map(items.map((i: any) => [i.value, i])).values());
  }, [rawRoles]);

  const gradeOptions = useMemo(() => {
    const list = Array.isArray(rawGrades?.data) ? rawGrades.data : [];
    const items = list.map(formatOption);
    return Array.from(new Map(items.map((i: any) => [i.value, i])).values());
  }, [rawGrades]);

  const [formData, setFormData] = useState({
    userId: "",
    projectId: "",
    allocationPercentage: 0,
    projectRole: "",
    startDate: "",
    endDate: "",
    grade: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fieldLabels: Record<string, string> = {
    userId: "Employee",
    projectId: "Project",
    allocationPercentage: "Allocation Percentage",
    projectRole: "Project Role",
    startDate: "Allocation Start Date",
    endDate: "Allocation End Date",
  };

  const showRequiredError = (key: string) => {
    const label = fieldLabels[key] || key;
    toast.error(`${label} is required`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const required =
      mode === "projectToUser"
        ? [
            "userId",
            "allocationPercentage",
            "projectRole",
            "startDate",
            "endDate",
          ]
        : [
            "projectId",
            "allocationPercentage",
            "projectRole",
            "startDate",
            "endDate",
          ];

    // ---------- Required field validation ----------
    for (let key of required) {
      const value = formData[key as keyof typeof formData];

    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (typeof value === "number" && value <= 0)
    ) {
      return showRequiredError(key);
    }
  }

  // ---------- Allocation % validation ----------
  const allocation = Number(formData.allocationPercentage);

  if (
    allocation < 1 ||
    allocation > 100 ||
    !Number.isInteger(allocation)
  ) {
    return toast.error(
      "Allocation % must be between 1 and 100 and must be an integer"
    );
  }

  // ---------- Date validation ----------
  if (dayjs(formData.endDate).isBefore(dayjs(formData.startDate))) {
    return toast.error("End date cannot be before Start date");
  }

  const payload: IUpsertAllocationRequest = {
    userId: mode === "projectToUser" ? (formData.userId as string) : (userId as string),
    projectId: mode === "projectToUser" ? (projectId as string) : (formData.projectId as string),
    allocationPercentage: allocation,
    projectRole: formData.projectRole?.toLowerCase() || "",
    startDate: formData.startDate,
    endDate: formData.endDate,
    grade: formData.grade?.toLowerCase() || undefined,
  };

  try {
    const response = await upsertAllocation(payload).unwrap();

    onSave(response.data);
    toast.success(response?.message || "Allocation saved successfully!");
    onClose();
  } catch (err: any) {
    const errorMessage = err?.data?.message || err?.message || "Failed to save allocation";
    toast.error(errorMessage);
    console.error("Allocation Error:", err);
  }
};

  const formId = "resource-allocation-form";

  return (
    <Modal
      isOpen={true}
      onClose={isFetching ? () => { } : onClose}
      title={mode === "userToProject" ? "Assign Project" : "Allocate Resource"}
      size="lg"
      loading={isFetching}
      maskClosable={false}
      footer={
        <ModalFooter>
          <ModalButton variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </ModalButton>
          <ModalButton
            variant="primary"
            type="submit"
            form={formId}
            loading={isSaving}
          >
            {mode === "userToProject" ? "Assign" : "Save"}
          </ModalButton>
        </ModalFooter>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-6">
        {/* Select Employee WHEN assigning employee to project */}
        {mode === "projectToUser" && (
          <div>
            <Select
              label="Select Resource"
              value={formData.userId}
              onChange={(v) => handleChange("userId", v)}
              options={employeeOptions}
              required
            />
          </div>
        )}

        {/* Select Project WHEN assigning project to employee */}
        {mode === "userToProject" && (
          <div>
            <Select
              label="Select Project"
              value={formData.projectId}
              onChange={(v) => handleChange("projectId", v)}
              options={projectOptions}
              required
            />
          </div>
        )}

        {/* Allocation Percentage */}
        <div>
          <Input
            label="Allocation Percentage"
            type="number"
            required
            min={1}
            max={100}
            placeholder="Enter % (1-100)"
            value={formData.allocationPercentage}
            onChange={(val) => handleChange("allocationPercentage", val)}
          />
        </div>

        {/* Project Role */}
        <div>
          <Select
            label="Project Role"
            value={formData.projectRole}
            onChange={(v) => handleChange("projectRole", v)}
            options={roleOptions}
            placeholder="Select Project Role"
            searchable
            required
          />
        </div>

        {/* Grade */}
        <div>
          <Select
            label="Grade"
            value={formData.grade}
            onChange={(v) => handleChange("grade", v)}
            options={gradeOptions}
            placeholder="Select Grade"
            searchable
          />
        </div>

        {/* Start Date */}
        <div>
          <DatePicker
            label="Start Date"
            value={formData.startDate ? dayjs(formData.startDate) : null}
            onChange={(d) =>
              handleChange("startDate", d?.format("YYYY-MM-DD") || "")
            }
            format="DD/MM/YYYY"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <DatePicker
            label="End Date"
            value={formData.endDate ? dayjs(formData.endDate) : null}
            onChange={(d) =>
              handleChange("endDate", d?.format("YYYY-MM-DD") || "")
            }
            format="DD/MM/YYYY"
            required
          />
        </div>
      </form>
    </Modal>
  );
};

export default ResourceAllocationModal;
