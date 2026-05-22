import React, { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { X, Save, Users, Target } from "lucide-react";
import Input from "../../common/Input";
import { Button } from "../../common";
import Badge from "../../common/Badge";
import type { KpiSetRow } from "../KpiAssignment.types";
import { getErrorMessage } from "../KpiAssignment.types";
import { useBulkCreateAssignmentsMutation } from "../../../store/apis/kpi.api";
import { useGetUsersForFilterQuery } from "../../../store/apis/user.api";

export interface BulkAssignPayload {
  userIds: string[];
  setIds: string[];
  assignmentMode: "add" | "replace";
}

/** Minimal user shape for modal list (from user filter API) */
interface BulkAssignUserItem {
  id: string;
  fullName: string;
  workEmail?: string;
}

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BulkAssignPayload) => void;
  sets: KpiSetRow[];
}

const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sets,
}) => {
  const { data: filterUsers = [], isLoading: isUsersLoading } = useGetUsersForFilterQuery(
    { includeInactive: false },
    { skip: !isOpen }
  );

  const users: BulkAssignUserItem[] = useMemo(
    () =>
      filterUsers.map((u) => ({
        id: u.id,
        fullName: u.fullName ?? "",
        workEmail: "",
      })),
    [filterUsers]
  );
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());
  const [assignmentMode, setAssignmentMode] = useState<"add" | "replace">("add");
  const [userSearch, setUserSearch] = useState("");
  const [setSearch, setSetSearch] = useState("");

  const [bulkCreateAssignments, { isLoading: isSubmitting }] =
    useBulkCreateAssignmentsMutation();

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const search = userSearch.toLowerCase();
    return users.filter((u) => {
      const fullName = (u.fullName ?? "").toLowerCase();
      const workEmail = (u.workEmail ?? "").toLowerCase();
      return fullName.includes(search) || workEmail.includes(search);
    });
  }, [users, userSearch]);

  const filteredSets = useMemo(() => {
    if (!setSearch.trim()) return sets;
    const search = setSearch.toLowerCase();
    return sets.filter(
      (s) =>
        s.name?.toLowerCase().includes(search) ||
        s.code?.toLowerCase().includes(search),
    );
  }, [sets, setSearch]);

  const handleUserToggle = useCallback((userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const handleSetToggle = useCallback((setId: string) => {
    setSelectedSets((prev) => {
      const next = new Set(prev);
      if (next.has(setId)) next.delete(setId);
      else next.add(setId);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const userIds = Array.from(selectedUsers);
    const setIds = Array.from(selectedSets);
    if (userIds.length === 0 || setIds.length === 0) return;

    try {
      const result = await bulkCreateAssignments({
        userIds,
        setIds,
        assignmentMode,
      }).unwrap();

      const { created, skipped } = result;
      toast.success(
        `Created ${created} assignment(s)${skipped > 0 ? `, skipped ${skipped} duplicate(s)` : ""}`,
      );
      onSubmit({ userIds, setIds, assignmentMode });
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to assign sets"));
    }
  }, [
    selectedUsers,
    selectedSets,
    assignmentMode,
    bulkCreateAssignments,
    onSubmit,
    onClose,
  ]);

  const handleClose = useCallback(() => {
    setSelectedUsers(new Set());
    setSelectedSets(new Set());
    setAssignmentMode("add");
    setUserSearch("");
    setSetSearch("");
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ marginTop: 0 }}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Assign KPI Sets to Users
          </h2>

          <Button
            htmlType="button"
            appearance="secondary"
            onClick={handleClose}
            className="p-0 text-slate-500 hover:text-slate-700"
            icon={<X className="w-6 h-6" />}
          />
        </div>

        <div className="m-2 md:px-6 md:py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-center [@media(min-width:20rem)]:justify-start md:gap-4 gap-1">
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap text-slate-700">
              Assignment Mode:
            </span>
            <div className="flex gap-2">
              <Button
                htmlType="button"
                appearance={assignmentMode === "add" ? "primary" : "secondary"}
                onClick={() => setAssignmentMode("add")}
                className="px-1 md:px-4 md:py-2 text-xs leading-none sm:text-sm whitespace-nowrap"
              >
                Add to Existing
              </Button>

              <Button
                htmlType="button"
                appearance={
                  assignmentMode === "replace" ? "primary" : "secondary"
                }
                onClick={() => setAssignmentMode("replace")}
                className="px-1 sm:px-4 sm:py-2 text-xs leading-none sm:text-sm whitespace-nowrap"
              >
                Replace All
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {assignmentMode === "add"
              ? "Selected sets will be added to users' existing assignments"
              : "All existing assignments will be removed and replaced with selected sets"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Users Selection */}
            <div>
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-6 w-6 sm:w-5 sm:h-5 text-slate-600" />
                  <h3 className="text-xs sm:text-base font-medium text-slate-900 m-0">
                    Select Users ({selectedUsers.size} selected)
                  </h3>
                </div>

                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(value) => setUserSearch(String(value))}
                />
              </div>

              <div className="border border-slate-300 rounded-lg max-h-96 overflow-y-auto">
                {isUsersLoading ? (
                  <p className="text-slate-500 text-center py-8">Loading users…</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No users found
                  </p>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredUsers.map((u) => (
                      <label
                        key={u.id}
                        className="flex items-center gap-3 p-3 rounded hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(u.id)}
                          onChange={() => handleUserToggle(u.id)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 mb-0">
                            {u.fullName ?? u.workEmail ?? "Unknown"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sets Selection */}
            <div>
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-6 w-6 sm:w-5 sm:h-5 text-slate-600" />
                  <h3 className="text-xs sm:text-base font-medium text-slate-900 m-0">
                    Select Sets ({selectedSets.size} selected)
                  </h3>
                </div>

                <Input
                  placeholder="Search sets..."
                  value={setSearch}
                  onChange={(value) => setSetSearch(String(value))}
                />
              </div>

              <div className="border border-slate-300 rounded-lg max-h-96 overflow-y-auto">
                {filteredSets.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No sets found
                  </p>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredSets.map((set) => (
                      <label
                        key={set.id}
                        className="flex items-center gap-3 p-3 rounded hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSets.has(set.id)}
                          onChange={() => handleSetToggle(set.id)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex-1 ">
                          <p className="text-sm font-medium text-slate-900 mb-0">
                            {set.name}
                          </p>
                          <div className="flex md:items-center md:gap-2 sm:mt-1 md:flex-row flex-col">
                            <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {set.code}
                            </span>
                            <Badge variant="blue">
                              {set.timeline}
                            </Badge>
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {set.kpis?.length || 0} KPI
                              {(set.kpis?.length || 0) !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs sm:text-sm text-slate-600">
            Assigning <strong>{selectedSets.size}</strong> set
            {selectedSets.size !== 1 ? "s" : ""} to{" "}
            <strong>{selectedUsers.size}</strong> user
            {selectedUsers.size !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-3">
            <Button
              htmlType="button"
              appearance="secondary"
              onClick={handleClose}
              className="px-1 text-xs sm:text-base sm:px-4 sm:py-2"
            >
              Cancel
            </Button>

            <Button
              htmlType="button"
              appearance="primary"
              onClick={handleSubmit}
              disabled={
                selectedUsers.size === 0 ||
                selectedSets.size === 0 ||
                isSubmitting
              }
              icon={<Save className="w-4 h-4" />}
              className="px-1 sm:px-4 sm:py-2 text-xs sm:text-base whitespace-nowrap flex items-center gap-2"
            >
              {isSubmitting ? "Assigning…" : "Assign Sets"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignModal;
