import React, { useState } from "react";
import { CheckCircle, History, Check, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../store/hooks/useAuth";
import { KPI_SCORING_STATUS } from "../../../utils/constants";

export interface KpiStatusItem {
  kpiId: string;
  isCompleted: boolean;
  kpiName?: string;
}

export interface ScoreHistoryItem {
  _id?: string;
  id?: string;
  setId?: string;
  setName?: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  period?: string;
  comment?: string;
  approverComment?: string;
  approvalStatus?: string;
  pointsEarned?: number;
  approvedAt?: Date | string;
  kpiStatuses?: KpiStatusItem[];
  kpiCompletionStatus?: KpiStatusItem[];
  pendingAtL2?: { _id?: string; firstName?: string; lastName?: string };
  scoredBy?: { _id?: string };
}

export interface HistoryListUser {
  functionalManager?: { _id?: string } | string;
  reportingManager?: { _id?: string } | string;
}

interface HistoryListProps {
  items: ScoreHistoryItem[];
  formatPeriod: (start: Date, end: Date) => string;
  onRefresh?: () => void;
  user?: HistoryListUser;
}

const HistoryList: React.FC<HistoryListProps> = ({
  items,
  formatPeriod,
  onRefresh,
  user,
}) => {
  const { user: currentUser } = useAuth();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const canApprove = (score: ScoreHistoryItem) => {
    if (!currentUser || !user) return false;

    if (currentUser.role === "Admin") return true;

    if (score.approvalStatus === "pending_l2") {
      const pendingAtL2Id = score.pendingAtL2?._id || (score.pendingAtL2 as string | undefined);
      const functionalManagerId =
        typeof user.functionalManager === "object"
          ? user.functionalManager?._id
          : user.functionalManager;
      return (
        pendingAtL2Id &&
        functionalManagerId &&
        pendingAtL2Id.toString() === functionalManagerId.toString()
      );
    }

    return false;
  };

  const canEdit = (score: ScoreHistoryItem) => {
    if (!currentUser || !user) return false;

    if (score.approvalStatus !== "pending_l2") {
      return false;
    }

    const reportingManagerId =
      typeof user.reportingManager === "object"
        ? user.reportingManager?._id
        : user.reportingManager;
    const currentUserId = (currentUser as { _id?: string; id?: string })._id || currentUser.id;

    const scoredById = score.scoredBy?._id || score.scoredBy;
    return (
      reportingManagerId &&
      currentUserId &&
      reportingManagerId.toString() === currentUserId.toString() &&
      scoredById &&
      scoredById.toString() === currentUserId.toString()
    );
  };

  const handleApprove = async (scoreId: string) => {
    setProcessingId(scoreId);
    try {
      toast.success("Score approved successfully");
      if (onRefresh) onRefresh();
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Failed to approve score");
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = (_score: ScoreHistoryItem) => {
    toast.success("Please use the scoring modal to edit scores");
  };

  const getCompletionRate = (score: ScoreHistoryItem): number => {
    const statuses = score.kpiStatuses ?? score.kpiCompletionStatus ?? [];
    if (!statuses.length) return 0;
    const completed = statuses.filter((s: KpiStatusItem) => s.isCompleted).length;
    return Math.round((completed / statuses.length) * 100);
  };

  const getStatusBadge = (score: ScoreHistoryItem) => {
    if (!score.approvalStatus) {
      return null;
    }

    switch (score.approvalStatus) {
      case "pending_l2":
        const pendingName = score.pendingAtL2?.firstName
          ? `${score.pendingAtL2.firstName} ${
              score.pendingAtL2.lastName || ""
            }`.trim()
          : "Functional Manager";
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {KPI_SCORING_STATUS.PENDING_AT_L2} - {pendingName}
          </span>
        );
      case "approved":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {KPI_SCORING_STATUS.APPROVED}
          </span>
        );
      default:
        return null;
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-lg font-medium">No History Available</p>
        <p className="text-sm">No scores found for previous periods</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((score, idx) => {
        const canApproveScore = canApprove(score);
        const canEditScore = canEdit(score);
        const scoreId = score._id ?? score.id ?? "";
        const isProcessing = processingId === scoreId;

        return (
          <div
            key={idx}
            className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{score.setName}</h4>
                <p className="text-sm text-slate-600">
                  {formatPeriod(
                    new Date(score.periodStart),
                    new Date(score.periodEnd)
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getCompletionRate(score) === 100
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {getCompletionRate(score)}% Complete
                </span>
                {getStatusBadge(score)}
              </div>
            </div>
            <div className="space-y-1 mb-3">
              {score.kpiStatuses?.map((kpiStatus: KpiStatusItem) => (
                <div
                  key={kpiStatus.kpiId}
                  className="flex items-center gap-2 text-sm"
                >
                  {kpiStatus.isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-red-400 rounded-full" />
                  )}
                  <span
                    className={
                      kpiStatus.isCompleted ? "text-slate-900" : "text-red-600"
                    }
                  >
                    {kpiStatus.kpiName}
                  </span>
                </div>
              ))}
            </div>

            {score.comment && (
              <div className="mt-3 p-3 bg-white rounded border border-slate-200">
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Comment:
                </p>
                <p className="text-sm text-slate-900">{score.comment}</p>
              </div>
            )}

            {score.approverComment && (
              <div className="mt-3 p-3 bg-primary-50 rounded border border-primary-200">
                <p className="text-xs font-medium text-primary-600 mb-1">
                  Approver Comment:
                </p>
                <p className="text-sm text-primary-900">{score.approverComment}</p>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              {canEditScore && (
                <button
                  onClick={() => handleEdit(score)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit Score
                </button>
              )}
              {canApproveScore && score.approvalStatus === "pending_l2" && (
                <button
                  onClick={() => handleApprove(scoreId)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryList;
