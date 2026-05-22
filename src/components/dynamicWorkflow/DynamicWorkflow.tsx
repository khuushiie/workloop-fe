import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button, SearchInput, Select } from "../common";
import toast from "react-hot-toast";
import FilterWrapper from "../common/FilterWrapper";
import { WorkflowCard, WorkflowModule } from "./components/workflow/WorkflowCard";
import { WorkflowStats } from "./components/workflow/WorkflowStats";
import { CreateWorkflowDialog } from "./components/workflow/CreateWorkflowDialog";
import { EditWorkflowDialog } from "./components/workflow/EditWorkflowDialog";
import { WorkflowSkeleton } from "./components/workflow/WorkflowSkeleton";
import {
  useGetWorkflowDefinitionsQuery,
  useCreateWorkflowDefinitionMutation,
  useUpdateWorkflowDefinitionMutation,
  IWorkflowDefinition,
  useDeleteWorkflowDefinitionMutation,
} from "../../store/apis/dynamicWorkflow.api"; // Adjust path as needed
import { getLabelForModules } from "../../utils/dynamicworkflow/workflowUtils";

// Expected payload from the dialog
interface WorkflowLevelPayload {
  groupId: string;
  sequence: number;
  canBeSkipped: boolean;
}

const DynamicWorkflow = () => {
  // RTK Query Hooks
  const { data: workflowsResponse, isLoading } = useGetWorkflowDefinitionsQuery();
  const [createWorkflow, { isLoading: isCreating }] = useCreateWorkflowDefinitionMutation();
  const [updateWorkflow, { isLoading: isUpdating }] = useUpdateWorkflowDefinitionMutation();
  const [deleteWorkflow, { isLoading: isDeleting }] = useDeleteWorkflowDefinitionMutation();

  // Local UI State
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Storing the raw API definition for editing
  const [editingWorkflow, setEditingWorkflow] = useState<IWorkflowDefinition | null>(null);

  // Safely extract the data array
  const workflows = workflowsResponse?.data?.definitions || [];

  // Filter logic
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      const matchSearch =
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        getLabelForModules(w.permissionCode).toLowerCase().includes(search.toLowerCase());

      const statusStr = w.isActive ? "active" : "inactive";
      const matchStatus = !statusFilter || statusFilter === "all" || statusStr === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [workflows, search, statusFilter]);

  // Handle Create
  const handleSave = async (data: {
    name: string;
    description: string;
    permissionCode: string;
    isActive?: boolean;
    canAdminApprove: boolean;
    levels: WorkflowLevelPayload[];
  }) => {
    try {
      await createWorkflow({
        name: data.name,
        description: data.description,
        permissionCode: data.permissionCode,
        isActive: data.isActive ?? false,
        canAdminApproveMidFlow: data.canAdminApprove,
        steps: data.levels.map((level) => ({
          groupId: level.groupId,
          sequence: level.sequence,
          canBeSkipped: level.canBeSkipped,
        })),
      }).unwrap();

      setCreateOpen(false);
      toast.success(`"${data.name}" has been created successfully.`);
    } catch (error) {
      toast.error("Failed to create workflow. Please try again.");
      console.error(error);
    }
  };

  // Handle Edit Setup
  const handleEdit = (workflow: IWorkflowDefinition) => {
    setEditingWorkflow(workflow);
    setEditOpen(true);
  };

  // Handle Update
  const handleEditSave = async (data: {
    module: string;
    name: string;
    description: string;
    levels: WorkflowLevelPayload[];
    canAdminApprove: boolean;
    isActive: boolean;
  }) => {
    if (!editingWorkflow?.id) return;

    try {
      await updateWorkflow({
        id: editingWorkflow.id,
        data: {
          name: data.name,
          description: data.description,
          canAdminApproveMidFlow: data.canAdminApprove,
          isActive: data.isActive,
          steps: data.levels.map((level) => ({
            groupId: level.groupId,
            sequence: level.sequence,
            canBeSkipped: level.canBeSkipped,
          })),
        },
      }).unwrap();

      setEditOpen(false);
      setEditingWorkflow(null);
      toast.success(`"${data.name}" has been updated.`);
    } catch (error) {
      toast.error("Failed to update workflow. Please try again.");
      console.error(error);
    }
  };

  // Handle Delete (Mocked until delete endpoint is provided in your API slice for definitions)
  const handleDelete = async (id: string) => {
      try{
        await deleteWorkflow({
          id,
          data: {
            isActive: false,
          },
        }).unwrap();
        toast.success("Workflow deleted successfully.");
      }catch(error: any){
        toast.error(error.data.message || "Failed to delete workflow. Please try again.");
        console.error(error);
      }
  };

  // Helper to format API data to what WorkflowCard expects
  const formatForUI = (apiWorkflow: IWorkflowDefinition): WorkflowModule => {
    return {
      id: apiWorkflow.id as string,
      name: apiWorkflow.name,
      description: apiWorkflow.description || "",
      module: apiWorkflow.permissionCode || "",
      isActive: apiWorkflow.isActive,
      levels: [
        { label: "E", type: "employee" as const },
        ...(apiWorkflow.steps || []).map((step) => ({
          label: `L${step.sequence}`,
          type: "level" as const,
        })),
      ],
      createdAt: apiWorkflow.createdAt || "Recently"
    };
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 md:text-3xl">
                Manage Workflow
              </h1>
            </div>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-primary text-primary-foreground gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Workflow
          </Button>
        </div>

        {/* Stats */}
        <WorkflowStats stats={workflowsResponse?.data?.stats}/>

        {/* Filters */}
        <FilterWrapper>
          <div className="flex items-center gap-2">
          <SearchInput
            label="Search"
            value={search}
            onChange={setSearch}
            placeholder="Search by name or module"
            className="w-80"
          />
            <Select
              label="Status"
              className="w-80"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as string);
              }}
              options={
                [
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]
              }
              />
          </div>
        </FilterWrapper>

        {/* Workflow cards */}
        <div className="space-y-3">
          {isLoading ? (
            <WorkflowSkeleton count={3} />
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No workflows found.</p>
            </div>
          ) : (
            filteredWorkflows.map((apiWorkflow) => (
              <WorkflowCard
                key={apiWorkflow.id}
                workflow={formatForUI(apiWorkflow)}
                onEdit={() => handleEdit(apiWorkflow)}
                onDelete={() => handleDelete(apiWorkflow.id as string)}
                isDeleting={isDeleting}
              />
            ))
          )}
        </div>

        <CreateWorkflowDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSave={handleSave}
          isCreating={isCreating}
        // Optionally pass isCreating if your dialog supports a loading spinner
        />

        {editingWorkflow && (
          <EditWorkflowDialog
            open={editOpen}
            onOpenChange={(isOpen) => {
              setEditOpen(isOpen);
              if (!isOpen) setEditingWorkflow(null);
            }}
            // Pass the raw API object so the form can populate the groups and checkboxes!
            workflow={editingWorkflow}
            onSave={handleEditSave}
            isUpdating={isUpdating}
          />
        )}
      </div>
    </div>
  );
};

export default DynamicWorkflow;