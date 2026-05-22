import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../store/hooks/useAuth";
import SearchInput from "../common/SearchInput";
import Pagination from "../common/Pagination";
import FilterWrapper from "../common/FilterWrapper";
import { useDebounce, DEBOUNCE_DELAYS } from "../../utils/debounce";
import UsersTable from "./scoring/UsersTable";
import ScoringModal from "./scoring/ScoringModal";
import ViewUserSetsModal from "./modals/ViewUserSetsModal";
import { EmployeeTableSkeleton } from "./scoring/EmployeeTableSkeleton";
import { SetScoreData } from "./scoring/types";
import { KpiTimeline } from "../../types/kpi.api.types";
import { Select } from "../common";
import { capitalizeWords } from "../../utils/nameUtils";
import { MasterConfigCategory } from "../../constants";
import { useGetMasterConfigByCategoryQuery } from "../../store/apis/masterConfig.api";
import { useGetUsersForFilterQuery } from "../../store/apis/user.api";
import {
  useGetKpiScoringListQuery,
  useLazyGetKpiSetByIdQuery,
  useLazyGetScoringContextQuery,
  useLazyGetUserScoreHistoryQuery,
  useBulkUpsertScoresMutation,
} from "../../store/apis/kpi.api";
import type { ICreateScoreBodyV2, IKpiSetResponseV2 } from "../../types/kpi.api.types";

interface DropdownOption {
  value: string;
  label: string;
}

interface FilterState {
  department: string;
  reportingManager: string;
  functionalManager: string;
}

const KpiScoring: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userSearch, setUserSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    department: "",
    reportingManager: "",
    functionalManager: "",
  });
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [setScores, setSetScores] = useState<Record<string, SetScoreData>>({});
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [sets, setSets] = useState<any[]>([]);
  const [periodIndex, setPeriodIndex] = useState(0);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [selectedSetsForUser, setSelectedSetsForUser] = useState<Set<string>>(
    new Set()
  );
  const [selectedTimeline, setSelectedTimeline] = useState<KpiTimeline>(
    KpiTimeline.WEEKLY
  );
  const [timelineLoading, setTimelineLoading] = useState(false);

  const debouncedSearch = useDebounce(userSearch, DEBOUNCE_DELAYS.SEARCH);

  const { data: departmentConfig } = useGetMasterConfigByCategoryQuery(MasterConfigCategory.DEPARTMENT);
  const { data: usersForFilter } = useGetUsersForFilterQuery();

  const kpiScoringParams = {
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    department: filters.department || undefined,
    reportingManager: filters.reportingManager || undefined,
    functionalManager: filters.functionalManager || undefined,
  };
  const { data: kpiScoringData, isLoading: kpiScoringLoading, refetch: refetchKpiScoring } =
    useGetKpiScoringListQuery(kpiScoringParams);
  const [fetchScoringContext] = useLazyGetScoringContextQuery();
  const [fetchSetById] = useLazyGetKpiSetByIdQuery();
  const [fetchUserScoreHistory] = useLazyGetUserScoreHistoryQuery();
  const [bulkUpsertScores] = useBulkUpsertScoresMutation();

  const departmentOptions: DropdownOption[] = (departmentConfig ?? []).map((d) => ({
    value: d.id,
    label: d.displayName,
  }));
  const managerOptions: DropdownOption[] = (usersForFilter ?? []).map((u) => ({
    value: u.id,
    label: u.fullName,
  }));

  // Map KPI scoring API response to users list and assignments map for the table
  const users = (kpiScoringData?.data ?? []).map((row) => {
    const fullName = ((row.fullName ?? "").trim() || row.email) ?? "Unknown";
    const parts = fullName.split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") ?? "";
    const reportingManagerName = row.reportingManagerName ?? undefined;
    const functionalManagerName = row.functionalManagerName ?? undefined;
    return {
      id: row.userId,
      _id: row.userId,
      fullName,
      firstName,
      lastName,
      workEmail: row.workEmail ?? row.email,
      email: row.email,
      department: row.departmentName ?? row.department,
      position: row.position,
      employeeId: row.employeeId,
      reportingManagerId: row.reportingManagerId ?? undefined,
      reportingManagerName,
      reportingManager:
        reportingManagerName !== undefined
          ? { firstName: reportingManagerName.split(/\s+/)[0] ?? "", lastName: reportingManagerName.split(/\s+/).slice(1).join(" ") ?? "" }
          : undefined,
      functionalManagerId: row.functionalManagerId ?? undefined,
      functionalManagerName,
      functionalManager:
        functionalManagerName !== undefined
          ? { firstName: functionalManagerName.split(/\s+/)[0] ?? "", lastName: functionalManagerName.split(/\s+/).slice(1).join(" ") ?? "" }
          : undefined,
    };
  });
  const userAssignments: Record<string, any[]> = {};
  (kpiScoringData?.data ?? []).forEach((row) => {
    userAssignments[row.userId] = (row.assignedSets ?? []).map((s: any) => ({
      ...s,
      setId: { _id: s.setId, name: s.setName, timeline: s.timeline },
    }));
  });
  const totalUsers = kpiScoringData?.total ?? 0;
  const loading = kpiScoringLoading;

  const getPeriodDates = useCallback((timeline: KpiTimeline, index: number = 0) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    if (timeline === KpiTimeline.WEEKLY) {
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startDate = new Date(now);
      startDate.setDate(now.getDate() + daysToMonday - index * 7);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      start.setTime(startDate.getTime());
      end.setTime(endDate.getTime());
    } else if (timeline === KpiTimeline.MONTHLY) {
      start.setMonth(now.getMonth() - index, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else if (timeline === KpiTimeline.YEARLY) {
      start.setFullYear(now.getFullYear() - index, 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(start.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }, []);

  const formatPeriodDisplay = useCallback(
    (timeline: KpiTimeline, start: Date, end: Date) => {
      if (timeline === KpiTimeline.WEEKLY) {
        const startStr = start.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        });
        const endStr = end.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return `${startStr} - ${endStr}`;
      } else if (timeline === KpiTimeline.MONTHLY) {
        return start.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        });
      } else if (timeline === KpiTimeline.YEARLY) {
        return start.getFullYear().toString();
      }
      return "";
    },
    []
  );

  /** Build period string for API: 2026-W05 (weekly), 2026-01 (monthly), 2026 (yearly) */
  const getPeriodString = useCallback(
    (timeline: KpiTimeline, start: Date) => {
      const y = start.getFullYear();
      if (timeline === KpiTimeline.WEEKLY) {
        const d = new Date(Date.UTC(y, start.getMonth(), start.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        return `${y}-W${String(weekNo).padStart(2, "0")}`;
      }
      if (timeline === KpiTimeline.MONTHLY) {
        return `${y}-${String(start.getMonth() + 1).padStart(2, "0")}`;
      }
      return String(y);
    },
    []
  );


  const loadUserSets = useCallback(
    async (
      userArg: { _id?: string; id?: string } | null,
      _assignmentsMap: Record<string, any[]>,
      timeline: KpiTimeline,
      period: { start: Date; end: Date }
    ) => {
      setTimelineLoading(true);
      try {
        setSetScores({});
        if (!userArg) {
          setTimelineLoading(false);
          return;
        }
        const userId = userArg._id || userArg.id;
        if (!userId) {
          setTimelineLoading(false);
          return;
        }
        const { sets: fetchedSets, scores: existingScores } = await fetchScoringContext({
          userId,
          periodStart: period.start.toISOString(),
          periodEnd: period.end.toISOString(),
          timeline,
        }).unwrap();

        if (!fetchedSets?.length) {
          setTimelineLoading(false);
          return;
        }

        const nextScores: Record<string, SetScoreData> = {};
        for (const set of fetchedSets) {
          if (!set.id) continue;
          const kpis = set.kpis ?? [];
          const kpiId = (k: any) => k?.id ?? k?._id ?? "";
          const defaultCompletion = Object.fromEntries(
            kpis
              .filter((k: any) => kpiId(k))
              .map((k: any) => [kpiId(k), { isCompleted: false }])
          );
          let comment = "";
          let scoreId: string | undefined;
          let approvalStatus: "pending_l2" | "approved" | undefined;
          let pendingBy: SetScoreData["pendingBy"];
          const existing = (existingScores ?? []).find((s) => s.setId === set.id);
          if (existing) {
            scoreId = existing.id;
            comment = existing.comment ?? "";
            approvalStatus =
              existing.approvalStatus === "APPROVED"
                ? "approved"
                : existing.approvalStatus === "PENDING"
                  ? "pending_l2"
                  : undefined;
            if (existing.approverName) {
              const parts = existing.approverName.trim().split(/\s+/);
              pendingBy = {
                firstName: parts[0] ?? "",
                lastName: parts.slice(1).join(" ") ?? "",
              };
            }
            const fromApi = (existing.kpiCompletionStatus ?? []).reduce(
              (acc: Record<string, { isCompleted: boolean }>, item: { kpiId: string; isCompleted: boolean }) => {
                acc[item.kpiId] = { isCompleted: item.isCompleted };
                return acc;
              },
              {}
            );
            nextScores[set.id] = {
              setId: set.id,
              setName: set.name,
              timeline: set.timeline,
              kpis,
              points: set.points,
              completionStatus: { ...defaultCompletion, ...fromApi },
              comment,
              scoreId,
              approvalStatus,
              pendingBy,
            };
          } else {
            nextScores[set.id] = {
              setId: set.id,
              setName: set.name,
              timeline: set.timeline,
              kpis,
              points: set.points,
              completionStatus: defaultCompletion,
              comment: "",
            };
          }
        }
        setSetScores(nextScores);
      } catch (error) {
        console.error("Error loading user sets:", error);
        toast.error("Failed to load user assignments");
      } finally {
        setTimelineLoading(false);
      }
    },
    [fetchScoringContext]
  );

  const loadHistory = useCallback(
    async (userId: string, _timeline?: KpiTimeline) => {
      setHistoryLoading(true);
      try {
        const raw = await fetchUserScoreHistory({ userId }).unwrap();
        const mapped = (raw ?? []).map((score) => ({
          id: score.id,
          setId: score.setId,
          setName: score.setName,
          periodStart: score.periodStart,
          periodEnd: score.periodEnd,
          period: score.period,
          timeline: score.period?.match(/^(\d{4})-W\d{2}$/) ? "WEEKLY" : score.period?.match(/^\d{4}-\d{2}$/) ? "MONTHLY" : "YEARLY",
          comment: score.comment,
          kpiStatuses: (score.kpiCompletionStatus ?? []).map((item) => ({
            kpiId: item.kpiId,
            isCompleted: item.isCompleted,
            kpiName: item.kpiName,
          })),
          approvalStatus:
            score.approvalStatus === "APPROVED"
              ? "approved"
              : score.approvalStatus === "PENDING"
                ? "pending_l2"
                : undefined,
          pointsEarned: score.pointsEarned,
          approvedAt: score.approvedAt,
          approverName: score.approverName,
        }));
        setHistoryData(mapped);
      } catch (error) {
        console.error("Error loading history:", error);
        toast.error("Failed to load history");
        setHistoryData([]);
      } finally {
        setHistoryLoading(false);
      }
    },
    [fetchUserScoreHistory]
  );

  const handleScoreUser = useCallback(
    async (user: any) => {
      setSelectedUser(user);
      setSelectedTimeline(KpiTimeline.WEEKLY);
      const { start, end } = getPeriodDates(KpiTimeline.WEEKLY, 0);
      setCurrentPeriod({ start, end });
      setPeriodIndex(0);
      setActiveTab("current");
      await loadUserSets(user, userAssignments, KpiTimeline.WEEKLY, { start, end });
      setShowScoreModal(true);
      await loadHistory(user._id || user.id, KpiTimeline.WEEKLY);
    },
    [getPeriodDates, loadUserSets, userAssignments, loadHistory]
  );

  const openViewUser = useCallback(
    async (user: any) => {
      const userId = user._id || user.id;
      setSelectedUser(user);
      setSets([]);
      const assignments = userAssignments[userId] || [];
      const assignedSetIds = assignments
        .map((a: any) => a.setId?._id || a.setId)
        .filter(Boolean) as string[];
      setSelectedSetsForUser(new Set(assignedSetIds));
      if (assignedSetIds.length === 0) {
        setShowViewUserModal(true);
        return;
      }
      try {
        const results = await Promise.allSettled(
          assignedSetIds.map((id) => fetchSetById(id).unwrap())
        );
        const fetchedSets: IKpiSetResponseV2[] = results
          .filter((r): r is PromiseFulfilledResult<IKpiSetResponseV2> => r.status === "fulfilled")
          .map((r) => r.value);
        setSets(fetchedSets);
      } catch (e) {
        console.error("Error fetching set details for view modal:", e);
        toast.error("Failed to load set details");
      }
      setShowViewUserModal(true);
    },
    [userAssignments, fetchSetById]
  );

  const handleViewUser = useCallback(
    (user: any) => {
      const userId = user._id || user.id;
      navigate(`/kpi/user-details/${userId}`);
    },
    [navigate]
  );

  const handleCheckboxChange = useCallback(
    (setId: string, kpiId: string, checked: boolean) => {
      setSetScores((prev) => ({
        ...prev,
        [setId]: {
          ...prev[setId],
          completionStatus: {
            ...prev[setId]?.completionStatus,
            [kpiId]: {
              ...prev[setId]?.completionStatus[kpiId],
              isCompleted: checked,
            },
          },
        },
      }));
    },
    []
  );

  const handleCommentChange = useCallback((setId: string, comment: string) => {
    setSetScores((prev) => ({
      ...prev,
      [setId]: {
        ...prev[setId],
        comment,
      },
    }));
  }, []);

  const handlePeriodNavigation = useCallback(
    async (direction: "prev" | "next") => {
      const newIndex = direction === "prev" ? periodIndex + 1 : periodIndex - 1;
      if (newIndex < 0) return;
      setPeriodIndex(newIndex);
      const { start, end } = getPeriodDates(selectedTimeline, newIndex);
      setCurrentPeriod({ start, end });

      if (selectedUser) {
        await loadUserSets(selectedUser, userAssignments, selectedTimeline, { start, end });
      }
    },
    [periodIndex, selectedTimeline, getPeriodDates, selectedUser, userAssignments, loadUserSets]
  );

  const handleTimelineChange = useCallback(
    async (timeline: KpiTimeline) => {
      setSelectedTimeline(timeline);
      setPeriodIndex(0);
      const { start, end } = getPeriodDates(timeline, 0);
      setCurrentPeriod({ start, end });
      if (selectedUser) {
        await loadUserSets(selectedUser, userAssignments, timeline, { start, end });
        if (activeTab === "history") {
          await loadHistory(selectedUser._id || selectedUser.id, timeline);
        }
      }
    },
    [selectedUser, userAssignments, getPeriodDates, loadUserSets, activeTab, loadHistory]
  );

  const handleSaveScores = useCallback(async () => {
    if (!selectedUser) return;
    const setsWithoutComments = Object.values(setScores).filter(
      (score) => !score.comment || score.comment.trim().length === 0
    );

    if (setsWithoutComments.length > 0) {
      toast.error("Please fill all required fields before saving");
      return;
    }

    const userId = selectedUser._id ?? selectedUser.id;
    if (!userId) return;

    const periodStr = getPeriodString(selectedTimeline, currentPeriod.start);
    const scores: ICreateScoreBodyV2[] = [];

    for (const setScore of Object.values(setScores)) {
        const totalCount = setScore.kpis?.length ?? 0;
        const completedCount = Object.values(setScore.completionStatus ?? {}).filter(
          (s) => s?.isCompleted
        ).length;
        // All-or-nothing: 1 point only when all KPIs are completed, else 0
        const pointsEarned =
          totalCount > 0 && completedCount === totalCount ? 1 : 0;

      const kpiCompletionStatus = Object.entries(setScore.completionStatus ?? {}).map(
        ([kpiId, v]) => ({ kpiId, isCompleted: v?.isCompleted ?? false })
      );
      if (kpiCompletionStatus.length === 0) continue;

      scores.push({
        userId,
        setId: setScore.setId,
        kpiCompletionStatus,
        pointsEarned,
        period: periodStr,
        periodStart: currentPeriod.start,
        periodEnd: currentPeriod.end,
        comment: setScore.comment?.trim() ?? "",
      });
    }

    if (scores.length === 0) return;

    try {
      const result = await bulkUpsertScores({ scores }).unwrap();
      const { created, updated, skipped } = result;

      if (skipped > 0 && created === 0 && updated === 0) {
        toast.error("This period was already scored for all sets; no changes saved.");
        return;
      }

      const total = created + updated;
      if (total > 0) {
        const parts = [`${total} set${total !== 1 ? "s" : ""}`];
        if (created > 0) parts.push(`${created} created`);
        if (updated > 0) parts.push(`${updated} updated`);
        toast.success(`Successfully saved scores for ${parts.join(" – ")}`);
        await refetchKpiScoring();
        setShowScoreModal(false);
        setSelectedUser(null);
        setSetScores({});
      }
    } catch (error: unknown) {
      console.error("Error saving scores:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.message ?? err?.message ?? "Failed to save scores";
      toast.error(errorMessage);
    }
  }, [selectedUser, setScores, currentPeriod, selectedTimeline, getPeriodString, bulkUpsertScores, refetchKpiScoring]);

  const handleTabChange = useCallback(
    (tab: "current" | "history") => {
      setActiveTab(tab);
      if (tab === "history" && selectedUser) {
        loadHistory(selectedUser._id || selectedUser.id, selectedTimeline);
      }
    },
    [selectedUser, selectedTimeline, loadHistory]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Set-Based KPI Scoring
          </h1>
        </div>
      </div>

      {/* Filter Section */}
      <FilterWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            
          {/* Search Input */}
          <div className="flex flex-col justify-end">
            <SearchInput
              value={userSearch}
              onChange={(val) => { setUserSearch(val); setPage(1); }}
              placeholder="Search employee by name..."
              label="Search Employee"
            />
          </div>
            
          {/* Reporting Manager Select */}
          <div className="w-full">
            <Select
              label="Reporting Manager"
              className="w-full"
              value={filters.reportingManager}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, reportingManager: String(value || "") }));
                setPage(1);
              }}
              options={[
                { value: "", label: "All Reporting Managers" },
                ...managerOptions.map((m) => ({
                  value: m.value,
                  label: capitalizeWords(m.label),
                })),
              ]}
              searchable
              placeholder="Select Reporting Manager"
            />
          </div>
            
          {/* Functional Manager Select */}
          <div className="w-full">
            <Select
              label="Functional Manager"
              className="w-full"
              value={filters.functionalManager}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, functionalManager: String(value || "") }));
                setPage(1);
              }}
              options={[
                { value: "", label: "All Functional Managers" },
                ...managerOptions.map((m) => ({
                  value: m.value,
                  label: capitalizeWords(m.label),
                })),
              ]}
              searchable
              placeholder="Select Functional Manager"
            />
          </div>
            
          {/* Department Select */}
          <div className="w-full">
            <Select
              label="Department"
              className="w-full"
              value={filters.department}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, department: String(value || "") }));
                setPage(1);
              }}
              options={[
                { value: "", label: "All Departments" },
                ...departmentOptions,
              ]}
              searchable
              placeholder="Select Department"
            />
          </div>
            
        </div>
      </FilterWrapper>

      {/* Users Table */}
      {loading ? (
        <EmployeeTableSkeleton />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-soft border border-slate-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              No users to score
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {user?.role === "Admin" || user?.role === "SuperAdmin"
                ? "There are no users available in the system."
                : "You can only score users who report to you. Currently, no users have you set as their reporting or functional manager."}
            </p>
          </div>
        </div>
      ) : (
        <UsersTable
          users={users}
          assignmentsMap={userAssignments}
          onView={handleViewUser}
          onScore={handleScoreUser}
          onUserView={openViewUser}
        />
      )}

      {/* Pagination */}
      {loading? '' :
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
      }

      {/* Scoring Modal */}
      <ScoringModal
        open={showScoreModal}
        user={selectedUser}
        selectedTimeline={selectedTimeline}
        periodLabel={formatPeriodDisplay(
          selectedTimeline,
          currentPeriod.start,
          currentPeriod.end
        )}
        activeTab={activeTab}
        setScores={setScores}
        timelineLoading={timelineLoading}
        historyLoading={historyLoading}
        historyData={historyData}
        onClose={() => setShowScoreModal(false)}
        onTimelineChange={handleTimelineChange}
        onPrevPeriod={() => handlePeriodNavigation("prev")}
        onNextPeriod={() => handlePeriodNavigation("next")}
        canGoNext={periodIndex !== 0}
        onTabChange={handleTabChange}
        onToggle={handleCheckboxChange}
        onComment={handleCommentChange}
        onSave={handleSaveScores}
        onRefreshHistory={() => {
          if (selectedUser) {
            loadHistory(selectedUser._id || selectedUser.id, selectedTimeline);
          }
        }}
      />

      <ViewUserSetsModal
        isOpen={showViewUserModal}
        onClose={() => setShowViewUserModal(false)}
        user={selectedUser}
        sets={sets}
        selectedSets={selectedSetsForUser}
      />
    </div>
  );
};

export default KpiScoring;
