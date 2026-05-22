import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Trash2, Send, SquarePen } from "lucide-react";
import { ConfirmationModal, Pagination, SearchInput, ConfigurableTable } from "../common";
import { TableColumn } from "../common/Table";
import FilterWrapper from "../common/FilterWrapper";
import { useDebounce, DEBOUNCE_DELAYS } from "../../utils/debounce";
import SetFormModal from "./modals/SetFormModal";
import BulkAssignModal from "./modals/BulkAssignModal";
import EditUserModal from "./modals/EditUserModal";
import KpiModal from "./modals/KpiModal";
import KpiFormModal from "./modals/KpiFormModal";
import { Dropdown, Menu } from "antd";
import Button from "../common/Button";
import {
  AppstoreAddOutlined,
  EllipsisOutlined,
  EyeOutlined,
  PlusOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import SimpleTooltip from "../common/SimpleTooltip";
import ViewUserSetsModal from "./modals/ViewUserSetsModal";
import {
  GroupedSetsSkeleton,
  StatsGridSkeleton,
  UserListSkeleton,
} from "./Skeleton";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import Badge from "../common/Badge";
import {
  useCreateKpiMutation,
  useUpdateKpiMutation,
  useLazyGetKpisQuery,
  useLazyGetKpiStatsQuery,
  useGetKpiSetsQuery,
  useGetKpisQuery,
  useCreateKpiSetMutation,
  useUpdateKpiSetMutation,
  useDeleteKpiSetMutation,
  useLazyGetSetAssignmentsListQuery,
  useBulkCreateAssignmentsMutation,
  useDeleteAssignmentMutation,
} from "../../store/apis/kpi.api";
import {
  IKpiResponseV2,
  KpiTimeline,
  KPI_TIMELINE_VALUES,
} from "../../types/kpi.api.types";
import type {
  KpiSetAssignmentRecord,
  KpiSetRow,
} from "./KpiAssignment.types";
import type { IUserListItem } from "../../types/user.api.types";
import { KpiSetAssignmentStatus } from "./KpiAssignment.types";
import { getErrorMessage } from "./KpiAssignment.types";
import type { SetFormSubmitData } from "./modals/SetFormModal";

const defaultStats = {
  totalActiveSets: 0,
  totalActiveKpis: 0,
  totalActiveEmployees: 0,
  totalAssignedUsersActive: 0,
};

const KpiAssignment: React.FC = () => {
  const navigate = useNavigate();
  const canManage = useHasPermission(PERMISSIONS.KPI_ASSIGNMENTS_MANAGE);
  const [createKpi] = useCreateKpiMutation();
  const [updateKpi] = useUpdateKpiMutation();
  const [fetchKpis] = useLazyGetKpisQuery();
  const [
    fetchKpiStats,
    {
      data: statsData,
      isLoading: isStatsLoading,
      isUninitialized: isStatsUninitialized,
    },
  ] = useLazyGetKpiStatsQuery();
  const [createKpiSet] = useCreateKpiSetMutation();
  const [updateKpiSet] = useUpdateKpiSetMutation();
  const [deleteKpiSet] = useDeleteKpiSetMutation();
  const [fetchSetAssignmentsList] = useLazyGetSetAssignmentsListQuery();
  const [bulkCreateAssignments] = useBulkCreateAssignmentsMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();

  useEffect(() => {
    fetchKpiStats();
  }, [fetchKpiStats]);
  const { data: kpiSetsResult, isLoading: isSetsLoading } = useGetKpiSetsQuery(
    { includeKpis: true },
    { refetchOnMountOrArgChange: true },
  );
  const { data: kpisForSetForm } = useGetKpisQuery();

  const [users, setUsers] = useState<IUserListItem[]>([]);
  const [kpis, setKpis] = useState<IKpiResponseV2[]>([]);
  const [assignments, setAssignments] = useState<KpiSetAssignmentRecord[]>([]);
  const [kpisModalLoading, setKpisModalLoading] = useState(false);
  const stats = statsData ?? defaultStats;
  const sets: KpiSetRow[] = kpiSetsResult?.data ?? [];
  const setsKpis = kpisForSetForm?.data ?? [];
  const loading =
    (isStatsLoading || isStatsUninitialized) || isSetsLoading;
  const [userSearch, setUserSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal states
  const [showSetModal, setShowSetModal] = useState(false);
  const [editingSet, setEditingSet] = useState<KpiSetRow | null>(null);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUserListItem | null>(null);
  const [viewUser, setViewUser] = useState<IUserListItem | null>(null);
  const [selectedSetsForUser, setSelectedSetsForUser] = useState<Set<string>>(
    new Set(),
  );
  const [showKpiModal, setShowKpiModal] = useState(false);
  const [showKpiForm, setShowKpiForm] = useState(false);

  interface DeleteModal {
    open: boolean;
    setId: string | null;
  }

  const debouncedSearch = useDebounce(userSearch, DEBOUNCE_DELAYS.SEARCH);
  const [deleteKpiModal, setdeleteKpiModal] = useState<DeleteModal>({
    open: false,
    setId: null,
  });

  useEffect(() => {
    loadData();
  }, [page, limit, debouncedSearch]);

  const refetchKpisForModal = useCallback(async () => {
    setKpisModalLoading(true);
    try {
      const kpisResult = await fetchKpis({}).unwrap();
      setKpis(kpisResult?.data ?? []);
    } catch {
      setKpis([]);
    } finally {
      setKpisModalLoading(false);
    }
  }, [fetchKpis]);

  useEffect(() => {
    if (showKpiModal) {
      refetchKpisForModal();
    }
  }, [showKpiModal]);

  useEffect(() => {
    if (userSearch !== debouncedSearch) {
      setSearchLoading(true);
    } else {
      setSearchLoading(false);
    }
  }, [userSearch, debouncedSearch]);

  const loadData = useCallback(async () => {
    try {
      setSearchLoading(true);
      const result = await fetchSetAssignmentsList({
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        status: "ACTIVE",
      }).unwrap();
      const list = result?.data ?? [];
      const mappedUsers: IUserListItem[] = list.map((item) => ({
        id: item.userId,
        fullName: item.fullName ?? "",
        workEmail: item.email ?? "",
        employeeId: item.employeeId ?? "",
        status: "",
        department: item.department ?? "",
        departmentName: item.department ?? "",
        designation: item.position ?? "",
        designationName: item.position ?? "",
      }));
      const flatAssignments: KpiSetAssignmentRecord[] = list.flatMap((item) =>
        (item.assignedSets ?? [])
          .filter((s) => s.status === KpiSetAssignmentStatus.ACTIVE)
          .map((s) => ({
            _id: s.assignmentId,
            userId: item.userId,
            setId: s.setId,
            status: KpiSetAssignmentStatus.ACTIVE as KpiSetAssignmentRecord["status"],
          }))
      );
      setUsers(mappedUsers);
      setTotalUsers(result?.total ?? 0);
      setAssignments(flatAssignments);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load assignment list");
      setUsers([]);
      setTotalUsers(0);
      setAssignments([]);
    } finally {
      setSearchLoading(false);
    }
  }, [page, limit, debouncedSearch, fetchSetAssignmentsList]);

  const getAssignedSets = useCallback(
    (userId: string) => {
      return assignments.filter(
        (a) => a.userId === userId && a.status === KpiSetAssignmentStatus.ACTIVE,
      );
    },
    [assignments],
  );

  const groupedSets = useMemo(
    () => ({
      [KpiTimeline.WEEKLY]: sets.filter((s) => s.timeline === KpiTimeline.WEEKLY),
      [KpiTimeline.MONTHLY]: sets.filter((s) => s.timeline === KpiTimeline.MONTHLY),
      [KpiTimeline.YEARLY]: sets.filter((s) => s.timeline === KpiTimeline.YEARLY),
    }),
    [sets],
  );

  // Set CRUD handlers
  const handleCreateSet = useCallback(() => {
    setEditingSet(null);
    setShowSetModal(true);
  }, []);

  const handleEditSet = useCallback((set: KpiSetRow) => {
    setEditingSet(set);
    setShowSetModal(true);
  }, []);

  const handleDeleteSetModal = useCallback((setId: string) => {
    setdeleteKpiModal({ open: true, setId });
  }, []);

  const handleDeleteSet = useCallback(
    async (setId: string) => {
      if (!setId) return;
      try {
        await deleteKpiSet(setId).unwrap();
        toast.success("Set deleted successfully");
        setdeleteKpiModal({ open: false, setId: null });
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to delete set"));
      }
    },
    [deleteKpiSet],
  );

  const handleSaveSet = useCallback(
    async (data: SetFormSubmitData) => {
      try {
        const kpiIds = Array.isArray(data.kpis) ? data.kpis : [];
        const body = {
          code: data.code ?? "",
          name: data.name ?? "",
          description: data.description,
          timeline: data.timeline ?? KpiTimeline.WEEKLY,
          kpiIds,
          points: 1,
        };
        if (editingSet) {
          await updateKpiSet({ id: editingSet.id, body }).unwrap();
          toast.success("Set updated successfully");
        } else {
          await createKpiSet(body).unwrap();
          toast.success("Set created successfully");
        }
        setShowSetModal(false);
      } catch (err) {
        toast.error(
          getErrorMessage(
            err,
            `Failed to ${editingSet ? "update" : "create"} set`,
          ),
        );
      }
    },
    [editingSet, createKpiSet, updateKpiSet],
  );

  const assignmentsByUser = useMemo(() => {
    const map = new Map<string, KpiSetAssignmentRecord[]>();
    for (const assignment of assignments) {
      const userId = assignment.userId;
      if (!userId) continue;
      if (!map.has(userId)) map.set(userId, []);
      map.get(userId)!.push(assignment);
    }
    return map;
  }, [assignments]);

  const handleCreateKpi = useCallback(() => {
    setShowKpiForm(true);
  }, []);

  const handleSaveKpi = useCallback(
    async (data: { id?: string } & Partial<IKpiResponseV2>) => {
      try {
        const body = {
          code: data.code ?? "",
          name: data.name ?? "",
          description: data.description,
          category: data.category,
          isActive: data.isActive !== false,
        };
        const kpiId = data.id;
        if (kpiId) {
          await updateKpi({ id: kpiId, body }).unwrap();
          toast.success("KPI updated successfully");
        } else {
          await createKpi(body).unwrap();
          toast.success("KPI created successfully");
        }
        setShowKpiForm(false);
        await loadData();
      } catch (err) {
        const fallback = data.id ? "Failed to update KPI" : "Failed to create KPI";
        toast.error(getErrorMessage(err, fallback));
      }
    },
    [createKpi, updateKpi, loadData],
  );

  const handleBulkAssign = useCallback(() => {
    setShowBulkAssignModal(true);
  }, []);

  const openEditUserSets = useCallback(
    (user: IUserListItem) => {
      const userId = user.id;
      setEditingUser(user);
      const assigned = getAssignedSets(userId).map((a) => a.setId);
      setSelectedSetsForUser(new Set(assigned.filter(Boolean) as string[]));
      setShowEditUserModal(true);
    },
    [getAssignedSets],
  );

  const openViewUserSets = useCallback(
    (user: IUserListItem) => {
      const userId = user.id;
      setViewUser(user);
      const assigned = getAssignedSets(userId).map((a) => a.setId);
      setSelectedSetsForUser(new Set(assigned.filter(Boolean) as string[]));
      setShowViewUserModal(true);
    },
    [getAssignedSets],
  );

  const toggleUserSetSelection = useCallback((setId: string) => {
    setSelectedSetsForUser((prev) => {
      const n = new Set(prev);
      if (n.has(setId)) n.delete(setId);
      else n.add(setId);
      return n;
    });
  }, []);

  const saveUserSetAssignments = useCallback(
    async (setIds: string[]) => {
      if (!editingUser) return;
      const userId = editingUser.id;
      const newSetIds = new Set(setIds);
      const existingForUser = assignments.filter(
        (a) => a.userId === userId && a.status === KpiSetAssignmentStatus.ACTIVE
      );
      const toRemove = existingForUser.filter((a) => !newSetIds.has(a.setId));
      const currentSetIds = new Set(existingForUser.map((a) => a.setId));
      const toAdd = setIds.filter((setId) => !currentSetIds.has(setId));
      try {
        for (const a of toRemove) {
          await deleteAssignment(a._id).unwrap();
        }
        if (toAdd.length > 0) {
          await bulkCreateAssignments({ userId, setIds: toAdd }).unwrap();
        }
        toast.success("User assignments updated");
        setShowEditUserModal(false);
        setEditingUser(null);
        await loadData();
        await fetchKpiStats();
      } catch (err) {
        toast.error(
          getErrorMessage(err, "Failed to update user assignments"),
        );
      }
    },
    [editingUser, assignments, deleteAssignment, bulkCreateAssignments, loadData, fetchKpiStats],
  );

  const handleSaveBulkAssignment = useCallback(
    async (data: {
      userIds: string[];
      setIds: string[];
      assignmentMode: "add" | "replace";
    }) => {
      if (!data.setIds.length || !data.userIds.length) return;
      try {
        setShowBulkAssignModal(false);
        await loadData();
        await fetchKpiStats();
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to assign sets"));
      }
    },
    [loadData, fetchKpiStats],
  );

  const toTitleCase = (s?: unknown) =>
    String(s || "")
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");

  // Table columns for sets
  const setColumns: TableColumn<KpiSetRow>[] = [
    {
      key: "name",
      title: "Set Name",
      label: "Set Name",
      required: true,
      dataIndex: "name",
      render: (value: any) => (
        <span className="font-medium text-slate-900">{value}</span>
      ),
    },
    {
      key: "code",
      title: "Code",
      label: "Code",
      dataIndex: "code",
      render: (value: any) => (
        <div className="flex items-center w-[150px]">
          <SimpleTooltip label={value} side="bottom">
            <span className="text-slate-600 max-w-[150px] block overflow-hidden text-ellipsis whitespace-nowrap ">
              {value}
            </span>
          </SimpleTooltip>
        </div>
      ),
    },
    {
      key: "description",
      title: "Description",
      label: "Description",
      dataIndex: "description",
      render: (value: any) => (
        <div className="flex items-center w-[250px]">
          <SimpleTooltip label={value || "No Description"} side="bottom">
            <span className="text-slate-600 max-w-[250px] block overflow-hidden text-ellipsis whitespace-nowrap">
              {value || "-"}
            </span>
          </SimpleTooltip>
        </div>
      ),
    },
    {
      key: "kpis",
      title: "KPIs in Set",
      label: "KPIs in Set",
      render: (_: unknown, record: KpiSetRow) => {
        const kpiNames: string[] = (record.kpis ?? []).map(
          (k: IKpiResponseV2) => k.name ?? "",
        );
        const firstThree = kpiNames.slice(0, 3);
        const remaining = Math.max(0, kpiNames.length - 3);

        return (
          <div className="flex flex-wrap gap-1 max-w-md">
            {record.kpis && record.kpis.length > 0 ? (
              <>
                {firstThree.map((name, idx) => (
                  <Badge key={idx} variant="blue" className="max-w-64 truncate">
                    <div className="truncate">
                    {name}
                    </div>
                  </Badge>
                ))}
                {remaining > 0 && (
                  <SimpleTooltip
                    label={
                      <div className="py-2 px-1 flex flex-col items-start gap-2">
                        {kpiNames.map((name, idx) => (
                          <Badge
                          className="max-w-64 whitespace-normal px-2 rounded-xl"
                           key={idx} variant="blue">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    }
                    side="top"
                  >
                    <Badge variant="gray">+{remaining} more</Badge>
                  </SimpleTooltip>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-400">No KPIs</span>
            )}
          </div>
        );
      },
    },
    {
      key: "totalKpis",
      title: "Total KPIs",
      label: "Total KPIs",
      render: (_: any, record: KpiSetRow) => (
        <span className="text-slate-900 font-medium">
          {record.kpis?.length ?? 0}
        </span>
      ),
    },
    {
      key: "points",
      title: "Points",
      label: "Points",
      render: (_: any, record: KpiSetRow) => (
        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
          {record.points ?? 1}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_: any, record: KpiSetRow) => (
        <div className="flex gap-2">
          <SimpleTooltip
            label="Edit"
            side="top"
            className="inline-block"
            tooltipClassName=" text-xs shadow-soft border-0"
          >
            <button
              onClick={() => handleEditSet(record)}
              aria-label="Edit Set"
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <SquarePen className="w-4 h-4" aria-hidden="true" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip
            label="Delete"
            side="top"
            className="inline-block"
            tooltipClassName=" text-xs shadow-soft border-0"
          >
            <button
              onClick={() => handleDeleteSetModal(record.id)}
              aria-label="Delete Set"
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  // Table columns for users
  const userColumns: TableColumn<IUserListItem>[] = [
    {
      key: "user",
      title: "Employee",
      label: "Employee",
      required: true,
      render: (_: any, record: IUserListItem) => {
        const displayName = record.fullName ?? record.email ?? record.workEmail ?? "Unknown";
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-900">
              {displayName}
            </span>
          </div>
        );
      },
    },
    {
      key: "workEmail",
      title: "Email",
      label: "Email",
      dataIndex: "workEmail",
      render: (value: any) => (
        <span className="text-sm text-slate-600">{value}</span>
      ),
    },
    {
      key: "assignedSets",
      title: "Assigned Sets",
      label: "Assigned Sets",
      render: (_: any, record: IUserListItem) => {
        const userId = record.id;
        const userAssignedSets = assignmentsByUser.get(userId) ?? [];

        return (
          <div className="flex flex-wrap gap-1"> 
            {userAssignedSets.slice(0, 2).map((assignment) => {
              const setId = assignment.setId;
              const set = setId ? sets.find((s) => s.id === setId) : null;
              return (
                <Badge key={assignment._id} variant="blue">
                  {set?.name ?? "Unknown"} ({set?.timeline ?? "N/A"})
                </Badge>
              );
            })}
            {userAssignedSets.length > 2 && (
              <SimpleTooltip label={
                <div className="py-2 px-1 flex flex-col items-start gap-2">
                  {userAssignedSets.slice(2).map((assignment) => {
                    const setId = assignment.setId;
                    const set = setId ? sets.find((s) => s.id === setId) : null;
                    return (
                      <Badge key={assignment._id} variant="blue">
                        {set?.name ?? "Unknown"} ({set?.timeline ?? "N/A"})
                      </Badge>
                    );
                  })}
                </div>
              } side="top" tooltipClassName="text-xs shadow-soft border-0">
              <Badge variant="gray">+{userAssignedSets.length - 2} more</Badge>
              </SimpleTooltip>
            )}
            {userAssignedSets.length === 0 && (
              <span className="text-xs text-slate-500">No sets assigned</span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_: any, record: IUserListItem) => {
        const userId = record.id;
        return (
          <div className="flex justify-left items-center gap-3">
            {canManage && (
              <SimpleTooltip
                label="Edit"
                side="top"
                className="inline-block"
                tooltipClassName=" text-xs shadow-soft border-0"
              >
                <button
                  onClick={() => openEditUserSets(record)}
                  aria-label="Edit"
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <SquarePen className="w-4 h-4" aria-hidden />
                </button>
              </SimpleTooltip>
            )}

            <SimpleTooltip
              label="View"
              side="top"
              className="inline-block"
              tooltipClassName=" text-xs shadow-soft border-0"
            >
              <button
                onClick={() => openViewUserSets(record)}
                aria-label="View"
                className="text-primary-600 hover:text-primary-800 transition-colors"
              >
                <Eye className="w-4 h-4 " />
              </button>
            </SimpleTooltip>

            <SimpleTooltip
              label="Send"
              side="top"
              className="inline-block"
              tooltipClassName="text-xs shadow-soft border-0"
            >
              <button
                onClick={() => navigate(`/kpi/user-details/${userId}`)}
                aria-label="Send"
                className="text-slate-600 hover:text-slate-800 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </SimpleTooltip>
          </div>
        );
      },
    },
  ];

  const menu = (
    <Menu>
      {canManage && (
        <Menu.Item key="1" icon={<PlusOutlined />} onClick={handleCreateKpi}>
          Create KPI
        </Menu.Item>
      )}
      <Menu.Item
        key="2"
        icon={<EyeOutlined />}
        onClick={() => setShowKpiModal(true)}
      >
        View All KPIs
      </Menu.Item>
      {canManage && (
        <>
          <Menu.Item
            key="3"
            icon={<AppstoreAddOutlined />} // Changed icon for "Create Set"
            onClick={handleCreateSet}
          >
            Create Set
          </Menu.Item>
          <Menu.Item
            key="4"
            icon={<UsergroupAddOutlined />}
            onClick={handleBulkAssign}
          >
            Assign Sets to Users
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            KPI Assignment & Set Management
          </h1>
        </div>
        <div className="flex gap-3">
          <Dropdown overlay={menu} trigger={["click"]} overlayStyle={{ zIndex: 30 }}>
            <Button
              appearance="secondary"
              icon={<EllipsisOutlined />}
              className="px-4 py-2 flex items-center justify-center"
            >
              Actions
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <StatsGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white px-6 py-4 rounded-lg shadow-soft border border-slate-200">
            <p className="text-sm font-medium text-slate-600">Total Sets</p>
            <p className="text-2xl font-bold text-slate-900 m-0">
              {stats.totalActiveSets}
            </p>
          </div>
          <div className="bg-white px-6 py-4 rounded-lg shadow-soft border border-slate-200">
            <p className="text-sm font-medium text-slate-600">Total KPIs</p>
            <p className="text-2xl font-bold text-slate-900 m-0">
              {stats.totalActiveKpis}
            </p>
          </div>
          <div className="bg-white px-6 py-4 rounded-lg shadow-soft border border-slate-200">
            <p className="text-sm font-medium text-slate-600">Total Employees</p>
            <p className="text-2xl font-bold text-slate-900 m-0">
              {stats.totalActiveEmployees}
            </p>
          </div>
          <div className="bg-white px-6 py-4 rounded-lg shadow-soft border border-slate-200">
            <p className="text-sm font-medium text-slate-600">
              Total Assigned Employees
            </p>
            <p className="text-2xl font-bold text-slate-900 m-0">
              {stats.totalAssignedUsersActive}
            </p>
          </div>
        </div>
      )}

      {/* KPI Sets by Timeline - Tabular Format */}
      {loading ? (
        <GroupedSetsSkeleton />
      ) : (
        KPI_TIMELINE_VALUES.map((timeline) => (
          <div
            key={timeline}
            className="bg-white rounded-lg shadow-soft border border-slate-200"
          >
            <div className="p-0">
              <ConfigurableTable
                columns={setColumns}
                data={groupedSets[timeline]}
                emptyMessage={`No ${timeline.toLowerCase()} sets created yet`}
                maxHeight="400px"
                configOptions={{ persistenceKey: `kpi-sets-${timeline.toLowerCase()}` }}
                renderColumnSelector={(selector) => (
                  <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold capitalize text-slate-900">
                        {toTitleCase(timeline)} Sets
                      </h2>
                      <span className="text-sm text-slate-500">
                        ({groupedSets[timeline].length} sets)
                      </span>
                    </div>
                    {selector}
                  </div>
                )}
              />
            </div>
          </div>
        ))
      )}

      {/* User Assignments Table */}
      <div className="bg-white rounded-lg shadow-soft border border-slate-200">
        <div className="px-6 pt-4">
          <FilterWrapper>
            <SearchInput
              value={userSearch}
              onChange={setUserSearch}
              placeholder="Search employees..."
              label="Search Employee"
            />
          </FilterWrapper>
        </div>

        {loading || searchLoading ? (
          <UserListSkeleton />
        ) : (
          <div className="p-6 pt-0">
            <ConfigurableTable
              columns={userColumns}
              data={users}
              emptyMessage="No employee found"
              maxHeight="500px"
              loading={searchLoading}
              configOptions={{ persistenceKey: "kpi-employee-assignments" }}
              renderColumnSelector={(selector) => (
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center -mx-6 mb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    Employee Set Assignments
                  </h2>
                  {selector}
                </div>
              )}
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      {loading || searchLoading ? (
        ""
      ) : (
        <Pagination
          currentPage={page}
          totalItems={totalUsers}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      {/* Set Creation/Edit Modal */}
      <SetFormModal
        isOpen={showSetModal}
        onClose={() => setShowSetModal(false)}
        onSubmit={handleSaveSet}
        editingSet={editingSet}
        kpis={setsKpis}
      />

      {/* Bulk Assignment Modal */}
      <BulkAssignModal
        isOpen={showBulkAssignModal}
        onClose={() => setShowBulkAssignModal(false)}
        onSubmit={handleSaveBulkAssignment}
        sets={sets}
      />

      {/* Edit Single User Assignments Modal */}
      <EditUserModal
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        onSubmit={saveUserSetAssignments}
        user={editingUser}
        sets={sets}
        selectedSets={selectedSetsForUser}
        onSetToggle={toggleUserSetSelection}
      />

      <ViewUserSetsModal
        isOpen={showViewUserModal}
        onClose={() => setShowViewUserModal(false)}
        user={viewUser}
        sets={sets}
        selectedSets={selectedSetsForUser}
      />

      {/* View All KPIs Modal */}
      <KpiModal
        isOpen={showKpiModal}
        onClose={() => setShowKpiModal(false)}
        kpis={kpis}
        onRefresh={refetchKpisForModal}
        canManage={canManage}
        isLoading={kpisModalLoading}
      />

      {/* Create KPI Modal */}
      <KpiFormModal
        isOpen={showKpiForm}
        onClose={() => setShowKpiForm(false)}
        onSubmit={handleSaveKpi}
      />

      <ConfirmationModal
        isOpen={deleteKpiModal.open}
        onClose={() => setdeleteKpiModal({ open: false, setId: null })}
        onConfirm={() => {
          if (deleteKpiModal?.setId) {
            handleDeleteSet(deleteKpiModal.setId);
          }
        }}
        type="danger"
        title="Delete Set"
        message="Are you sure you want to delete this set?"
      />
    </div>
  );
};

export default KpiAssignment;
