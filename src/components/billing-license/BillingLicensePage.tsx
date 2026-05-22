import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import {
  CreditCard,
  DollarSign,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Plus,
  TrendingUp,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { ConfigurableTable, SimpleTooltip, Select, Button } from "../common";
import FilterWrapper from "../common/FilterWrapper";
import Pagination from "../common/Pagination";
import Badge from "../common/Badge";
import { TableColumn } from "../common/Table";
import BillingPreviewModal from "./BillingPreviewModal";
import UploadProofPayModal from "./UploadProofPayModal";
import { BillingLicensePageSkeleton } from "./Skeleton";
import {
  useGetCurrentBillingQuery,
  useGetBillingHistoryQuery,
  useGetLicenseSummaryQuery,
  useAddLicensesMutation,
  type IBillingHistoryParams,
  type IBillingRecord,
} from "../../store/apis/billingLicense.api";
import toast from "react-hot-toast";
import { useAuth } from "../../store/hooks/useAuth";
import { useEffectivePermissions } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { RoleTypeEnum } from "../../utils/constants";

interface IStatCard {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

const formatBillingMonth = (billingMonth: string): string =>
  dayjs(billingMonth).format("MMMM YYYY");

const capitalizeStatus = (status: string): string =>
  status.charAt(0).toUpperCase() + status.slice(1);

const BILLING_STATUS_OPTIONS: {
  value: "" | IBillingRecord["status"];
  label: string;
}[] = [
  { value: "", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

interface IPaginationState {
  page: number;
  limit: number;
  total: number;
}

const BillingLicensePage: React.FC = () => {
  const { user } = useAuth();
  const { codes, isReady: rbacReady } = useEffectivePermissions();

  const isSuperAdmin =
    user?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN?.toLowerCase();

  const canViewBilling =
    isSuperAdmin ||
    codes.has(PERMISSIONS.BILLING_LICENSE_VIEW) ||
    codes.has(PERMISSIONS.BILLING_LICENSE_MANAGE);

  const canViewLicense =
    isSuperAdmin ||
    codes.has(PERMISSIONS.BILLING_LICENSE_VIEW) ||
    codes.has(PERMISSIONS.BILLING_LICENSE_MANAGE);

  const canManageLicense =
    isSuperAdmin || codes.has(PERMISSIONS.BILLING_LICENSE_MANAGE);

  const [pagination, setPagination] = useState<IPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<
    "" | IBillingRecord["status"]
  >("");
  const [previewBillingId, setPreviewBillingId] = useState<string | null>(null);
  const [uploadPayRecord, setUploadPayRecord] = useState<IBillingRecord | null>(
    null,
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [licenseCount, setLicenseCount] = useState(0);

  const { data: currentBilling, isLoading: isCurrentBillingLoading } =
    useGetCurrentBillingQuery(undefined, {
      skip: !canViewBilling || !rbacReady,
    });

  const billingHistoryParams = useMemo<IBillingHistoryParams>(() => {
    const params: IBillingHistoryParams = {
      page: pagination.page,
      limit: pagination.limit,
    };
    if (statusFilter) params.status = statusFilter;
    return params;
  }, [pagination.page, pagination.limit, statusFilter]);

  const { data: billingHistory, isLoading: isHistoryLoading } =
    useGetBillingHistoryQuery(billingHistoryParams, {
      skip: !canViewBilling || !rbacReady,
    });

  const { data: licenseData, isLoading: isLicenseLoading } =
    useGetLicenseSummaryQuery(undefined, {
      skip: !canViewLicense || !rbacReady,
    });

  const [addLicenses, { isLoading: isAdding }] = useAddLicensesMutation();

  const billing = currentBilling ?? null;
  const history = billingHistory ?? null;
  const license = licenseData ?? null;

  const historyRecords = history?.data ?? [];

  useEffect(() => {
    if (history) {
      setPagination((prev) => ({ ...prev, total: history.total }));
    }
  }, [history]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination({ page: 1, limit, total: pagination.total });
  };

  const handleStatusFilterChange = (
    val: string | number | (string | number)[],
  ) => {
    if (Array.isArray(val)) return;
    const next = val === "" ? "" : (String(val) as IBillingRecord["status"]);
    setStatusFilter(next);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const summaryStats: IStatCard[] = useMemo(() => {
    const costPerLicense =
      billing?.costPerDeveloper ??
      billing?.breakdown?.[0]?.costPerDeveloper ??
      null;

    return [
      {
        title: "Total Amount",
        value: billing ? `${billing.totalAmount.toLocaleString()}` : "—",
        subtitle: billing
          ? formatBillingMonth(billing.billingMonth)
          : undefined,
        icon: CreditCard,
        iconBg: "bg-primary-50",
        iconColor: "text-primary-600",
      },
      {
        title: "Cost per License",
        value:
          costPerLicense != null ? `${costPerLicense.toLocaleString()}` : "—",
        subtitle: "per month",
        icon: DollarSign,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        title: "Total Licenses",
        value: license ? String(license.totalLicenses) : "—",
        icon: Users,
        iconBg: "bg-slate-50",
        iconColor: "text-slate-600",
      },
      {
        title: "Available Licenses",
        value: license ? String(license.availableLicenses) : "—",
        icon: TrendingUp,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
      },
    ];
  }, [billing, license]);

  const getStatusBadge = (status: string) => {
    const display = capitalizeStatus(status);
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

  const columns: TableColumn<IBillingRecord>[] = [
    {
      key: "billingMonth",
      title: "BILLING PERIOD",
      label: "Billing Period",
      required: true,
      render: (_, record) => formatBillingMonth(record.billingMonth),
    },
    {
      key: "totalAmount",
      title: "AMOUNT",
      label: "Total Amount",
      render: (_, record) => (
        <span className="font-semibold text-slate-900">
          {record.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "paidAt",
      title: "PAID AT",
      label: "Paid Date",
      render: (_, record) =>
        record.paidAt ? dayjs(record.paidAt).format("MMM D, YYYY") : "—",
    },
    {
      key: "status",
      title: "STATUS",
      label: "Record Status",
      render: (_, record) => getStatusBadge(record.status),
    },
    {
      key: "actions",
      title: "ACTIONS",
      label: "Actions",
      required: true,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <SimpleTooltip
            label="Preview"
            side="top"
            className="inline-block"
            tooltipClassName="text-xs shadow-soft border-0"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.blur();
                if (record.id) setPreviewBillingId(record.id);
              }}
              aria-label="Preview Invoice"
              className="text-primary-600 hover:text-primary-800 transition-colors"
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
            </button>
          </SimpleTooltip>

          {record.status !== "paid" && (
            <SimpleTooltip
              label="Mark as Paid"
              side="top"
              className="inline-block"
              tooltipClassName="text-xs shadow-soft border-0"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.currentTarget.blur();
                  setUploadPayRecord(record);
                }}
                aria-label="Upload Proof & Mark as Paid"
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
              </button>
            </SimpleTooltip>
          )}

          {/* Billing History: download invoice — re-enable when ready
          <SimpleTooltip ... />
          */}
        </div>
      ),
    },
  ];

  const handleAddLicenses = async () => {
    if (licenseCount < 1) return;
    try {
      await addLicenses({ count: licenseCount }).unwrap();
      toast.success(`Successfully added ${licenseCount} license(s)`);
      setAddModalOpen(false);
      setLicenseCount(1);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to add licenses";
      toast.error(msg);
    }
  };

  const showSkeleton =
    !rbacReady ||
    (canViewBilling && isCurrentBillingLoading) ||
    (canViewLicense && isLicenseLoading);

  if (showSkeleton) {
    return <BillingLicensePageSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="sticky top-0 z-[38] bg-surface-muted px-6 pt-6 pb-4 -mx-6 -mt-6 mb-2">
        <div className="flex max-[830px]:flex-col items-start sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 md:text-3xl">
              Billing &amp; license
            </h1>
          </div>
          {canManageLicense && (
            <Button
              htmlType="button"
              size="large"
              appearance="primary"
              onClick={() => setAddModalOpen(true)}
              icon={<Plus className="w-3 h-3 md:w-5 md:h-5" />}
            >
              Add Licenses
            </Button>
          )}
        </div>
      </div>

      {canViewBilling && !billing && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
          Failed to load billing data. Please try again later.
        </div>
      )}

      {canViewLicense && !license && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
          Failed to load license data. Please try again later.
        </div>
      )}

      {(canViewBilling || canViewLicense) && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {summaryStats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-soft border border-slate-100 p-4 sm:p-5 flex flex-col hover:shadow-soft-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Row 1: title | icon */}
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight min-w-0 pr-1">
                  {stat.title}
                </p>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  <stat.icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`}
                  />
                </div>
              </div>
              {/* Row 2: value | optional subtitle aligned under icon */}
              <div className="flex items-start justify-between gap-2 sm:gap-3 ">
                <p
                  className={`text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums tracking-tight leading-tight break-words min-w-0 mb-0 ${stat.subtitle ? "flex-1" : "w-full"}`}
                >
                  {stat.value}
                </p>
                {stat.subtitle ? (
                  <div className="flex-shrink-0 min-w-0 max-w-[45%] flex flex-col items-end justify-start pt-0.5 pl-1">
                    <p className="text-[11px] sm:text-xs text-slate-400 text-right leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full mt-3">
                      {stat.subtitle}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {canViewBilling && (
        <>
          <FilterWrapper>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Status"
                options={BILLING_STATUS_OPTIONS}
                value={statusFilter}
                onChange={handleStatusFilterChange}
                placeholder="All Status"
              />
            </div>
          </FilterWrapper>

          <div className="bg-white rounded-xl shadow-soft border border-slate-100">
            <ConfigurableTable<IBillingRecord>
              columns={columns}
              data={historyRecords}
              loading={isHistoryLoading}
              rowKey="id"
              emptyMessage="No billing records found"
              configOptions={{ persistenceKey: "billing-license-table" }}
              renderColumnSelector={(selector) => (
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    Billing History
                  </h2>
                  {selector}
                </div>
              )}
            />
            {!!pagination.total && (
              <Pagination
                currentPage={pagination.page}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleLimitChange}
                itemsPerPageOptions={[5, 10, 20, 50, 100]}
              />
            )}
          </div>
        </>
      )}

      <BillingPreviewModal
        isOpen={!!previewBillingId}
        onClose={() => setPreviewBillingId(null)}
        billingId={previewBillingId}
      />

      <UploadProofPayModal
        isOpen={!!uploadPayRecord}
        onClose={() => setUploadPayRecord(null)}
        record={uploadPayRecord}
      />

      {addModalOpen && license && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Add Licenses
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Current plan: {license.subscriptionPlan} (min{" "}
              {license.minLicensesPerPlan} licenses per plan)
            </p>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Number of licenses to add
            </label>
            <input
              type="text"
              min={0}
              value={licenseCount}
              onChange={(e) =>
                setLicenseCount(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setAddModalOpen(false);
                  setLicenseCount(0);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLicenses}
                disabled={isAdding || licenseCount < 1}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingLicensePage;
