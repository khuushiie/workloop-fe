import React, { useEffect, useMemo, useState, useRef } from "react";
import { CheckCircle, Info } from "lucide-react";
import { SetScoreData } from "./types";
import { SimpleTooltip } from "../../common";
import { TextArea } from "../../common/TextArea";
import { KpiTimeline } from "../../../types/kpi.api.types";

const formatPeriodDisplay = (
  timeline: KpiTimeline | string,
  start: string | Date,
  end: string | Date
) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (timeline === KpiTimeline.WEEKLY) {
    const startStr = startDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    const endStr = endDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  }
  if (timeline === KpiTimeline.MONTHLY) {
    return startDate.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }
  if (timeline === KpiTimeline.YEARLY) {
    return startDate.getFullYear().toString();
  }
  return "";
};

interface HistoryEntry {
  setId: string;
  periodStart: string | Date;
  periodEnd: string | Date;
  timeline: string;
  comment?: string;
  kpiStatuses: Array<{ kpiId: string; isCompleted: boolean }>;
}

interface SetChecklistCardProps {
  data: SetScoreData;
  historyData: HistoryEntry[];
  periodLabel: string;
  onToggle: (setId: string, kpiId: string, checked: boolean) => void;
  onComment: (setId: string, comment: string) => void;
}

/** Stable KPI id: API uses `id`, some sources use `_id` */
function getKpiId(kpi: any): string {
  if (!kpi) return "";
  const id = kpi.id ?? kpi._id;
  return id != null ? String(id) : "";
}

const SetChecklistCard: React.FC<SetChecklistCardProps> = ({
  data,
  historyData,
  periodLabel,
  onToggle,
  onComment,
}) => {
  const [localStatus, setLocalStatus] = useState<Record<string, boolean>>({});
  const initializedKeyRef = useRef<string | null>(null);

  const matchingHistoryEntry = useMemo(() => {
    return historyData?.find((historyEntry) => {
      if (!historyEntry.periodStart || !historyEntry.periodEnd) return false;

      const formatted = formatPeriodDisplay(
        historyEntry.timeline,
        historyEntry.periodStart,
        historyEntry.periodEnd
      );
      return historyEntry.setId === data.setId && periodLabel === formatted;
    });
  }, [historyData, periodLabel, data.setId]);

  const { displayStatus, displayComment } = useMemo(() => {
    let historyMap: Record<string, { isCompleted: boolean }> = {};
    let historyComment;

    if (matchingHistoryEntry) {
      historyMap = matchingHistoryEntry.kpiStatuses.reduce(
        (acc: any, status: any) => {
          acc[status.kpiId] = { isCompleted: status.isCompleted };
          return acc;
        },
        {}
      );
      historyComment = matchingHistoryEntry.comment;
    }

    const dataStatusMap: Record<string, { isCompleted: boolean }> = {};
    if (data.completionStatus) {
      Object.entries(data.completionStatus).forEach(
        ([kpiId, status]: [string, any]) => {
          dataStatusMap[kpiId] = {
            isCompleted: status?.isCompleted || false,
          };
        }
      );
    }

    const mergedStatus = {
      ...historyMap,
      ...dataStatusMap,
      ...Object.fromEntries(
        Object.entries(localStatus).map(([kpiId, isCompleted]) => [
          kpiId,
          { isCompleted },
        ])
      ),
    };

    const mergedComment = data.comment ? data.comment : historyComment;

    return {
      displayStatus: mergedStatus,
      displayComment: mergedComment,
    };
  }, [matchingHistoryEntry, data, localStatus]);

  const totalCount = data.kpis.length;
  const completedCount = Object.values(displayStatus).filter(
    (s) => s?.isCompleted
  ).length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  /** When score is approved (completed), no further scoring for this period */
  const isReadOnly = data.approvalStatus === "approved";
  const currentKey = `${data.setId}-${periodLabel}`;

  useEffect(() => {
    // Prevents infinite loops - once initialized for a key, we don't re-initialize
    if (initializedKeyRef.current === currentKey) {
      return;
    }

    initializedKeyRef.current = currentKey;
    setLocalStatus({});

    data.kpis.forEach((kpi) => {
      const kpiId = getKpiId(kpi);
      if (!kpiId) return;
      let isDone = false;
      if (data.completionStatus?.[kpiId]?.isCompleted) {
        isDone = true;
      } else if (matchingHistoryEntry) {
        const historyStatus = matchingHistoryEntry.kpiStatuses.find(
          (s) => s.kpiId === kpiId
        );
        isDone = historyStatus?.isCompleted || false;
      }
      onToggle(data.setId, kpiId, isDone);
    });

    const initialComment = data.comment || matchingHistoryEntry?.comment || "";
    if (initialComment) {
      onComment(data.setId, initialComment);
    }
  }, [currentKey]);

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {data.setName}
          </h3>
          <p className="text-sm text-slate-600">
            {data.timeline} • {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              allCompleted
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {completedCount}/{totalCount} Complete
          </span>
          {allCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
        </div>
      </div>

      <div className="mb-4">
              {data.kpis.map((kpi: any) => {
                const kpiId = getKpiId(kpi);
                if (!kpiId) return null;
                return (
                <label
                  key={kpiId}
                  className={`flex items-center gap-3 p-3 rounded-lg ${isReadOnly ? "opacity-75" : "hover:bg-slate-50 cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={displayStatus[kpiId]?.isCompleted || false}
                    disabled={isReadOnly}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setLocalStatus((prev) => ({
                        ...prev,
                        [kpiId]: checked,
                      }));
                      onToggle(data.setId, kpiId, checked);
                    }}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-0 focus:outline-none disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-slate-900 mb-0">{kpi?.name}</p>
                    <SimpleTooltip
                      key={kpiId}
                      label={
                        <div className="text-xs max-w-[200px]">
                          <p className="font-semibold mb-1 text-justify border-b border-slate-500/30 pb-1">
                            {kpi?.name}
                          </p>
                          <p className="text-slate-500 text-justify">
                            {kpi?.description}
                          </p>
                        </div>
                      }
                      side="top"
                    >
                      <span className="flex self-center cursor-pointer flex-shrink-0 ml-1" style={{marginTop: '2px'}}>
                        <Info size={10} className="w-3 h-3 text-slate-400" />
                      </span>
                    </SimpleTooltip>
                  </div>
                </label>
              );
              })}
            </div>
      <div>
        <TextArea
          label="Comment"
          value={data.comment || displayComment}
          onChange={(value: string) => onComment(data.setId, value)}
          placeholder="Add your feedback and comments here (required)..."
          required
          disabled={isReadOnly}
        />
      </div>
    </div>
  );
};

export default SetChecklistCard;
