import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, Target, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useDebounce, DEBOUNCE_DELAYS } from "../../utils/debounce";
import { Button, Input } from "../common";
import {
  InfoIcon,
  UsersIcon,
  SearchIcon,
  UsersGroupIcon,
  CheckCircleIcon,
  CheckIcon,
} from "../icons";
import { useLazyGetUsersForFilterQuery } from "../../store/apis/user.api";
import {
  useLazyGetKpiSetsQuery,
  useBulkCreateAssignmentsMutation,
} from "../../store/apis/kpi.api";
import type { IKpiSetResponseV2 } from "../../types/kpi.api.types";
import type { IUserListItem } from "../../types/user.api.types";

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignedBy: string;
}

const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assignedBy: _assignedBy,
}) => {
  const [users, setUsers] = useState<IUserListItem[]>([]);
  const [sets, setSets] = useState<IKpiSetResponseV2[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedSetIds, setSelectedSetIds] = useState<Set<string>>(new Set());
  const [assignmentMode, setAssignmentMode] = useState<"add" | "replace">(
    "add"
  );
  const [loading, setLoading] = useState(false);
  const [clientSideUserSearch, setClientSideUserSearch] = useState("");
  const [clientSideSetSearch, setClientSideSetSearch] = useState("");

  const [fetchActiveUsers] = useLazyGetUsersForFilterQuery();
  const [fetchKpiSets] = useLazyGetKpiSetsQuery();
  const [bulkCreateAssignments, { isLoading: isSubmitting }] =
    useBulkCreateAssignmentsMutation();

  const debouncedUserSearch = useDebounce(
    clientSideUserSearch,
    DEBOUNCE_DELAYS.SEARCH
  );
  const debouncedSetSearch = useDebounce(
    clientSideSetSearch,
    DEBOUNCE_DELAYS.SEARCH
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersResult, setsResult] = await Promise.all([
        fetchActiveUsers({}).unwrap(),
        fetchKpiSets({ includeKpis: false }).unwrap(),
      ]);
      const filterUsers = usersResult ?? [];
      const usersMapped: IUserListItem[] = filterUsers.map((u) => ({
        id: u.id,
        fullName: u.fullName ?? "",
        employeeId: "",
        workEmail: "",
        status: "",
        department: "",
        departmentName: "",
        designation: "",
        designationName: "",
      }));
      const setsData = setsResult?.data ?? [];
      setUsers(usersMapped);
      setSets(setsData);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load data",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchActiveUsers, fetchKpiSets]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const handleSelectAllUsers = () => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set());
    } else {
      const userIds = users.map((user) => user.id).filter((id) => id); // Filter out null/undefined IDs
      setSelectedUserIds(new Set(userIds));
    }
  };

  const handleSelectAllSets = () => {
    if (selectedSetIds.size === filteredSets.length) {
      setSelectedSetIds(new Set());
    } else {
      setSelectedSetIds(new Set(filteredSets.map((s) => s.id)));
    }
  };

  const handleUserSelect = (userId: string) => {
    if (!userId || userId === "null" || userId === "undefined") {
      return;
    }

    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleSetSelect = (setId: string) => {
    const newSelected = new Set(selectedSetIds);
    if (newSelected.has(setId)) {
      newSelected.delete(setId);
    } else {
      newSelected.add(setId);
    }
    setSelectedSetIds(newSelected);
  };

  // Filter users based on client-side search
  const filteredUsers = useMemo(() => {
    // Backend now filters out admin users, so no need to filter here

    if (!clientSideUserSearch.trim()) return users;

    const searchTerm = debouncedUserSearch.toLowerCase();
    return users.filter((user) => {
      const fullName = (user.fullName || "").toLowerCase();
      const email = (user.workEmail || "").toLowerCase();
      const department = (user.department || "").toLowerCase();
      return (
        fullName.includes(searchTerm) ||
        email.includes(searchTerm) ||
        department.includes(searchTerm)
      );
    });
  }, [users, debouncedUserSearch, clientSideUserSearch]);

  const filteredSets = useMemo(() => {
    if (!clientSideSetSearch.trim()) return sets;
    const searchTerm = debouncedSetSearch.toLowerCase();
    return sets.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const code = (s.code || "").toLowerCase();
      return name.includes(searchTerm) || code.includes(searchTerm);
    });
  }, [sets, debouncedSetSearch, clientSideSetSearch]);

  const handleReset = () => {
    setSelectedUserIds(new Set());
    setSelectedSetIds(new Set());
    setAssignmentMode("add");
    setClientSideUserSearch("");
    setClientSideSetSearch("");
  };

  const handleBulkAssign = async () => {
    if (selectedUserIds.size === 0 || selectedSetIds.size === 0) {
      toast.error("Please select at least one user and one KPI set");
      return;
    }

    const validUserIds = Array.from(selectedUserIds).filter(
      (id) => id && id !== "null" && id !== "undefined"
    );
    const validSetIds = Array.from(selectedSetIds).filter(
      (id) => id && id !== "null" && id !== "undefined"
    );

    if (validUserIds.length === 0) {
      toast.error("No valid users selected");
      return;
    }
    if (validSetIds.length === 0) {
      toast.error("No valid sets selected");
      return;
    }

    try {
      setLoading(true);
      let totalCreated = 0;
      let totalSkipped = 0;
      for (const setId of validSetIds) {
        const result = await bulkCreateAssignments({
          userIds: validUserIds,
          setId,
        }).unwrap();
        totalCreated += result.created;
        totalSkipped += result.skipped;
      }
      toast.success(
        `Assigned ${validSetIds.length} set(s) to ${validUserIds.length} user(s). Created: ${totalCreated}${totalSkipped > 0 ? `, skipped duplicates: ${totalSkipped}` : ""}`,
      );
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String((error.data as { message: unknown }).message)
          : "Failed to assign sets";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-space">
      <div className="bg-white rounded-xl w-full max-w-7xl shadow-soft h-[85vh] flex flex-col">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-0">
              Bulk Assign KPI Sets
            </h2>
          </div>
          <button
            className="text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content - Equal Height Sections with Dynamic Sizing */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Section - Users */}
          <div className="w-1/2 border-r flex flex-col min-h-0">
            <div className="p-3 border-b bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 whitespace-nowrap">
                  <UsersIcon className="w-4 h-4 text-primary-600" />
                  Users ({selectedUserIds.size})
                </h3>
                <div className="flex-1">
                  <Input
                    value={clientSideUserSearch}
                    onChange={(v) => setClientSideUserSearch(String(v))}
                    placeholder="Search users..."
                    leftIcon={<SearchIcon className="w-3.5 h-3.5 text-slate-400" />}
                    clearable
                    size="sm"
                    className="[&_input]:rounded-md [&_input]:focus:ring-2 [&_input]:focus:ring-primary-500 [&_input]:focus:border-primary-500"
                  />
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                    {filteredUsers.length} available
                  </div>
                  <button
                    onClick={handleSelectAllUsers}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 hover:bg-primary-50 rounded"
                  >
                    {selectedUserIds.size === filteredUsers.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-3 space-y-2">
                {loading ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                    <div className="text-sm">Loading users...</div>
                  </div>
                ) : (
                  <>
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUserIds.has(user.id);
                      return (
                        <button
                          key={user.id}
                          onClick={() => handleUserSelect(user.id)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200 shadow-soft"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
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
                                {(user.fullName || user.email || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {user.fullName}
                                </div>
                                <div className="text-sm text-slate-600">
                                  {user.workEmail || "—"}
                                </div>
                                {user.department && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    {user.department}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
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
                    {filteredUsers.length === 0 && !loading && (
                      <div className="text-center py-12 text-slate-500">
                        <UsersGroupIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <div className="text-sm font-medium">
                          No users found
                        </div>
                        <div className="text-xs mt-1">
                          Try adjusting your search criteria
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - KPI Sets */}
          <div className="w-1/2 flex flex-col min-h-0">
            <div className="p-3 border-b bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 whitespace-nowrap">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  KPI Sets ({selectedSetIds.size})
                </h3>
                <div className="flex-1">
                  <Input
                    value={clientSideSetSearch}
                    onChange={(v) => setClientSideSetSearch(String(v))}
                    placeholder="Search sets..."
                    leftIcon={<SearchIcon className="w-3.5 h-3.5 text-slate-400" />}
                    clearable
                    size="sm"
                    className="[&_input]:rounded-md [&_input]:focus:ring-2 [&_input]:focus:ring-green-500 [&_input]:focus:border-green-500"
                  />
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                    {filteredSets.length} available
                  </div>
                  <button
                    onClick={handleSelectAllSets}
                    className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 hover:bg-green-50 rounded"
                  >
                    {selectedSetIds.size === filteredSets.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-3 space-y-2">
                {loading ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                    <div className="text-sm">Loading sets...</div>
                  </div>
                ) : (
                  <>
                    {filteredSets.map((set) => {
                      const isSelected = selectedSetIds.has(set.id);
                      return (
                        <button
                          key={set.id}
                          onClick={() => handleSetSelect(set.id)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-green-500 bg-green-50 ring-2 ring-green-200 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
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
                                <CheckIcon className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-slate-900 mb-1">
                                {set.name}
                              </div>
                              {set.description && (
                                <div className="text-sm text-slate-600 mb-2">
                                  {set.description}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">
                                  {set.code} · {set.timeline} · {set.kpiCount ?? 0} KPI
                                  {(set.kpiCount ?? 0) !== 1 ? "s" : ""}
                                </span>
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
                    {filteredSets.length === 0 && !loading && (
                      <div className="text-center py-12 text-slate-500">
                        <CheckCircleIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <div className="text-sm font-medium">
                          {clientSideSetSearch
                            ? "No sets found"
                            : "No KPI sets available"}
                        </div>
                        <div className="text-xs mt-1">
                          {clientSideSetSearch
                            ? "Try adjusting your search terms"
                            : "Create KPI sets first to assign them to users"}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Mode Section */}
        <div className="px-6 py-4 border-t bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900 mb-3">
            Assignment Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="assignmentMode"
                value="add"
                checked={assignmentMode === "add"}
                onChange={(e) =>
                  setAssignmentMode(e.target.value as "add" | "replace")
                }
                className="mt-1 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="font-medium text-slate-900">Add to existing</div>
                <div className="text-sm text-slate-600">
                  Keep current set assignments and add selected sets
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="assignmentMode"
                value="replace"
                checked={assignmentMode === "replace"}
                onChange={(e) =>
                  setAssignmentMode(e.target.value as "add" | "replace")
                }
                className="mt-1 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="font-medium text-slate-900">Replace all</div>
                <div className="text-sm text-slate-600">
                  Remove current set assignments and assign only selected sets
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              {selectedUserIds.size > 0 && selectedSetIds.size > 0 ? (
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-primary-600" />
                  <span>
                    Ready to assign {selectedSetIds.size} set
                    {selectedSetIds.size !== 1 ? "s" : ""} to{" "}
                    {selectedUserIds.size} user
                    {selectedUserIds.size !== 1 ? "s" : ""}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600">
                  <InfoIcon className="w-4 h-4" />
                  <span className="text-sm">
                    Select users and KPI sets to continue
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              htmlType="button"
              appearance="secondary"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              htmlType="button"
              appearance="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              htmlType="button"
              appearance="primary"
              onClick={handleBulkAssign}
              disabled={
                selectedUserIds.size === 0 ||
                selectedSetIds.size === 0 ||
                loading ||
                isSubmitting
              }
              loading={isSubmitting}
              icon={<FileText className="w-4 h-4" />}
              className="flex items-center gap-2"
            >
              {isSubmitting ? "Assigning…" : "Bulk Assign Sets"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignModal;
