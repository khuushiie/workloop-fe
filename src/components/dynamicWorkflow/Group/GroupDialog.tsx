import React, { useState, useEffect, useMemo } from "react";
import { Search, Users, X } from "lucide-react";
import { useGetAllOrgUsersForFilterQuery } from "../../../store/apis/user.api";
import { useGetMasterConfigByCategoryQuery } from "../../../store/apis/masterConfig.api";
import { Button, Input, RadioButton } from "../../common";
import { IApprovalGroup } from "../../../store/apis/dynamicWorkflow.api";
import { TextArea } from "../../common/TextArea";

// Types and Dummy Data
export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
}

export interface ApprovalGroup {
  id?: string | undefined;
  name: string;
  description: string;
  status: "active" | "inactive";
  memberIds: string[];
  groupType?: string;
  isSystemGroup?: boolean;
}

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ApprovalGroup | null;
  onSave: (data: IApprovalGroup) => void;
  isLoading: boolean;
  statusOption: { value: string; label: string }[];
}


export function GroupDialog({ open, onOpenChange, initialData, onSave, isLoading, statusOption }: GroupDialogProps) {

  const { data: employees, isLoading: isLoadingEmployees } = useGetAllOrgUsersForFilterQuery();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const isEditing = !!initialData;


  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description);
        setStatus(initialData.status);
        setSelectedMembers(initialData.memberIds);
      } else {
        setName("");
        setDescription("");
        setStatus("");
        setSelectedMembers([]);
      }
      setEmployeeSearch("");
    }
  }, [open, initialData]);

  const filteredEmployees = useMemo(() => {
    return employees?.filter(emp =>
      emp.fullName.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  }, [employees, employeeSearch]);

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedMembers.length === 0 || !status) return;
    onSave({ name, description, status, memberIds: selectedMembers });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm !mt-0">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-0">
            {isEditing ? "Edit Approval Group" : "Create Approval Group"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="group-form" onSubmit={handleSave} className="space-y-6">

            {/* Top Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Group Name"
                required
                value={name}
                placeholder="Enter group name"
                onChange={(val) => setName(String(val))}
              />

              <div className="flex flex-col gap-1.5">

                <RadioButton
                  label="Status"
                  options={statusOption?.length > 0 ? statusOption : [
                    { label: "Active", value: "true" },
                    { label: "Inactive", value: "false" },
                  ]}
                  disabled={statusOption?.length === 0}
                  value={status}
                  onChange={(v) => setStatus(v as string)}
                  name="status"
                  required
                />
              </div>
            </div>

            {/* Description Textarea */}
            <TextArea
              label="Group Description"
              value={description}
              placeholder="Enter group description"
              onChange={(val: string) => setDescription(val)}
              minRows={2}
            />

            {/* Member Selection Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Group Members <span className="text-red-500">*</span>
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {selectedMembers.length} Selected
                </span>
              </div>

              <Input
                placeholder="Search employees by name"
                value={employeeSearch}
                onChange={(val) => setEmployeeSearch(String(val))}
                leftIcon={<Search className="w-4 h-4 text-gray-400" />}
              />

              <div className="border border-gray-200 rounded-lg h-60 overflow-y-auto bg-white divide-y divide-gray-100">
                {isLoadingEmployees ? (
                  <div className="p-4 text-center text-sm text-gray-500">Loading employees...</div>
                ) : filteredEmployees?.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No employees found.</div>
                ) : (
                  filteredEmployees?.map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(emp.id)}
                        onChange={() => toggleMember(emp.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-gray-900 mb-0 ">{emp.fullName} </p>
                        <p className="text-sm font-medium text-gray-900 mb-1">  •  </p>  
                        <p className="text-xs text-gray-500 mb-0">{emp.empCode}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button
            appearance="ghost"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            appearance="primary"
            loading={isLoading}
            disabled={!name || selectedMembers.length === 0 || status === "" || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isEditing ? "Update Group" : "Create Group"}
          </Button>
        </div>

      </div>
    </div>
  );
}