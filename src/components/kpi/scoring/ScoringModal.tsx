import React, { useMemo } from "react";
import TimelineSelector from "./TimelineSelector";
import PeriodNavigator from "./PeriodNavigator";
import SetChecklistCard from "./SetChecklistCard";
import HistoryList from "./HistoryList";
import { SetScoreData, TimelineType } from "./types";
import { X } from "lucide-react";
import {
  KPI_SCORING_STATUS,
  KPI_APPROVAL_STATUS,
} from "../../../utils/constants";
import { Button } from "../../common";

interface ScoringModalProps {
  open: boolean;
  user: any;
  selectedTimeline: TimelineType;
  periodLabel: string;
  activeTab: "current" | "history";
  setScores: Record<string, SetScoreData>;
  timelineLoading: boolean;
  historyLoading: boolean;
  historyData: any[];
  onClose: () => void;
  onTimelineChange: (t: TimelineType) => void;
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
  canGoNext: boolean;
  onTabChange: (tab: "current" | "history") => void;
  onToggle: (setId: string, kpiId: string, checked: boolean) => void;
  onComment: (setId: string, comment: string) => void;
  onSave: () => void;
  onRefreshHistory?: () => void;
}

const ScoringModal: React.FC<ScoringModalProps> = ({
  open,
  user,
  selectedTimeline,
  periodLabel,
  activeTab,
  setScores,
  timelineLoading,
  historyLoading,
  historyData,
  onClose,
  onTimelineChange,
  onPrevPeriod,
  onNextPeriod,
  canGoNext,
  onTabChange,
  onToggle,
  onComment,
  onSave,
  onRefreshHistory,
}) => {
  if (!open || !user) return null;
  const periodStatus = useMemo(() => {
    const sets = Object.values(setScores);
    if (sets.length === 0) {
      return {
        status: KPI_SCORING_STATUS.NOT_SCORED,
        class: "bg-slate-100 text-slate-800",
        counts: { approved: 0, pending: 0, notScored: 0, total: 0 },
        l2Name: null,
      };
    }

    let l2Name: string | null = null;
    const statusCounts = {
      approved: 0,
      pending: 0,
      notScored: 0,
      total: sets.length,
    };

    sets.forEach((set) => {
      if (set.approvalStatus === KPI_APPROVAL_STATUS.APPROVED) {
        statusCounts.approved++;
      } else if (set.approvalStatus === KPI_APPROVAL_STATUS.PENDING_L2) {
        statusCounts.pending++;
        l2Name = set.pendingBy?.firstName + " " + set.pendingBy?.lastName;
      } else {
        statusCounts.notScored++;
      }
    });

    let overallStatus: string = KPI_SCORING_STATUS.NOT_SCORED;
    let statusClass = "bg-slate-100 text-slate-800";

    if (statusCounts.approved === statusCounts.total) {
      overallStatus = KPI_SCORING_STATUS.APPROVED;
      statusClass = "bg-green-100 text-green-800";
    } else if (statusCounts.pending > 0) {
      overallStatus = KPI_SCORING_STATUS.PENDING_AT_L2;
      statusClass = "bg-yellow-100 text-yellow-800";
    } else if (statusCounts.notScored === statusCounts.total) {
      overallStatus = KPI_SCORING_STATUS.NOT_SCORED;
      statusClass = "bg-slate-100 text-slate-800";
    } else {
      overallStatus = "Partially Scored";
      statusClass = "bg-primary-100 text-primary-800";
    }

    return {
      status: overallStatus,
      class: statusClass,
      counts: statusCounts,
      l2Name: l2Name,
    };
  }, [setScores]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 " style={{marginTop: 0}}>
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col">
        <div className="flex justify-between items-center px-3 py-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Score KPI Sets - {user.fullName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <TimelineSelector
          selected={selectedTimeline}
          onChange={onTimelineChange}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
        {activeTab === "current" && (
        <PeriodNavigator
          label={periodLabel}
          canGoNext={canGoNext}
          onPrev={onPrevPeriod}
          onNext={onNextPeriod}
        />
        )}

        {/* Period-Specific Status Summary */}
        {activeTab === "current" && Object.keys(setScores).length > 0 && (
          <div className="px-6 py-3 border-b border-slate-200 bg-primary-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  Scoring :
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${periodStatus.class}`}
                >
                  {periodStatus.status} {periodStatus.l2Name ? `- ${periodStatus.l2Name}` : ""}
                </span>
                {periodStatus.counts.total > 1 && (
                  <span className="text-xs text-slate-600">
                    ({periodStatus.counts.approved} Approved,{" "}
                    {periodStatus.counts.pending} Pending,{" "}
                    {periodStatus.counts.notScored} Not Scored)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {historyLoading || timelineLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-sm text-slate-600">Loading...</p>
            </div>
          ) : activeTab === "current" ? (
            <div >
              {Object.keys(setScores).length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg font-medium">
                    No{" "}
                    {selectedTimeline.charAt(0) +
                      selectedTimeline.slice(1).toLowerCase()}{" "}
                    Sets Assigned
                  </p>
                  <p className="text-sm">
                    This user has no active {selectedTimeline.toLowerCase()} KPI
                    sets assigned for the selected period
                  </p>
                  <p className="text-xs mt-2 text-slate-400">
                    Try selecting a different period type above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(setScores).map((setScore) => (
                  <SetChecklistCard
                    key={setScore.setId}
                    historyData={historyData}
                    data={setScore}
                    periodLabel={periodLabel}
                    onToggle={onToggle}
                    onComment={onComment}
                  />
                ))}
                </div>
              )}
            </div>
          ) : (
            <HistoryList
              items={historyData}
              formatPeriod={(start, end) => {
                const formatDate = (date: Date) => {
                  const day = date.getDate();
                  const month = date.toLocaleString('en-US', { month: 'short' });
                  const year = date.getFullYear();
                  return `${day} ${month} ${year}`;
                };
                return `${formatDate(start)} - ${formatDate(end)}`;
              }}
              onRefresh={onRefreshHistory}
              user={user}
            />
          )}
        </div>

        {activeTab === "current" && (
          <div className="flex justify-end space-x-3 p-4 border-t border-slate-200 bg-slate-50">
            <Button
              onClick={onClose}
              appearance="secondary"
              size="large"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              appearance="primary"
              size="large"
            >
              Save Scores
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoringModal;
