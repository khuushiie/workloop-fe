import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { Modal, ModalFooter, ModalButton, Select, Input, RadioButton } from "../../../common";
import { TextArea } from "../../../common/TextArea";
import { Plus, Trash2 } from "lucide-react";
import { WorkflowVisualization } from "./WorkflowVisualization";
import { useGetApprovalGroupsQuery, IWorkflowDefinition } from "../../../../store/apis/dynamicWorkflow.api";
import { MODULES } from "../../../../utils/dynamicworkflow/constants";

interface IWorkflowLevel {
    groupId: string;
    sequence: number;
    canBeSkipped: boolean;
}

interface IEditWorkflowDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workflow: IWorkflowDefinition | null; 
    onSave: (data: {
        module: string;
        name: string;
        description: string;
        levels: IWorkflowLevel[];
        isActive: boolean;
        canAdminApprove: boolean;
    }) => void;
    isUpdating?: boolean;
}

const emptyLevel: IWorkflowLevel = {
    groupId: "",
    sequence: 1,
    canBeSkipped: false,
};

export function EditWorkflowDialog({
    open,
    onOpenChange,
    workflow,
    onSave,
    isUpdating
}: IEditWorkflowDialogProps) {
    const { data: groupsResponse, isLoading: isLoadingGroups } = useGetApprovalGroupsQuery();

    const [module, setModule] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [levels, setLevels] = useState<IWorkflowLevel[]>([{ ...emptyLevel }]);
    const [canAdminApprove, setCanAdminApprove] = useState(true);
    const [status, setStatus] = useState("");

    const moduleOptions = Object.values(MODULES).map((m) => ({
        label: m.label,
        value: m.category_code,
    }));

    const groupOptions = useMemo(() => {
        if (!groupsResponse?.data?.items) return [];
        return groupsResponse.data.items
            .filter((s) => s.id !== undefined)
            .map((s) => ({
                value: s.id as string,
                label: s.isSystemGroup ? `${s.name} (System)` : s.name,
            }));
    }, [groupsResponse]);
    // Populate form when modal opens with the selected workflow
    useEffect(() => {
        console.log(workflow)
        if (open && workflow) {
            setModule(workflow.permissionCode || "");
            setName(workflow.name || "");
            setDescription(workflow.description || "");
            setCanAdminApprove(workflow.canAdminApproveMidFlow ?? true);
            setStatus(workflow.isActive ? "true" : "false");
            
            const savedLevels = workflow.steps || [];
            if (savedLevels.length > 0) {
                setLevels(savedLevels.map((step) => ({
                    groupId: step.groupId,
                    sequence: step.sequence,
                    canBeSkipped: step.canBeSkipped,
                })));
            } else {
                setLevels([{ ...emptyLevel }]);
            }
        }
    }, [open, workflow]);

    const addLevel = () => {
        setLevels((p) => [
            ...p,
            { ...emptyLevel, sequence: p.length + 1 }
        ]);
    };

    const removeLevel = (index: number) => {
        if (levels.length > 0) {
            setLevels((p) => {
                const newLevels = p.filter((_, i) => i !== index);
                return newLevels.map((level, i) => ({ ...level, sequence: i + 1 }));
            });
        }
    };

    const updateLevel = (index: number, updates: Partial<IWorkflowLevel>) => {
        setLevels((prev) =>
            prev.map((l, i) => (i === index ? { ...l, ...updates } : l))
        );
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!module || !name || !workflow) return;

        if(levels.length === 0){
            toast.error("Please add at least one level");
            return;
        }

        const hasIncompleteLevels = levels.some((level) => !level.groupId);
        if (hasIncompleteLevels) {
            toast.error("Please select an approval group for all levels");
            return;
        }

        onSave({ module, name, description, levels, canAdminApprove, isActive: status !== "false" });
    };

    const previewLevels = [
        { label: "E", type: "employee" as const },
        ...levels.map((_, i) => ({ label: `L${i + 1}`, type: "level" as const })),
    ];

    const formId = "edit-workflow-form";

    return (
        <Modal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title="Edit Workflow"
            size="2xl"
            maskClosable={false}
            bodyClassName="space-y-6"
            footer={
                <ModalFooter>
                    <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </ModalButton>
                    <ModalButton
                        variant="primary"
                        type="submit"
                        form={formId}
                        disabled={!module || !name || isUpdating}
                    >
                        Update Workflow
                    </ModalButton>
                </ModalFooter>
            }
        >
            <form id={formId} onSubmit={handleSave} className="space-y-6">

                
                    <Input
                        label="Workflow Name"
                        required
                        value={name}
                        placeholder="Enter workflow name"
                        onChange={(v) => setName(v as string)}
                    />
                <TextArea
                    label="Description"
                    value={description}
                    placeholder="Enter workflow description"
                    onChange={(v: string) => setDescription(v)}
                    minRows={3}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select
                        label="Module"
                        disabled
                        required
                        value={module}
                        onChange={(v) => setModule(v as string)}
                        options={moduleOptions}
                        placeholder="Select module"
                        searchable
                    />
                   <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                            Workflow Status <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-4 h-[38px]">
                            {/* <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                <input
                                    type="radio"
                                    name="status"
                                    value="true"
                                    checked={status !== "false"}
                                    onChange={() => setStatus("true")}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                Active
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                <input
                                    type="radio"
                                    name="status"
                                    value="false"
                                    checked={status === "false"}
                                    onChange={() => setStatus("false")}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                Inactive
                            </label> */}
                            <RadioButton
                                options={[
                                    { label: "Active", value: "true" },
                                    { label: "Inactive", value: "false" },
                                ]}
                                value={status}
                                onChange={(v) => setStatus(v as string)}
                                name="status"
                                required
                            />
                        </div>
                    </div>

                </div>


                <div className="bg-gray-50 border rounded-lg p-4 flex justify-center">
                    <WorkflowVisualization levels={previewLevels} />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 mb-0">
                            Approval Levels
                        </h3>

                        <button
                            type="button"
                            onClick={addLevel}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Add Level
                        </button>
                    </div>

                    {levels.map((level, index) => (
                        <div
                            key={index}
                            className="border rounded-lg p-5 bg-white space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-800">
                                    Level {level.sequence}
                                </span>

                                {levels.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeLevel(index)}
                                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="max-w-sm">
                                <Select
                                    label="Approval Group"
                                    value={level.groupId}
                                    onChange={(v) => updateLevel(index, { groupId: v as string })}
                                    options={groupOptions}
                                    placeholder={isLoadingGroups ? "Loading groups..." : "Select group"}
                                    searchable
                                />
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
                                <label className={`flex items-center gap-2 text-sm ${index === levels.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}>
                                    <input
                                        type="checkbox"
                                        checked={level.canBeSkipped && index !== levels.length - 1} // Ensure last level cannot be skipped visually
                                        disabled={index === levels.length - 1}
                                        onChange={(e) =>
                                            updateLevel(index, {
                                                canBeSkipped: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    Can Be Skipped
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={canAdminApprove}
                            onChange={(e) => setCanAdminApprove(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                        />
                        Admin can approve mid-flow
                    </label>
                </div>
            </form>
        </Modal>
    );
}