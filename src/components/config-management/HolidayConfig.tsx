import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Save, Clock, CalendarDays, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useAuth } from "../../store/hooks/useAuth";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import {
  useGetWeekOffConfigQuery,
  useUpdateWeekOffConfigMutation,
  useGetWeekOffConfigHistoryQuery,
  useDeleteWeekOffConfigHistoryMutation,
} from "../../store/apis/organization.api";
import { useAppDispatch } from "../../store/hooks";
import { setWeekOffConfig } from "../../store/slices/authSlice";
import type {
  WeekOffRule,
  WeekOffConfigHistoryEntry,
} from "../../utils/weekOff";
import { Button, Select, Input, DatePicker, Loading, ConfirmationModal } from "../common";

const WEEKDAY_OPTIONS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
];

const PATTERN_OPTIONS = [
  { value: "EVERY", label: "Every" },
  { value: "NTH", label: "Specific occurrences" },
];

const OCCURRENCE_OPTIONS = [
  { value: "1", label: "1st" },
  { value: "2", label: "2nd" },
  { value: "3", label: "3rd" },
  { value: "4", label: "4th" },
  { value: "5", label: "5th" },
];

function weekdayLabel(wd: number): string {
  return (
    WEEKDAY_OPTIONS.find((o) => o.value === String(wd))?.label ?? String(wd)
  );
}

function ruleToSummary(rule: WeekOffRule): string {
  const day = weekdayLabel(rule.weekday);
  if (rule.pattern === "EVERY") return `Every ${day}`;
  const ordinals = (rule.occurrences ?? [])
    .map(
      (n) =>
        OCCURRENCE_OPTIONS.find((o) => o.value === String(n))?.label ?? `${n}th`,
    )
    .join(", ");
  return `${ordinals} ${day}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface RuleFormState {
  weekday: number;
  pattern: "EVERY" | "NTH";
  occurrences: number[];
}

function formatShortDate(iso: string): { day: string; monthYear: string } {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-IN", { day: "2-digit" }),
    monthYear: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
  };
}

const TimelineCard: React.FC<{
  entry: WeekOffConfigHistoryEntry;
  position: "above" | "below";
  isLatest: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}> = ({ entry, position, isLatest, canDelete, isDeleting, onDelete }) => {
  const { day, monthYear } = formatShortDate(entry.effectiveFrom);

  const card = (
    <div
      className={`
        group relative w-52 rounded-xl border p-4 transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        ${isLatest
          ? "bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200 shadow-sm"
          : "bg-white border-slate-200 shadow-sm"
        }
      `}
    >
      {/* Date badge */}
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold leading-none
            ${isLatest
              ? "bg-primary-100 text-primary-700"
              : "bg-slate-100 text-slate-600"
            }
          `}
        >
          {day}
        </div>
        <div className="leading-tight">
          <p className={`text-xs font-semibold mb-0 ${isLatest ? "text-primary-700" : "text-slate-700"}`}>
            {monthYear}
          </p>
          {isLatest && (
            <span className="text-[9px] font-semibold uppercase tracking-wider text-primary-500 leading-none">
              Latest
            </span>
          )}
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-1 mb-2">
        {entry.rules.map((r, ri) => (
          <div key={ri} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isLatest ? "bg-primary-400" : "bg-slate-300"
              }`}
            />
            <span className="truncate">{ruleToSummary(r)}</span>
          </div>
        ))}
        {entry.rules.length === 0 && (
          <p className="text-xs text-slate-400 italic">No rules</p>
        )}
      </div>

      {/* Change reason */}
      {entry.changeReason && (
        <p className="text-[10px] text-slate-400 italic leading-snug line-clamp-2">
          &ldquo;{entry.changeReason}&rdquo;
        </p>
      )}

      {/* Delete */}
      {canDelete && (
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={isDeleting}
            className="p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
            title="Delete"
          >
            {isDeleting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 224 }}>
      {position === "above" ? (
        <>
          {card}
          {/* Connector stem from card to dot */}
          <div className={`w-px h-5 ${isLatest ? "bg-primary-300" : "bg-slate-200"}`} />
        </>
      ) : (
        <>
          <div className={`w-px h-5 ${isLatest ? "bg-primary-300" : "bg-slate-200"}`} />
          {card}
        </>
      )}
    </div>
  );
};

const HistoryTimeline: React.FC<{
  history: WeekOffConfigHistoryEntry[];
  canDelete?: boolean;
  onDelete?: (historyId: string) => void;
  deletingId?: string | null;
}> = ({ history, canDelete, onDelete, deletingId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <CalendarDays className="w-10 h-10 mb-3 text-slate-300" />
        <p className="text-sm font-medium">No configuration history yet</p>
        <p className="text-xs mt-1">Changes you make will appear here as a timeline.</p>
      </div>
    );
  }

  const sorted = [...history].reverse();

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto pb-2 scroll-smooth"
      style={{ scrollbarWidth: "thin", scrollbarColor: "var(--color-primary-200) transparent" }}
    >
      <div
        className="relative flex items-center"
        style={{ minWidth: sorted.length * 224, paddingTop: 8, paddingBottom: 8 }}
      >
        {/* Main horizontal track */}
        <div
          className="absolute left-[112px] right-[112px] h-0.5 rounded-full"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            background: "linear-gradient(90deg, var(--color-primary-200), var(--color-secondary-200))",
          }}
        />

        {sorted.map((entry, idx) => {
          const isAbove = idx % 2 === 0;
          const isLatest = idx === sorted.length - 1;

          return (
            <div
              key={entry.id}
              className="relative flex flex-col items-center flex-shrink-0"
              style={{ width: 224 }}
            >
              {/* Card above */}
              {isAbove && (
                <TimelineCard
                  entry={entry}
                  position="above"
                  isLatest={isLatest}
                  canDelete={!!canDelete}
                  isDeleting={deletingId === entry.id}
                  onDelete={() => onDelete?.(entry.id)}
                />
              )}

              {/* Dot on the track */}
              <div className="relative z-10">
                <div
                  className={`w-4 h-4 rounded-full border-[3px] transition-transform duration-200 hover:scale-125
                    ${isLatest
                      ? "bg-primary-500 border-primary-200 shadow-[0_0_0_3px_rgba(var(--color-primary-500-rgb,99,102,241),0.15)]"
                      : "bg-white border-primary-300"
                    }
                  `}
                />
              </div>

              {/* Card below */}
              {!isAbove && (
                <TimelineCard
                  entry={entry}
                  position="below"
                  isLatest={isLatest}
                  canDelete={!!canDelete}
                  isDeleting={deletingId === entry.id}
                  onDelete={() => onDelete?.(entry.id)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const HolidayConfig: React.FC = () => {
  const { user } = useAuth();
  const canManage = useHasPermission(PERMISSIONS.WEEK_OFF_CONFIG_MANAGE);
  const dispatch = useAppDispatch();
  const orgId = user?.organizationId;

  const { data: weekOffCfg, isLoading } = useGetWeekOffConfigQuery(
    orgId ?? "",
    { skip: !orgId },
  );

  const { data: history = [], isLoading: historyLoading } =
    useGetWeekOffConfigHistoryQuery(orgId ?? "", { skip: !orgId });

  const [updateConfig, { isLoading: isSaving }] =
    useUpdateWeekOffConfigMutation();
  const [deleteHistory] = useDeleteWeekOffConfigHistoryMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [rules, setRules] = useState<RuleFormState[]>([]);
  const [label, setLabel] = useState("Week off");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [changeReason, setChangeReason] = useState("");

  const minEffectiveDate = (() => {
    const today = dayjs();
    if (history.length === 0) return today;
    const latestHistoryDate = dayjs(history[0].effectiveFrom).add(1, "day");
    return latestHistoryDate.isAfter(today) ? latestHistoryDate : today;
  })();

  useEffect(() => {
    if (weekOffCfg?.rules?.length) {
      setRules(
        weekOffCfg.rules.map((r) => ({
          weekday: r.weekday,
          pattern: r.pattern,
          occurrences: r.occurrences ?? [],
        })),
      );
      setLabel(weekOffCfg.label ?? "Week off");
    }
  }, [weekOffCfg]);

  useEffect(() => {
    setEffectiveFrom(minEffectiveDate.format("YYYY-MM-DD"));
  }, [history]);

  const addRule = () => {
    setRules((prev) => [
      ...prev,
      { weekday: 7, pattern: "EVERY", occurrences: [] },
    ]);
  };

  const removeRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, patch: Partial<RuleFormState>) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };

  const toggleOccurrence = (index: number, occ: number) => {
    setRules((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const next = r.occurrences.includes(occ)
          ? r.occurrences.filter((o) => o !== occ)
          : [...r.occurrences, occ].sort();
        return { ...r, occurrences: next };
      }),
    );
  };

  const handleSave = async () => {
    if (!orgId) {
      toast.error("Please login to from your organization.");
      return;
    }

    if (!effectiveFrom) {
      toast.error("Please select an effective-from date.");
      return;
    }

    if (dayjs(effectiveFrom).isBefore(minEffectiveDate, "day")) {
      toast.error(
        `Effective-from date must be on or after ${minEffectiveDate.format("DD MMM YYYY")}. ` +
          "A config already exists for an earlier date.",
      );
      return;
    }

    for (const r of rules) {
      if (r.pattern === "NTH" && r.occurrences.length === 0) {
        toast.error(
          `Please select at least one occurrence for ${weekdayLabel(r.weekday)}.`,
        );
        return;
      }
    }

    const payload = {
      rules: rules.map((r) => ({
        weekday: r.weekday,
        pattern: r.pattern,
        ...(r.pattern === "NTH" ? { occurrences: r.occurrences } : {}),
      })) as WeekOffRule[],
      label: label || undefined,
      effectiveFrom,
      changeReason: changeReason.trim() || undefined,
    };

    try {
      await updateConfig({ orgId, body: payload }).unwrap();
      dispatch(setWeekOffConfig({ rules: payload.rules, label: payload.label }));
      setChangeReason("");
      toast.success("Week-off configuration saved.");
    } catch {
      toast.error("Failed to save week-off configuration.");
    }
  };

  const handleRequestDelete = (historyId: string) => {
    setPendingDeleteId(historyId);
  };

  const handleConfirmDelete = async () => {
    if (!orgId || !pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    setPendingDeleteId(null);
    try {
      await deleteHistory({ orgId, historyId: pendingDeleteId }).unwrap();
      toast.success("Configuration deleted.");
    } catch {
      toast.error("Failed to delete configuration.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <Loading message="Loading configuration…" />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Week-Off Config
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure which days of the week are off for your organization.
          </p>
        </div>
      </div>

      {/* ─── Editor Card ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 space-y-6">
          {/* Label */}
          <div className="max-w-sm">
            <Input
              label="Display label"
              value={label}
              onChange={(val) => setLabel(String(val))}
              placeholder="Week off"
              disabled={!canManage}
              maxLength={100}
            />
          </div>

          {/* Rules */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <label className="block text-sm font-medium text-slate-700 mb-0">
                Week-off rules
              </label>
              {canManage && (
                <Button
                  htmlType="button"
                  appearance="secondary"
                  onClick={addRule}
                  className="flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add rule
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-start gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <div className="w-44">
                    <Select
                      label="Day of week"
                      value={String(rule.weekday)}
                      onChange={(val) =>
                        updateRule(idx, { weekday: Number(val) })
                      }
                      options={WEEKDAY_OPTIONS}
                      disabled={!canManage}
                    />
                  </div>

                  <div className="w-52">
                    <Select
                      label="Pattern"
                      value={rule.pattern}
                      onChange={(val) => {
                        const pattern = val === "NTH" ? "NTH" : "EVERY";
                        updateRule(idx, {
                          pattern,
                          occurrences:
                            pattern === "EVERY" ? [] : rule.occurrences,
                        });
                      }}
                      options={PATTERN_OPTIONS}
                      disabled={!canManage}
                    />
                  </div>

                  {rule.pattern === "NTH" && (
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Occurrences
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {OCCURRENCE_OPTIONS.map((occ) => {
                          const isSelected = rule.occurrences.includes(
                            Number(occ.value),
                          );
                          return (
                            <button
                              key={occ.value}
                              type="button"
                              onClick={() =>
                                canManage &&
                                toggleOccurrence(idx, Number(occ.value))
                              }
                              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                                isSelected
                                  ? "bg-primary-100 border-primary-300 text-primary-700"
                                  : "bg-white border-slate-300 text-slate-600 hover:border-primary-300"
                              } ${!canManage ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              {occ.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => removeRule(idx)}
                      className="mt-6 p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {rules.length === 0 && (
                <p className="text-sm text-slate-400 italic">
                  No rules configured. The system default (every Sunday + 2nd
                  Saturday) will be used.
                </p>
              )}
            </div>
          </div>

          {/* Effective From + Change Reason + Actions */}
          {canManage && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap gap-4">
                <div className="w-56">
                  <DatePicker
                    label="Effective from"
                    required
                    value={effectiveFrom ? dayjs(effectiveFrom) : null}
                    minDate={minEffectiveDate}
                    onChange={(date) =>
                      setEffectiveFrom(date ? date.format("YYYY-MM-DD") : "")
                    }
                    placeholder="Select date"
                  />
                </div>

                <div className="flex-1 min-w-[240px]">
                  <Input
                    label="Change reason (optional)"
                    value={changeReason}
                    onChange={(val) => setChangeReason(String(val))}
                    placeholder="e.g. New HR policy for alternate Saturdays"
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  appearance="primary"
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={isSaving}
                  className="flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Submit
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── History Card ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold mb-0 text-slate-800">
              Configuration History
            </h2>
          </div>

          {historyLoading ? (
            <Loading size="sm" message="Loading history…" />
          ) : (
            <HistoryTimeline
              history={history}
              canDelete={canManage}
              onDelete={handleRequestDelete}
              deletingId={deletingId}
            />
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Configuration"
        message="Are you sure you want to delete this week-off configuration? This action cannot be undone."
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={!!deletingId}
      />
    </div>
  );
};

export default HolidayConfig;
