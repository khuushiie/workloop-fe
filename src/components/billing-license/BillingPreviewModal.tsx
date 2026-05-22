import React from "react";
import {
  FileText,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import dayjs from "dayjs";
import {
  useGetBillingByIdQuery,
  type IBillingRecord,
} from "../../store/apis/billingLicense.api";
import { SubscriptionPlan } from "../../constants/subscriptionPlan";

interface BillingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingId: string | null;
}

const getStatusBadge = (status: string) => {
  const display = status.charAt(0).toUpperCase() + status.slice(1);
  switch (status) {
    case "paid":
      return (
        <Badge
          variant="green"
          size="middle"
          icon={<CheckCircle className="w-3 h-3" />}
        >
          {display}
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="yellow"
          size="middle"
          icon={<Clock className="w-3 h-3" />}
        >
          {display}
        </Badge>
      );
    case "overdue":
      return (
        <Badge
          variant="red"
          size="middle"
          icon={<AlertCircle className="w-3 h-3" />}
        >
          {display}
        </Badge>
      );
    default:
      return (
        <Badge variant="gray" size="middle">
          {display}
        </Badge>
      );
  }
};

const getPlanBadgeVariant = (
  plan: string,
): "blue" | "purple" | "orange" | "gray" => {
  switch (plan) {
    case SubscriptionPlan.STARTER:
      return "blue";
    case SubscriptionPlan.GROWTH:
      return "purple";
    case SubscriptionPlan.ENTERPRISE:
      return "orange";
    default:
      return "gray";
  }
};

const BillingPreviewModal: React.FC<BillingPreviewModalProps> = ({
  isOpen,
  onClose,
  billingId,
}) => {
  const {
    data: billing,
    isLoading,
    isFetching,
    isError,
  } = useGetBillingByIdQuery(billingId as string, {
    skip: !billingId || !isOpen,
  });

  const record: IBillingRecord | null =
    billing && billingId && isOpen ? billing : null;

  const modalTitle = (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
        <FileText className="w-5 h-5 text-primary-600" />
      </div>
      <span className="text-lg font-bold text-slate-900">Invoice Details</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      {isLoading || isFetching ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : isError || !record ? (
        <div className="text-center py-12 text-sm text-red-600">
          Failed to load billing details.
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div>
              <p className="text-lg font-medium text-slate-900 mb-0">
                {dayjs(record.billingMonth).format("MMMM YYYY")}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 mb-0">
                Billing period
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {getStatusBadge(record.status)}
              {record.paidAt && (
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                    Paid at
                  </p>
                  <p className="text-xs font-medium text-slate-900 mb-0">
                    {dayjs(record.paidAt).format("MMM D, YYYY [at] h:mm A")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 border-b border-slate-200">
            <div className="py-4 pr-4 border-r border-slate-200">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                Total Amount
              </p>
              <p className="text-xl font-semibold text-primary-600 mb-0">
                {record.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="py-4 px-4 border-r border-slate-200">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                Licenses
              </p>
              <p className="text-xl font-semibold text-slate-900 mb-0">
                {record.userLimit ?? record.breakdown?.[0]?.userLimit ?? "—"}
              </p>
            </div>
            <div className="py-4 pl-4">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                Cost / License
              </p>
              <p className="text-xl font-semibold text-slate-900 mb-0">
                {(record.costPerDeveloper ?? record.breakdown?.[0]?.costPerDeveloper) != null
                  ? (record.costPerDeveloper ?? record.breakdown![0].costPerDeveloper).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          {record.breakdown && record.breakdown.length > 0 && (
            <div className="pt-4">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2.5">
                Billing Details
              </p>
              <div className="space-y-3">
                {record.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-3.5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant={getPlanBadgeVariant(item.planType)}
                        size="small"
                      >
                        {item.planType.charAt(0) +
                          item.planType.slice(1).toLowerCase()}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {dayjs(item.periodStart).format("MMM D")} –{" "}
                        {dayjs(item.periodEnd).format("MMM D, YYYY")}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Licenses</span>
                        <span className="font-medium text-slate-900">
                          {item.userLimit}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Cost per license</span>
                        <span className="font-medium text-slate-900">
                          {item.costPerDeveloper.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Days</span>
                        <span className="font-medium text-slate-900">
                          {item.daysActive}
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-slate-200 my-2.5" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-900">
                        Amount
                      </span>
                      <span className="text-[15px] font-medium text-primary-600">
                        {item.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.isPreview && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              This is a preview. Final billing may differ.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default BillingPreviewModal;
