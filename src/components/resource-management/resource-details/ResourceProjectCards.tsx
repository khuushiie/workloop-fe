import dayjs from "dayjs";
import { SquarePen, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useGetConfigsByCategoryCodeQuery } from "../../../store/apis/masterConfig.api";
import { IUpsertAllocationRequest, useUpsertAllocationMutation } from "../../../store/apis/resource-allocation/resource-allocation.api";
import { capitalizeWords } from "../../../utils/nameUtils";
import {
  DatePicker,
  ModalButton,
  Select
} from "../../common";
import Input from "../../common/Input";
export interface Option {
  label: string;
  value: string;
}

export interface AssignedBy {
  _id: string;
  firstName?: string;
  lastName?: string;
}
export interface ProjectInfo {
  _id: string;
  name?: string;
  description?: string;
  clientName?: string;

  capacity?: number;

  startDate?: string;
  endDate?: string;

  domain?: string;
  status?: string;
  priority?: string;
  category?: string;

  billable?: boolean;

  createdAt?: string;
  updatedAt?: string;

  poc?: string | null;
}
export interface AllocationItem {
  _id: string;

  userId: string;

  allocationPercentage?: number;

  projectRole?: string;
  grade?: string;

  startDate?: string;
  endDate?: string;

  assignedBy?: AssignedBy;

  projectId: ProjectInfo | null;

  createdAt?: string;
  updatedAt?: string;
}


interface FieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    {children}
  </div>
);

const getInitialId = (options: Option[], input: string | undefined | null): string => {
  if (!input) return "";

  const found = options.find(
    (opt) => opt.label === input || opt.value === input
  );
  return found ? String(found.value) : input;
};

interface ResourceProjectCardProps {
  data: AllocationItem;
  mode: "current" | "history";
  confirmDelete: (id: string) => void;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const ResourceProjectCard: React.FC<ResourceProjectCardProps> = ({ data, mode, confirmDelete, setShowDeleteModal }) => {
  const isHistory = mode === "history";

  const [editMode, setEditMode] = useState(false);

  const [upsertAllocation, { isLoading: isUpdating }] = useUpsertAllocationMutation();

  const { data: rawRoles } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_role" });
  const { data: rawDomain } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_domain" });
  const { data: rawStatuses } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_status" });
  const { data: rawPriorities } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_priority" });
  const { data: rawCategories } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_category" });
  const { data: rawGrades } = useGetConfigsByCategoryCodeQuery({ categoryCode: "allocation_grade" });

  const roleOptions = useMemo(() => {
    const list = rawRoles?.data || [];
    return list.map((item: any) => ({
      label: item.displayName,
      value: item.id ?? item._id,
    }));
  }, [rawRoles]);

  const domainOptions = useMemo(() => {
    const list = rawDomain?.data || [];
    return list.map((item: any) => ({
      label: item.displayName,
      value: item.id ?? item._id,
    }));
  }, [rawDomain]);

  const statusOptions = useMemo(() => {
    const list = rawStatuses?.data || [];
    return list.map((item: any) => ({
      label: item.displayName,
      value: item.id ?? item._id,
    }));
  }, [rawStatuses]);

  const categoryOptions = useMemo(() => {
    const list = rawCategories?.data || [];
    return list.map((item: any) => ({
      label: item.displayName,
      value: item.id ?? item._id,
    }));
  }, [rawCategories]);

  const priorityOptions = useMemo(() => {
    const list = rawPriorities?.data || [];
    return list.map((item: any) => ({
      label: item.displayName,
      value: item.id ?? item._id,
    }));
  }, [rawPriorities]);

  const gradeOptions = useMemo(() => {
    const list = rawGrades?.data || [];
    return list.map((item: any) => ({
      label: item.displayName,
      value: item.id ?? item._id,
    }));
  }, [rawGrades]);

  const [form, setForm] = useState<AllocationItem>({} as AllocationItem);


  useEffect(() => {
    if (!data) return;

    setForm({
      ...data,
      projectRole: getInitialId(roleOptions, data.projectRole || ""),
      grade: getInitialId(gradeOptions, data.grade || ""),
      startDate: data.startDate || "",
      endDate: data.endDate || "",
      projectId: data.projectId
        ? {
          ...data.projectId,
          domain: getInitialId(domainOptions, data.projectId.domain || ""),
          priority: getInitialId(priorityOptions, data.projectId.priority || ""),
          status: getInitialId(statusOptions, data.projectId.status || ""),
          category: getInitialId(categoryOptions, data.projectId.category || ""),
          billable: !!data.projectId.billable,
        }
        : null,
    });
  }, [data, roleOptions, gradeOptions, domainOptions, priorityOptions, statusOptions, categoryOptions, editMode]);

  const validateForm = () => {
    if (form.allocationPercentage == null) {
      toast.error("Allocation % is required");
      return false;
    }

    if (!form.projectRole) {
      toast.error("Project role is required");
      return false;
    }

    if (!form.startDate) {
      toast.error("Project Start date is required");
      return false;
    }

    if (!form.endDate) {
      toast.error("Project End date is required");
      return false;
    }

    if (dayjs(form.endDate).isBefore(dayjs(form.startDate))) {
      toast.error("End date cannot be before Start date");
      return false;
    }

    return true;
  };


  const handleSave = async () => {
    if (!validateForm()) return;

    const percent = Number(form.allocationPercentage);

    // Validation
    if (percent < 1 || percent > 100 || !Number.isInteger(percent)) {
      toast.error("Allocation % must be an integer between 1 and 100");
      return;
    }

    // Change Detection
    const isChanged =
      percent !== data?.allocationPercentage ||
      form.projectRole !== data?.projectRole ||
      form.startDate !== data?.startDate ||
      form.endDate !== data?.endDate ||
      form.grade !== data?.grade;

    if (!isChanged) {
      toast.error("Nothing to update");
      setEditMode(false);
      return;
    }

    const projectId = data.projectId?._id;
    if (!projectId) {
      toast.error("Project not found");
      return;
    }

    try {
      const upsertPayload: IUpsertAllocationRequest = {
        id: data._id,
        userId: data.userId,
        projectId: projectId,
        allocationPercentage: percent,
        projectRole: form.projectRole || "",
        startDate: form.startDate!,
        endDate: form.endDate!,
        grade: form.grade || null,
      };

      await upsertAllocation(upsertPayload).unwrap();

      toast.success("Allocation updated successfully");
      setEditMode(false);
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || "Save failed";
      console.error("Save failed:", err);
      toast.error(errMsg);
    }
  };

  const handleCancel = () => {
    setForm({
      ...data,
      projectRole: data.projectRole || "",
      grade: data.grade || "",
      startDate: data.startDate,
      endDate: data.endDate,

      projectId: data.projectId
      ? {
          ...data.projectId,
          domain: data.projectId.domain || "",
          priority: data.projectId.priority || "",
          status: data.projectId.status || "",
          category: data.projectId.category || "",
          billable: !!data.projectId.billable,
        }
      : null,
    });

    setEditMode(false);
  };

  const handleDelete = async () => {
    confirmDelete(data._id);
  };

  const getRoleDisplayName = (roleCode?: string) => {
    if (!roleCode) return "-";

    const option = roleOptions.find((opt) => opt.value === roleCode);
    return option ? option.label : roleCode;
  };

  const getCategoryDisplayName = (categoryCode?: string) => {
    if (!categoryCode) return "-";
    const option = categoryOptions.find((opt) => opt.value === categoryCode);
    return option ? option.label : categoryCode; // Fallback to code if not found
  };

  return (
    <div className="relative w-full bg-white p-5 border rounded-lg shadow-soft hover:shadow-soft transition-all mx-auto">
      {/* ACTION ICONS */}
      <div className="absolute top-5 right-4 lg:top-6 flex gap-3">
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="p-0 m-0 bg-transparent border-0 appearance-none cursor-pointer flex items-center justify-center"
          >
            <SquarePen
              size={20}
              className="text-green-700 hover:text-green-600"
            />
          </button>
        ) : (
          <></>
        )}
        <button
          onClick={handleDelete}
          className="p-0 m-0 bg-transparent border-0 appearance-none cursor-pointer flex items-center justify-center"
        >
          <Trash2 size={20} className="text-red-500 hover:text-red-600" />
        </button>
      </div>

      {/* PROJECT NAME */}
      <h3 className="text-xl font-semibold text-slate-900 mb-6 pr-4 lg:pr-10">
        <span className="block sm:hidden">
          {data.projectId?.name
            ?.split(" ")
            ?.reduce((lines: string[], word: string, index: number) => {
              const lineIndex = Math.floor(index / 3);
              lines[lineIndex] = (lines[lineIndex] || "") + " " + word;
              return lines;
            }, [])
            ?.map((line: string, i: number) => (
              <div key={i}>{line.trim()}</div>
            )) || "Not Assigned"}
        </span>

        <span className="hidden sm:block break-words whitespace-normal">
          {data.projectId?.name || "Not Assigned"}
        </span>
      </h3>

      {/* CURRENT PROJECT VIEW */}
      {!isHistory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field
            label={
              <>
                Allocation %{" "}
                {editMode && <span className="text-red-500">*</span>}
              </>
            }
          >
            {editMode ? (
              <Input
                type="number"
                label=""
                min={1}
                max={100}
                value={form.allocationPercentage || ""}
                onChange={(val) => {
                  const num = Number(val);
                  setForm({ ...form, allocationPercentage: num });
                }}
              />
            ) : (
              <span className="text-slate-500">{data.allocationPercentage}%</span>
            )}
          </Field>

          <Field
            label={
              <>
                Project Role{" "}
                {editMode && <span className="text-red-500">*</span>}
              </>
            }
          >
            {editMode ? (
              <Select
                value={form.projectRole}
                options={roleOptions}
                onChange={(v) =>
                  setForm({ ...form, projectRole: v as string })
                }
                placeholder="Select Role"
                searchable
              />
            ) : (
              <span className="text-slate-500">{getRoleDisplayName(data.projectRole)}</span>
            )}
          </Field>

          <Field
            label={
              <>
                Start Date {editMode && <span className="text-red-500">*</span>}
              </>
            }
          >
            {editMode ? (
              <DatePicker
                value={form.startDate ? dayjs(form.startDate) : null}
                onChange={(d) =>
                  setForm({
                    ...form,
                    startDate: d ? d.format("YYYY-MM-DD") : "",
                  })
                }
                format="DD/MM/YYYY"
              />
            ) : (
              <span className="text-slate-500">{dayjs(data.startDate).format("DD/MM/YYYY")}</span>
            )}
          </Field>

          <Field
            label={
              <>
                End Date {editMode && <span className="text-red-500">*</span>}
              </>
            }
          >
            {editMode ? (
              <DatePicker
                value={form.endDate ? dayjs(form.endDate) : null}
                onChange={(d) =>
                  setForm({ ...form, endDate: d ? d.format("YYYY-MM-DD") : "" })
                }
                format="DD/MM/YYYY"
              />
            ) : (
              <span className="text-slate-500">{dayjs(data.endDate).format("DD/MM/YYYY")}</span>
            )}
          </Field>

          <Field label={<>Grade</>}>
            {editMode ? (
              <Select
                value={form.grade}
                options={gradeOptions}
                onChange={(v) =>
                  setForm({ ...form, grade: v as string })
                }
                placeholder="Select Grade"
                searchable
                position="top"
              />
            ) : (
              <span>{(data.grade || '') || "-"}</span>
            )}
          </Field>
        </div>
      )}

      {/* HISTORY VIEW */}
      {isHistory && (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${editMode ? "max-h-60 overflow-y-auto pr-2" : ""
            }`}
        >
          <Field
            label={
              <>
                Allocation %{" "}
                {editMode && <span className="text-red-500">*</span>}
              </>
            }
          >
            {editMode ? (
              <Input
                type="number"
                min={1}
                max={100}
                value={form.allocationPercentage}
                onChange={(val) =>
                  setForm({ ...form, allocationPercentage: Number(val) })
                }
              />
            ) : (
              <span className="text-slate-500">{data.allocationPercentage}%</span>
            )}
          </Field>

          <Field
            label={
              <>
                Project Role{" "}
                {editMode && <span className="text-red-500">*</span>}
              </>
            }
          >
            {editMode ? (
              <Select
                value={form.projectRole}
                options={roleOptions}
                onChange={(v) =>
                  setForm({ ...form, projectRole: v as string })
                }

                placeholder="Select Role"
                searchable
              />
            ) : (
              <span className="text-slate-500">{getRoleDisplayName(data.projectRole)}</span>
            )}
          </Field>

          <Field
            label={
              <>
                Start Date {editMode && <span className="text-red-500">*</span>}
              </>
            }
          >
            {editMode ? (
              <DatePicker
                value={form.startDate ? dayjs(form.startDate) : null}
                onChange={(d) =>
                  setForm({
                    ...form,
                    startDate: d ? d.format("YYYY-MM-DD") : "",
                  })
                }
                format="DD/MM/YYYY"
              />
            ) : (
              <span className="text-slate-500">{dayjs(data.startDate).format("DD/MM/YYYY")}</span>
            )}
          </Field>

          <Field
            label={
              <>
                End Date {editMode && <span className="text-red-500">*</span>}
              </>
            }
          >
            {editMode ? (
              <DatePicker
                value={form.endDate ? dayjs(form.endDate) : null}
                onChange={(d) =>
                  setForm({ ...form, endDate: d ? d.format("YYYY-MM-DD") : "" })
                }
                format="DD/MM/YYYY"
              />
            ) : (
              <span className="text-slate-500">{dayjs(data.endDate).format("DD/MM/YYYY")}</span>
            )}
          </Field>

          <Field label={<>Grade</>}>
            {editMode ? (
              <Select
                value={form.grade}
                options={gradeOptions}
                onChange={(v) =>
                  setForm({ ...form, grade: v as string })
                }
              />
            ) : (
              <span className="text-slate-500">{data.grade || "-"}</span>
            )}
          </Field>
          <div className="h-4"></div>
          <Field label="Billable">
            <span className="text-slate-500">{data.projectId?.billable ? "Yes" : "No"}</span>
          </Field>

          <Field label="Category">
            <span className="text-slate-500">{getCategoryDisplayName(data.projectId?.category) || "-"}</span>
          </Field>

          <Field label="Status">
            <span className="text-slate-500">{capitalizeWords(data.projectId?.status) || "-"}</span>
          </Field>

          <Field label="Priority">
            <span className="text-slate-500">{capitalizeWords(data.projectId?.priority) || "-"}</span>
          </Field>

          <Field label="Client Name">
            <span className="text-slate-500">{data.projectId?.clientName || "-"}</span>
          </Field>

          <Field label="Assigned By">
            <span className="text-slate-500">
              {capitalizeWords(data.assignedBy?.firstName) +
                " " +
                capitalizeWords(data.assignedBy?.lastName)}
            </span>
          </Field>
        </div>
      )}

      {editMode && (
        <div className="flex gap-4 mt-6">
          <ModalButton variant="secondary" disabled={isUpdating} onClick={handleCancel}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" type="submit" loading={isUpdating} onClick={handleSave}>
            Update Project
          </ModalButton>
        </div>
      )}
    </div>
  );
};

export default ResourceProjectCard;
