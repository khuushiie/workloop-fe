import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../store/hooks/useAuth";
import {
  Trash2,
  Calendar as CalendarIcon,
  X as CloseIcon,
  Plus,
  Eye,
  Filter,
  ChevronDown,
  ChevronRight,
  SquarePen,
} from "lucide-react";
import SearchInput from "../common/SearchInput";
import { PLACEHOLDERS } from "../../utils/placeholders";
import Pagination from "../common/Pagination";
import KpiHeader from "./KpiHeader";
import KpiStatsCards from "./KpiStatsCards";
import UsersTable from "./UsersTable";
import { useDebounce, DEBOUNCE_DELAYS } from "../../utils/debounce";
import { RoleTypeEnum } from "../../utils/constants";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { TextArea } from "../common/TextArea";
import {
  useLazyGetKpiStatsQuery,
  useLazyGetKpisQuery,
} from "../../store/apis/kpi.api";
import { KpiTimeline, KPI_TIMELINE_VALUES } from "../../types/kpi.api.types";
import { KpiSetAssignmentStatus } from "./KpiAssignment.types";

const KpiManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin =
    user?.role?.toLowerCase() === RoleTypeEnum.ADMIN?.toLowerCase() ||
    user?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN?.toLowerCase();
  const canManage = useHasPermission(PERMISSIONS.KPI_ASSIGNMENTS_MANAGE);

  // Toggle between KPI and Set views
  const [viewMode, setViewMode] = useState<"kpis" | "sets">("sets");

  // KPI states
  const [kpis, setKpis] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingKpi, setEditingKpi] = useState<any>(null);
  const [kpiFormData, setKpiFormData] = useState({
    code: "",
    name: "",
    description: "",
    info: "",
    category: "",
    isActive: true,
  });
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showAssignScreen, setShowAssignScreen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedKpiIds, setSelectedKpiIds] = useState<Set<string>>(new Set());
  const [clientSideUserSearch, setClientSideUserSearch] = useState("");

  // Set management states
  const [sets, setSets] = useState<any[]>([]);
  const [showSetForm, setShowSetForm] = useState(false);
  const [editingSet, setEditingSet] = useState<any>(null);
  const [setFormData, setSetFormData] = useState({
    code: "",
    name: "",
    description: "",
    timeline: KpiTimeline.WEEKLY,
    kpis: [] as string[],
  });
  const [selectedSetKpis, setSelectedSetKpis] = useState<Set<string>>(
    new Set()
  );
  const [stats, setStats] = useState({
    totalKpis: 0,
    totalUsers: 0,
    usersWithKpis: 0,
  });
  const [viewModalKpisLoading, setViewModalKpisLoading] = useState(false);

  // Debounce search input using centralized hook
  const debouncedSearch = useDebounce(userSearch, DEBOUNCE_DELAYS.SEARCH);

  const [fetchKpiStats] = useLazyGetKpiStatsQuery();
  const [fetchKpis] = useLazyGetKpisQuery();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setAssignments([]);
        setUsers([]);
        setTotalUsers(0);
        setSets([]);
        const statsResult = await fetchKpiStats();
        if (statsResult.data) {
          setStats({
            totalKpis: statsResult.data.totalActiveKpis,
            totalUsers: statsResult.data.totalActiveEmployees,
            usersWithKpis: statsResult.data.totalAssignedUsersActive,
          });
        }
      } catch (e) {
        setError("Failed to load KPI data");
        toast.error("Failed to load KPI data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, limit, debouncedSearch, fetchKpiStats]);

  useEffect(() => {
    if (!showViewModal) return;
    setViewModalKpisLoading(true);
    (async () => {
      try {
        const result = await fetchKpis({}).unwrap();
        setKpis(result?.data ?? []);
      } catch {
        setKpis([]);
      } finally {
        setViewModalKpisLoading(false);
      }
    })();
  }, [showViewModal, fetchKpis]);

  const kpiById = useMemo(() => {
    const map: Record<string, any> = {};
    for (const k of kpis) map[k._id || k.id] = k;
    return map;
  }, [kpis]);

  const assignedKpisByUser: Record<string, any[]> = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const a of assignments) {
      if (a.status === KpiSetAssignmentStatus.ACTIVE) {
        const arr = map[a.userId] || (map[a.userId] = []);
        arr.push(a);
      }
    }
    return map;
  }, [assignments]);

  // Filter users based on client-side search
  const filteredUsers = useMemo(() => {
    if (!clientSideUserSearch.trim()) return users;

    const searchTerm = clientSideUserSearch.toLowerCase();
    return users.filter((user) => {
      const firstName = (user.firstName || "").toLowerCase();
      const lastName = (user.lastName || "").toLowerCase();
      const workEmail = (user.workEmail || "").toLowerCase();
      const username = (user.username || "").toLowerCase();

      return (
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm) ||
        workEmail.includes(searchTerm) ||
        username.includes(searchTerm) ||
        `${firstName} ${lastName}`.includes(searchTerm)
      );
    });
  }, [users, clientSideUserSearch]);

  // Set management grouped by timeline
  const groupedSets = useMemo(
    () => ({
      [KpiTimeline.WEEKLY]: sets.filter((s) => s.timeline === KpiTimeline.WEEKLY),
      [KpiTimeline.MONTHLY]: sets.filter((s) => s.timeline === KpiTimeline.MONTHLY),
      [KpiTimeline.YEARLY]: sets.filter((s) => s.timeline === KpiTimeline.YEARLY),
    }),
    [sets]
  );

  // Collapsible sections state
  const [collapsed, setCollapsed] = useState<Record<KpiTimeline, boolean>>({
    [KpiTimeline.WEEKLY]: false,
    [KpiTimeline.MONTHLY]: false,
    [KpiTimeline.YEARLY]: false,
  });
  const toggleSection = useCallback((key: KpiTimeline) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // All useCallback hooks must be declared before any conditional returns
  const handleCreateSet = useCallback(() => {
    setEditingSet(null);
    setSetFormData({
      code: "",
      name: "",
      description: "",
      timeline: KpiTimeline.WEEKLY,
      kpis: [],
    });
    setSelectedSetKpis(new Set());
    setShowSetForm(true);
  }, []);

  const handleEditSet = useCallback((set: any) => {
    setEditingSet(set);
    setSetFormData({
      code: set.code,
      name: set.name,
      description: set.description || "",
      timeline: set.timeline,
      kpis: set.kpis?.map((k: any) => k._id || k) || [],
    });
    setSelectedSetKpis(new Set(set.kpis?.map((k: any) => k._id || k) || []));
    setShowSetForm(true);
  }, []);

  const handleDeleteSet = useCallback(async (setId: string) => {
    if (!window.confirm("Are you sure you want to delete this set?")) return;
    try {
      setSets((prev) => prev.filter((s: any) => (s._id || s.id) !== setId));
      toast.success("Set deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete set");
    }
  }, []);

  const handleSetKpiToggle = useCallback((kpiId: string) => {
    setSelectedSetKpis((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(kpiId)) {
        newSet.delete(kpiId);
      } else {
        newSet.add(kpiId);
      }
      return newSet;
    });
  }, []);

  const handleSaveSet = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const kpisArray = Array.from(selectedSetKpis);

      if (kpisArray.length < 1) {
        toast.error("Set must have at least 1 KPI");
        return;
      }
      if (kpisArray.length > 20) {
        toast.error("Set cannot have more than 20 KPIs");
        return;
      }

      const payload = {
        ...setFormData,
        kpis: kpisArray,
      };

      try {
        if (editingSet) {
          setSets((prev) =>
            prev.map((s: any) =>
              (s._id || s.id) === editingSet._id
                ? { ...s, ...payload }
                : s
            )
          );
          toast.success("Set updated successfully");
        } else {
          setSets((prev) => [
            ...prev,
            { _id: `local-${Date.now()}`, ...payload },
          ]);
          toast.success("Set created successfully");
        }
        setShowSetForm(false);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            `Failed to ${editingSet ? "update" : "create"} set`
        );
      }
    },
    [setFormData, selectedSetKpis, editingSet]
  );

  const handleEditUser = useCallback(
    (user: any) => {
      const userId = user._id || user.id; // Support both _id and id
      setSelectedUserId(userId);
      setSelectedUser(user);
      const assigned = new Set<string>(
        (assignedKpisByUser[userId] || []).map((a: any) => a.kpiId)
      );
      setSelectedKpiIds(assigned);
      setShowAssignScreen(true);
    },
    [assignedKpisByUser]
  );

  const handleSearchChange = useCallback((value: string) => {
    setPage(1);
    setUserSearch(value);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setPage(1);
    setLimit(newLimit);
  }, []);

  const handleViewUser = useCallback(
    (user: any) => {
      const userId = user._id || user.id; // Support both _id and id
      if (!userId) {
        console.error("User ID is missing:", user);
        toast.error("User ID is missing");
        return;
      }
      navigate(`/kpi/user-details/${userId}`);
    },
    [navigate]
  );

  // Conditional returns AFTER all hooks
  if (loading) {
    return <div className="p-6">Loading KPI management...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            KPI Assignment & Set Management
          </h1>
          <p className="text-slate-600 mt-1">
            Create KPIs, create sets, add KPIs to sets, and assign to users
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("sets")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "sets"
                  ? "bg-white text-primary-600 shadow-soft"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              KPI Sets
            </button>
            <button
              onClick={() => setViewMode("kpis")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "kpis"
                  ? "bg-white text-primary-600 shadow-soft"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Individual KPIs
            </button>
          </div>

          {/* Action Buttons */}
          {canManage && (
            <>
              {viewMode === "sets" ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create KPI
                  </button>
                  <button
                    onClick={() => setShowViewModal(true)}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View All KPIs
                  </button>
                  <button
                    onClick={handleCreateSet}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Set
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowViewModal(true)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View All
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add KPI
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Conditional Content Based on View Mode */}
      {viewMode === "sets" ? (
        <>
          {/* Set Management View */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-soft border border-primary-200">
              <p className="text-xs font-semibold text-primary-600">TOTAL SETS</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">
                {sets.length}
              </p>
              <p className="text-xs text-primary-700/70 mt-1">
                Active sets in system
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-soft border border-primary-200">
              <p className="text-xs font-semibold text-primary-600">TOTAL KPIS</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">
                {kpis.length}
              </p>
              <p className="text-xs text-primary-700/70 mt-1">
                Performance indicators
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-soft border border-primary-200">
              <p className="text-xs font-semibold text-primary-600">TOTAL USERS</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">
                {users.length}
              </p>
              <p className="text-xs text-primary-700/70 mt-1">Registered users</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-soft border border-primary-200">
              <p className="text-xs font-semibold text-primary-600">
                TOTAL ASSIGNMENTS
              </p>
              <p className="text-2xl font-bold text-primary-900 mt-1">
                {assignments.length}
              </p>
              <p className="text-xs text-primary-700/70 mt-1">
                Active assignments
              </p>
            </div>
          </div>

          {/* Sets by Timeline (Tables) */}
          {KPI_TIMELINE_VALUES.map((timeline) => (
            <div
              key={timeline}
              className="bg-white rounded-lg shadow-soft border border-slate-200"
            >
              <button
                type="button"
                onClick={() => toggleSection(timeline)}
                className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-200 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {collapsed[timeline] ? (
                    <ChevronRight className="w-4 h-4 text-primary-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-primary-500" />
                  )}
                  <h2 className="text-lg font-semibold text-primary-900">
                    {timeline} Sets
                  </h2>
                </div>
                <span className="text-xs text-primary-700 bg-primary-100 px-2 py-1 rounded-full">
                  {groupedSets[timeline].length}{" "}
                  {groupedSets[timeline].length === 1 ? "set" : "sets"}
                </span>
              </button>
              {!collapsed[timeline] && (
                <div className="p-0 overflow-x-auto">
                  {groupedSets[timeline].length === 0 ? (
                    <div className="py-14 text-center text-slate-500">
                      <div className="mx-auto w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                        📅
                      </div>
                      <div className="font-medium">
                        No {timeline.toLowerCase()} sets created yet
                      </div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-primary-50/60">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-primary-700">
                            Set Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-primary-700">
                            Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-primary-700">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-primary-700">
                            KPIs in Set
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-primary-700">
                            Total KPIs
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-primary-700">
                            Points
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-primary-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {groupedSets[timeline].map((set) => {
                          const kpiNames: string[] = (set.kpis || []).map(
                            (k: any) =>
                              k.name
                                ? k.name
                                : kpiById[k]
                                ? kpiById[k].name
                                : ""
                          );
                          const firstThree = kpiNames.slice(0, 3);
                          const remaining = Math.max(0, kpiNames.length - 3);
                          return (
                            <tr key={set._id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 text-sm text-primary-900 font-medium">
                                {set.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-primary-800">
                                {set.code}
                              </td>
                              <td className="px-6 py-4 text-sm text-primary-800/90">
                                {set.description || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex flex-wrap gap-2">
                                  {firstThree.map((n, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-primary-50 text-primary-800 rounded-full text-xs"
                                    >
                                      {n || "KPI"}
                                    </span>
                                  ))}
                                  {remaining > 0 && (
                                    <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                                      +{remaining} more
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-primary-800">
                                {set.kpis?.length || 0}
                              </td>
                              <td className="px-6 py-4 text-sm text-primary-800">
                                <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                                  {set.points || 1}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {canManage && (
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => handleEditSet(set)}
                                      aria-label="Edit"
                                      className="relative group text-green-600 hover:text-green-800 transition-colors"
                                    >
                                      <SquarePen
                                        className="w-4 h-4"
                                        aria-hidden="true"
                                      />

                                      
                                      <span
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1
               hidden group-hover:block whitespace-nowrap
               rounded bg-slate-800 px-3 py-2
               text-xs text-white shadow-md"
                                      >
                                        Edit
                                      </span>
                                    </button>

                                    <button
                                      onClick={() => handleDeleteSet(set._id)}
                                      aria-label="Delete"
                                      className="relative group text-red-600 hover:text-red-800 transition-colors"
                                    >
                                      <Trash2
                                        className="w-4 h-4"
                                        aria-hidden="true"
                                      />

                                     
                                      <span
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1
               hidden group-hover:block whitespace-nowrap
               rounded bg-slate-800 px-3 py-2
               text-xs text-white shadow-md"
                                      >
                                        Delete
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <>
          {/* Original KPI Assignment View */}
          <KpiHeader
            isAdmin={isAdmin}
            onViewKpis={() => setShowViewModal(true)}
            onAddKpi={() => setShowForm(true)}
          />

          {/* Stats */}
          <KpiStatsCards
            totalKpis={stats.totalKpis}
            totalUsers={stats.totalUsers}
            usersWithKpis={stats.usersWithKpis}
          />

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-soft border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-slate-500" />
              <h3 className="text-lg font-medium text-slate-900 mb-0">
                Filters
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Search
                </label>
                <SearchInput
                  value={userSearch}
                  onChange={handleSearchChange}
                  placeholder={PLACEHOLDERS.SEARCH_USERS}
                />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <UsersTable
            users={users}
            assignedKpisByUser={assignedKpisByUser}
            kpiById={kpiById}
            isAdmin={isAdmin}
            onEditUser={handleEditUser}
            onViewUser={handleViewUser}
          />

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalItems={totalUsers}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        </>
      )}

      {/* Add/Edit KPI Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-soft">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold">
                  {editingKpi ? "Edit KPI" : "Add New KPI"}
                </h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                ×
              </button>
            </div>
            <form
              className="px-6 py-5 space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();

                // Validation
                if (!kpiFormData.name.trim()) {
                  toast.error("KPI Name is required");
                  return;
                }
                if (!kpiFormData.description.trim()) {
                  toast.error("Description is required");
                  return;
                }

                try {
                  if (editingKpi) {
                    setKpis((prev) =>
                      prev.map((k: any) =>
                        (k._id || k.id) === editingKpi._id
                          ? { ...k, ...kpiFormData }
                          : k
                      )
                    );
                    toast.success("KPI updated");
                  } else {
                    setKpis((prev) => [
                      ...prev,
                      { _id: `local-${Date.now()}`, ...kpiFormData },
                    ]);
                    toast.success("KPI created");
                  }
                } catch (e: any) {
                  toast.error(
                    e?.response?.data?.message || "Failed to create KPI"
                  );
                  return;
                }
                setShowForm(false);
                setEditingKpi(null);
                setKpiFormData({
                  code: "",
                  name: "",
                  description: "",
                  info: "",
                  category: "",
                  isActive: true,
                });
              }}
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  KPI Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Enter KPI name..."
                  className={`w-full border rounded-lg p-3 ${
                    !kpiFormData.name.trim()
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-300 focus:border-primary-500"
                  } focus:outline-none focus:ring-2 focus:ring-primary-200`}
                  value={kpiFormData.name}
                  onChange={(e) =>
                    setKpiFormData({ ...kpiFormData, name: e.target.value })
                  }
                  required
                />
                {!kpiFormData.name.trim() && (
                  <p className="text-red-500 text-sm mt-1">
                    KPI Name is required
                  </p>
                )}
              </div>
              <div>
                <TextArea
                  label="Description"
                  placeholder="Enter KPI description..."
                  value={kpiFormData.description}
                  onChange={(value) =>
                    setKpiFormData({
                      ...kpiFormData,
                      description: value as string,
                    })
                  }
                  required
                />
                {!kpiFormData.description.trim() && (
                  <p className="text-red-500 text-sm mt-1">
                    Description is required
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Info
                  </label>
                  <input
                    className="w-full border rounded-lg p-3 border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    value={kpiFormData.info}
                    onChange={(e) =>
                      setKpiFormData({ ...kpiFormData, info: e.target.value })
                    }
                    placeholder="Optional details"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>
                  <input
                    className="w-full border rounded-lg p-3 border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    value={kpiFormData.category}
                    onChange={(e) =>
                      setKpiFormData({
                        ...kpiFormData,
                        category: e.target.value,
                      })
                    }
                    placeholder="Optional category"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="kpiStatus"
                      checked={kpiFormData.isActive === true}
                      onChange={() =>
                        setKpiFormData({ ...kpiFormData, isActive: true })
                      }
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="kpiStatus"
                      checked={kpiFormData.isActive === false}
                      onChange={() =>
                        setKpiFormData({ ...kpiFormData, isActive: false })
                      }
                    />
                    Inactive
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  A KPI can only be set to Inactive if it is not assigned to any
                  set or user.
                </p>
              </div>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <div className="text-primary-600 mt-0.5">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-primary-800">
                    <p className="font-medium mb-1">Important Rules:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>
                        Fields marked with{" "}
                        <span className="text-red-500 font-bold">*</span> are
                        required
                      </li>
                      <li>KPI Name must be unique and descriptive</li>
                      <li>
                        Description should clearly explain what this KPI
                        measures
                      </li>
                      <li>Inactive KPIs cannot belong to any active set</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t px-0">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-slate-100 text-slate-800"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${
                    !kpiFormData.name.trim() || !kpiFormData.description.trim()
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                  disabled={
                    !kpiFormData.name.trim() || !kpiFormData.description.trim()
                  }
                >
                  {editingKpi ? "Update KPI" : "Add KPI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Picker Modal */}
      {showUserPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Select User</h3>
              <button
                className="text-sm"
                onClick={() => setShowUserPicker(false)}
              >
                Close
              </button>
            </div>
            <div className="max-h-80 overflow-auto divide-y">
              {users.map((u) => (
                <button
                  key={u._id}
                  className="w-full text-left py-2 px-2 hover:bg-slate-50"
                  onClick={() => {
                    setSelectedUserId(u._id);
                    setSelectedUser(u);
                    setShowUserPicker(false);
                    setShowAssignScreen(true);
                  }}
                >
                  {u.firstName || u.username} {u.lastName || ""} —{" "}
                  {u.workEmail || "N/A"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Assignment Screen (Select User & KPIs) */}
      {showAssignScreen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-7xl shadow-soft h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primary-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedUser
                      ? `Assign KPIs to ${
                          selectedUser.firstName || selectedUser.username
                        }`
                      : "Select User and Assign KPIs"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Choose users and their KPI assignments
                  </p>
                </div>
              </div>
              <button
                className="text-slate-500 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => {
                  setShowAssignScreen(false);
                  setSelectedUser(null);
                  setSelectedUserId("");
                  setClientSideUserSearch("");
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Main Content - Equal Height Sections with Dynamic Sizing */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Left Section - Users */}
              <div className="w-1/2 border-r flex flex-col min-h-0">
                <div className="p-4 border-b bg-slate-50 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      Select User
                    </h4>
                    <div className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                      {filteredUsers.length} user
                      {filteredUsers.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search employees by name, email, or username..."
                      value={clientSideUserSearch}
                      onChange={(e) => setClientSideUserSearch(e.target.value)}
                      className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-colors"
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    {clientSideUserSearch && (
                      <button
                        onClick={() => setClientSideUserSearch("")}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="p-4 space-y-3">
                    {filteredUsers.map((user) => {
                      const userId = user._id || user.id;
                      const isSelected = selectedUserId === userId;
                      const userAssignments = assignedKpisByUser[userId] || [];

                      return (
                        <button
                          key={userId}
                          onClick={() => {
                            setSelectedUserId(userId);
                            setSelectedUser(user);
                            const assigned = new Set<string>(
                              userAssignments.map((a: any) => a.kpiId)
                            );
                            setSelectedKpiIds(assigned);
                          }}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200 shadow-soft"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-soft"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                  isSelected
                                    ? "bg-primary-600 text-white"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {(user.firstName || user.username || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {user.firstName || user.username}{" "}
                                  {user.lastName || ""}
                                </div>
                                <div className="text-sm text-slate-600">
                                  {user.workEmail}
                                </div>
                                {user.department && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    {user.department}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500 mb-1">
                                {userAssignments.length} KPI
                                {userAssignments.length !== 1 ? "s" : ""}{" "}
                                assigned
                              </div>
                              {isSelected && (
                                <div className="text-xs text-primary-600 font-medium bg-primary-100 px-2 py-1 rounded-full">
                                  Selected
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-3 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        <div className="text-sm font-medium">
                          No users found
                        </div>
                        <div className="text-xs mt-1">
                          Try adjusting your search criteria
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section - KPIs */}
              <div className="w-1/2 flex flex-col min-h-0">
                <div className="p-4 border-b bg-slate-50 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Select KPIs
                    </h4>
                    <div className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                      {selectedKpiIds.size} selected
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Click to select/deselect KPIs
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="p-4 space-y-3">
                    {kpis.map((kpi) => {
                      const isSelected = selectedKpiIds.has(kpi._id);
                      const isAssigned =
                        selectedUserId &&
                        (assignedKpisByUser[selectedUserId] || []).some(
                          (a: any) => a.kpiId === kpi._id
                        );

                      return (
                        <button
                          key={kpi._id}
                          type="button"
                          onClick={() => {
                            const next = new Set(selectedKpiIds);
                            if (next.has(kpi._id)) next.delete(kpi._id);
                            else next.add(kpi._id);
                            setSelectedKpiIds(next);
                          }}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-green-500 bg-green-50 ring-2 ring-green-200 shadow-soft"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-soft"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? "bg-green-600 border-green-600"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-slate-900 mb-1">
                                {kpi.name}
                              </div>
                              {kpi.description && (
                                <div className="text-sm text-slate-600 mb-2">
                                  {kpi.description}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                {isAssigned && (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                                    Already assigned
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                                    Selected
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {kpis.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-3 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div className="text-sm font-medium">
                          No KPIs available
                        </div>
                        <div className="text-xs mt-1">
                          Create KPIs first to assign them to users
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center gap-4">
                {selectedUser ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(selectedUser.firstName || selectedUser.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        Assigning to:{" "}
                        {selectedUser.firstName || selectedUser.username}
                      </div>
                      <div className="text-xs text-slate-600">
                        {selectedKpiIds.size > 0
                          ? `${selectedKpiIds.size} KPI${
                              selectedKpiIds.size !== 1 ? "s" : ""
                            } selected`
                          : "No KPIs selected"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm">
                      Select a user to assign KPIs
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors font-medium"
                  onClick={() => {
                    setShowAssignScreen(false);
                    setSelectedUser(null);
                    setSelectedUserId("");
                    setClientSideUserSearch("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                  disabled={!selectedUserId || selectedKpiIds.size === 0}
                  onClick={async () => {
                    try {
                      if (!selectedUserId) {
                        toast.error("No user selected");
                        return;
                      }
                      const already = new Set<string>(
                        (assignedKpisByUser[selectedUserId] || []).map(
                          (a) => a.kpiId
                        )
                      );
                      const toCreate = Array.from(selectedKpiIds).filter(
                        (id) => !already.has(id)
                      );
                      const toRemove = Array.from(already).filter(
                        (id) => !selectedKpiIds.has(id)
                      );

                      setAssignments((prev) => {
                        const withoutRemoved = prev.filter(
                          (a: any) =>
                            a.userId !== selectedUserId ||
                            !toRemove.includes(a.kpiId)
                        );
                        const newOnes = toCreate.map((kpiId: string) => ({
                          _id: `local-${Date.now()}-${kpiId}`,
                          userId: selectedUserId,
                          kpiId,
                          status: KpiSetAssignmentStatus.ACTIVE,
                        }));
                        return [...withoutRemoved, ...newOnes];
                      });
                      toast.success(
                        `Assignments updated: ${toCreate.length} added, ${toRemove.length} removed`
                      );
                      setShowAssignScreen(false);
                      setSelectedUser(null);
                      setSelectedUserId("");
                      setClientSideUserSearch("");
                    } catch (e: any) {
                      toast.error(
                        e?.response?.data?.message ||
                          "Failed to save assignments"
                      );
                    }
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All KPIs Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-5xl shadow-soft">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold">View All KPIs</h3>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto min-h-[200px] relative">
              {viewModalKpisLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-primary-600" />
                </div>
              ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      KPI Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {kpis.map((k) => (
                    <tr key={k.id || k._id}>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {k.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {k.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {k.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="inline-flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-slate-500" />
                          {k.createdAt
                            ? new Date(k.createdAt).toLocaleDateString("en-GB")
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {canManage && (
                            <button
                              className="text-primary-600 hover:text-primary-800"
                              title="Edit"
                              onClick={() => {
                                setEditingKpi(k);
                                setKpiFormData({
                                  code: k.code || "",
                                  name: k.name || "",
                                  description: k.description || "",
                                  info: k.info || "",
                                  category: k.category || "",
                                  isActive: Boolean(k.isActive),
                                });
                                setShowForm(true);
                              }}
                            >
                              <SquarePen className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {kpis.length === 0 && (
                    <tr>
                      <td
                        className="px-6 py-6 text-sm text-slate-500"
                        colSpan={5}
                      >
                        No KPIs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              )}
            </div>
            <div className="flex justify-end px-6 py-4 border-t">
              <button
                className="px-4 py-2 rounded bg-slate-800 text-white"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Form Modal */}
      {showSetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingSet ? "Edit KPI Set" : "Create New KPI Set"}
              </h2>
              <button
                onClick={() => setShowSetForm(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleSaveSet}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={setFormData.code}
                  onChange={(e) =>
                    setSetFormData({ ...setFormData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., WEEK_SET_1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={setFormData.name}
                  onChange={(e) =>
                    setSetFormData({ ...setFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Weekly Performance Set"
                />
              </div>

              <div>
                <TextArea
                  label="Description"
                  value={setFormData.description}
                  onChange={(value) =>
                    setSetFormData({
                      ...setFormData,
                      description: value as string,
                    })
                  }
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Timeline *
                </label>
                <select
                  value={setFormData.timeline}
                  onChange={(e) =>
                    setSetFormData({
                      ...setFormData,
                      timeline: e.target.value as KpiTimeline,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {KPI_TIMELINE_VALUES.map((t) => (
                    <option key={t} value={t}>
                      {t === KpiTimeline.WEEKLY ? "Weekly" : t === KpiTimeline.MONTHLY ? "Monthly" : "Yearly"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select KPIs * (1-20 KPIs)
                </label>
                <div className="text-sm text-slate-600 mb-2">
                  Currently selected: {selectedSetKpis.size} KPI
                  {selectedSetKpis.size !== 1 ? "s" : ""}
                </div>
                <div className="border border-slate-300 rounded-lg max-h-64 overflow-y-auto">
                  {kpis.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">
                      No KPIs available. Create KPIs first.
                    </p>
                  ) : (
                    <div className="p-2 space-y-1">
                      {kpis.map((kpi) => (
                        <label
                          key={kpi._id}
                          className="flex items-center gap-3 p-3 rounded hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSetKpis.has(kpi._id)}
                            onChange={() => handleSetKpiToggle(kpi._id)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {kpi.name}
                            </p>
                            {kpi.description && (
                              <p className="text-xs text-slate-500">
                                {kpi.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSetForm(false)}
                  className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    selectedSetKpis.size < 1 || selectedSetKpis.size > 20
                  }
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {editingSet ? "Update Set" : "Create Set"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiManagement;
