import React, { useEffect, useMemo, useState } from "react";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { ApprovalGroup, GroupDialog } from "./GroupDialog";
import { GroupStats } from "./components/GroupStats";
import { TableSkeleton } from "../../../utils/SkeletonUtils";
import FilterWrapper from "../../common/FilterWrapper";
import { Button, SearchInput, ConfigurableTable, SimpleTooltip, ConfirmationModal, Pagination, Select } from "../../common";
import { TableColumn } from "../../common/Table";
import {
  ApprovalGroupType,
  IApprovalGroup,
  useCreateApprovalGroupMutation,
  useDeleteApprovalGroupMutation,
  useGetApprovalGroupsQuery,
  useUpdateApprovalGroupMutation
} from "../../../store/apis/dynamicWorkflow.api";
import { useGetUsersForFilterQuery } from "../../../store/apis/user.api";
import { useGetMasterConfigByCategoryQuery } from "../../../store/apis/masterConfig.api";
import { getLabelValue, getStatusLabel } from "../../../utils/dynamicworkflow/workflowUtils";
import { useDebounce } from "../../../utils/debounce";
import Badge from "../../common/Badge";


const ManageGroups = () => {

  const { data: employees } = useGetUsersForFilterQuery();
  const { data: statusData, isLoading: isLoadingStatus } = useGetMasterConfigByCategoryQuery('group_status', {
    refetchOnMountOrArgChange: true,
  });

  const statusOption = useMemo(() => {
    if (!statusData) return [];
    return statusData.map((s) => ({ value: s.id, label: s.displayName ?? s.filterCode }));
  }, [statusData]);

  const [createApprovalGroup, { isLoading: isCreating }] = useCreateApprovalGroupMutation();
  const [updateApprovalGroup, { isLoading: isUpdating }] = useUpdateApprovalGroupMutation();

  const [groups, setGroups] = useState<ApprovalGroup[]>([]);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);
  const { data: groupsData, isLoading } = useGetApprovalGroupsQuery({
    page,
    limit,
    status: statusFilter,
    search: debouncedSearch.trim() !== "" ? debouncedSearch : undefined,
  });
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteApprovalGroupMutation();

  useEffect(() => {
    if (groupsData?.data?.items) {
      setGroups(
        groupsData.data.items.map((g) => ({
          ...g,
          description: g.description || "",
          status: (g.status as "active" | "inactive") || "active",
          memberIds: g.memberIds || [],
          groupType: g.groupType,
          isSystemGroup: g.isSystemGroup,
        }))
      );
    }
  }, [groupsData]);

  // Dialog states for Create/Edit
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ApprovalGroup | null>(null);

  const filtered = groups;

  const handleDelete = async (id: string) => {
    try {
      await deleteGroup(id).unwrap();
      toast.success("The group has been removed.");
    } catch {
      toast.error("Failed to delete group.");
    }
  };

  const handleEdit = (id: string) => {
    const groupToEdit = groups.find((g) => g.id === id);
    if (groupToEdit) {
      setEditingGroup(groupToEdit);
      setDialogOpen(true);
    }
  };

  const handleCreateClick = () => {
    setEditingGroup(null);
    setDialogOpen(true);
  };

  const handleSaveGroup = async (data: IApprovalGroup) => {
    try {
      if (editingGroup) {
        await updateApprovalGroup({ id: editingGroup.id!, data }).unwrap();
      } else {
        await createApprovalGroup(data).unwrap();
      }
      setDialogOpen(false);
      toast.success("Group saved successfully.");
    } catch {
      toast.error("Failed to save group.");
    }
  };

  // Table Columns Definition
  const columns: TableColumn<ApprovalGroup>[] = [
    {
      key: "name",
      title: "Group Name",
      label: "Group Name",
      required: true,
      dataIndex: "name",
      render: (_: unknown, record: ApprovalGroup) => (
        <div className="flex items-center gap-2">
          <span>{record.name}</span>
          {record.isSystemGroup && (
            <Badge variant="blue">System</Badge>
          )}
        </div>
      ),
    },
    {
      key: "description",
      title: "Description",
      label: "Description",
      dataIndex: "description",
      render: (_value: unknown, record: ApprovalGroup) => {
        const text = record.description || "";
        return (
          <SimpleTooltip
            label={text || "No Description Found"}
            side="top"
            delay={500}
          >
            <div className="max-w-[300px] truncate">
              {text || <div className=" ml-10 text-gray-400"> - </div>}
            </div>
          </SimpleTooltip>
        );
      },
    },
    {
      key: "members",
      title: "Members",
      label: "Group Members",
      dataIndex: "memberIds",
      render: (_value: unknown, record: ApprovalGroup) => {
        const members = (record.memberIds || []) as string[];
        if (record.isSystemGroup) {
          const label = record.groupType === ApprovalGroupType.REPORTING_AUTHORITY
            ? "Requester's Reporting Manager"
            : "Requester's Functional Manager";
          return (
            <span className="bg-blue-50 text-blue-700 text-[12px] rounded-full py-1 px-3 inline-block">
              {label}
            </span>
          );
        }
        if (!members || members.length === 0) {
          return (
            <div className="text-zinc-500 text-[12px] py-1 px-3 inline-block">
              No Members
            </div>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {members.length < 4 ? (
              members.map((member, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-900 text-[12px] rounded-full py-1 px-3 inline-block"
                >
                  {getLabelValue(employees, member) || ""}
                </span>
              ))
            ) : (
              <>
                {members.slice(0, 3).map((member, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-900 text-[12px] rounded-full py-1 px-3 inline-block"
                  >
                    {getLabelValue(employees, member) || ""}
                  </span>
                ))}
                <SimpleTooltip
                  label={
                    <div className="flex flex-wrap gap-1 p-1 max-w-[200px]">
                      {members.slice(3).map((member, i) => (
                        <span
                          key={i}
                          className="bg-slate-700 text-white text-[10px] rounded-full py-0.5 px-2 inline-block"
                        >
                          {getLabelValue(employees, member) || ""}
                        </span>
                      ))}
                    </div>
                  }
                  side="top"
                  delay={300}
                >
                  <span className="bg-blue-100/70 text-blue-500/70 text-[12px] rounded-full py-1 px-3 inline-block cursor-pointer">
                    +{members.length - 3} more
                  </span>
                </SimpleTooltip>
              </>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      dataIndex: "status",
      render: (_value: unknown, record: ApprovalGroup) => {
        const status = record.status as string | undefined;
        return (
          <Badge variant={getStatusLabel(statusData, status)?.toLowerCase() === "active" ? "green" : "red"}>
            {getStatusLabel(statusData, status)}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_, record: ApprovalGroup) => {
        if (record.isSystemGroup) {
          return (
            <span className="text-xs text-gray-400 italic">Non-editable</span>
          );
        }
        return (
          <div className="flex items-center space-x-2">
            <SimpleTooltip label="Edit Group" side="top" delay={300}>
              <button
                type="button"
                className="w-5 h-5 cursor-pointer text-green-600 hover:text-green-700 transition-colors"
                onClick={() => handleEdit(record?.id || "")}
              >
                <SquarePen className="w-4 h-4" />
              </button>
            </SimpleTooltip>

            <SimpleTooltip label="Delete Group" side="top" delay={300}>
              <button
                type="button"
                className="w-5 h-5 cursor-pointer text-red-600 hover:text-red-700 transition-colors"
                onClick={() => {
                  setConfirmDialog(true);
                  setSelectedGroupId(record?.id || "");
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </SimpleTooltip>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="p-6 max-w-full mx-auto">
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2 md:text-3xl">
                  Manage Groups
                </h1>
              </div>
            </div>
          </div>

          {/* Stats */}
          <GroupStats />

          {/* Filters */}
          <FilterWrapper>
            <div className="flex items-center gap-2 w-full">
              <SearchInput
                label="Search"
                value={search}
                onChange={setSearch}
                placeholder="Search groups by name or description..."
                className="w-80"
              />
              <Select
                label="Status"
                className="w-80"
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as string);
                  setPage(1);
                }}
                options={statusOption}
              />
            </div>
          </FilterWrapper>

          {/* Groups Table */}
          {isLoading ? (
            <TableSkeleton columns={5} rows={limit} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <ConfigurableTable<ApprovalGroup>
                columns={columns}
                data={filtered}
                striped={true}
                configOptions={{ persistenceKey: "manage-groups-table" }}
                renderColumnSelector={(selector) => (
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Groups ({filtered.length})
                    </h3>
                    <div className="flex items-center gap-4">
                      <Button appearance="primary" size="small" onClick={handleCreateClick}>
                        <Plus className="w-4 h-4 mr-1" /> Create Group
                      </Button>
                      {selector}
                    </div>
                  </div>
                )}
              />
              <Pagination
                currentPage={groupsData?.data?.pagination?.page || 1}
                totalItems={groupsData?.data?.pagination?.total || 0}
                itemsPerPage={groupsData?.data?.pagination?.limit || limit}
                onItemsPerPageChange={(newLimit: number) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                onPageChange={(p: number) => setPage(p)}
              />
            </div>
          )}

          {/* Create / Edit Dialog */}
          <GroupDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            initialData={editingGroup}
            statusOption={statusOption}
            onSave={handleSaveGroup}
            isLoading={isCreating || isUpdating}
          />
        </div>
      </div>

      <ConfirmationModal
        type="danger"
        isLoading={isDeleting}
        isOpen={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        title="Delete Group"
        message="Are you sure you want to delete this group?"
        onConfirm={() => {
          handleDelete(selectedGroupId || "");
          setConfirmDialog(false);
        }}
      />
    </>
  );
};

export default ManageGroups;