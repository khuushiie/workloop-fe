// src/components/Organization/components/OrganizationTableSection.tsx

import React, { useMemo } from "react";
import {
  Eye,
  Trash2,
  SquarePen,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ConfigurableTable } from "../../common";
import { TableColumn } from "../../common/Table";
import Pagination from "../../common/Pagination";
import Badge, { BadgeVariant } from "../../common/Badge";
import { SimpleTooltip } from "../../common";
import type { IOrganizationListItem } from "../../../types/organization.types";
import {
  SubscriptionPlan,
  isSubscriptionPlan,
} from "../../../constants/subscriptionPlan";
import ExcelIcon from "../../../icons/ExcelIcon";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getOrganizationStatusVariant = (
  status?: string
): BadgeVariant => {
  const s = status?.trim().toLowerCase();
  switch (s) {
    case "active":
      return "green";
    case "inactive":
      return "red";
    default:
      return "gray";
  }
};

const SUBSCRIPTION_PLAN_BADGE_VARIANT: Record<SubscriptionPlan, BadgeVariant> =
  {
    [SubscriptionPlan.STARTER]: "blue",
    [SubscriptionPlan.GROWTH]: "purple",
    [SubscriptionPlan.ENTERPRISE]: "orange",
  };

const getOrganizationStatusIcon = (status?: string) => {
  const s = status?.trim().toLowerCase();
  switch (s) {
    case "active":
      return CheckCircle;
    case "inactive":
      return XCircle;
    default:
      return AlertCircle;
  }
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrganizationTableSectionProps {
  Organizations: IOrganizationListItem[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onView: (Organization: IOrganizationListItem) => void;
  onEdit: (Organization: IOrganizationListItem) => void;
  onDelete: (OrganizationId: string) => void;
  onExport: () => void;
  canManage: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const OrganizationTableSection: React.FC<OrganizationTableSectionProps> = ({
  Organizations,
  loading,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onView,
  onEdit,
  onDelete,
  onExport,
  canManage,
}) => {
  const baseCellClass = "text-sm text-slate-900";
  const placeholderCellClass = "text-sm text-slate-500";

  const columns = useMemo<TableColumn<IOrganizationListItem>[]>(
    () => [
      {
        key: "name",
        title: "Organization Name",
        label: "Organization Name",
        required: true,
        render: (_, Organization) => (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary-600">
                {(Organization.name?.charAt(0) ?? "?").toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-900">
              {Organization.name}
            </span>
          </div>
        ),
      },
      {
        key: "email",
        title: "Email",
        label: "Email Address",
        dataIndex: "email",
        render: (value: any) => (
          <span className={value ? baseCellClass : placeholderCellClass}>
            {value || "N/A"}
          </span>
        ),
      },
      {
        key: "website",
        title: "Website",
        label: "Website",
        dataIndex: "website",
        render: (value: any) =>
          value ? (
            <a
              href={value.startsWith("http") ? value : `https://${value}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary-600 hover:underline"
            >
              {value}
            </a>
          ) : (
            <span className={placeholderCellClass}>N/A</span>
          ),
      },
      {
        key: "poc",
        title: "POC",
        label: "POC Name",
        dataIndex: "poc",
        render: (poc: any) => {
          const name = poc?.name;

          return (
            <span className={name ? baseCellClass : placeholderCellClass}>
              {name || "N/A"}
            </span>
          );
        },
      },
      {
        key: "subscriptionPlan",
        title: "Plan",
        label: "Subscription Plan",
        render: (_, Organization) => {
          const plan = Organization.subscriptionPlan;
          if (!plan || !isSubscriptionPlan(plan))
            return <span className={placeholderCellClass}>—</span>;
          return (
            <Badge variant={SUBSCRIPTION_PLAN_BADGE_VARIANT[plan]} size="middle">
              {plan.charAt(0) + plan.slice(1).toLowerCase()}
            </Badge>
          );
        },
      },
      {
        key: "status",
        title: "Status",
        label: "Status",
        render: (_, Organization) => {
          const normalized = (Organization.status ?? "").trim().toLowerCase();
          const label =
            normalized.length > 0
              ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
              : "—";
          const StatusIcon = getOrganizationStatusIcon(normalized);

          return (
            <Badge
              variant={getOrganizationStatusVariant(normalized)}
              size="middle"
            >
              <StatusIcon className="w-4 h-4" />
              {label}
            </Badge>
          );
        },
      },
      {
        key: "actions",
        title: "Actions",
        label: "Actions",
        required: true,
        render: (_, Organization) => (
          <div className="flex items-center space-x-2">
            <SimpleTooltip
              label="View"
              side="top"
              className="inline-block"
              tooltipClassName="text-xs shadow-soft border-0"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.currentTarget.blur();
                  onView(Organization);
                }}
                aria-label="View Organization"
                className="text-primary-600 hover:text-primary-800 transition-colors"
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
              </button>
            </SimpleTooltip>

            {canManage && (
              <>
                <SimpleTooltip
                  label="Edit"
                  side="top"
                  className="inline-block"
                  tooltipClassName="text-xs shadow-soft border-0"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.blur();
                      onEdit(Organization);
                    }}
                    aria-label="Edit Organization"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    <SquarePen className="w-4 h-4" aria-hidden="true" />
                  </button>
                </SimpleTooltip>

                <SimpleTooltip
                  label="Delete"
                  side="top"
                  className="inline-block"
                  tooltipClassName="text-xs shadow-soft border-0"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.blur();
                      onDelete(Organization.id);
                    }}
                    aria-label="Delete Organization"
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </SimpleTooltip>
              </>
            )}
          </div>
        ),
      },
    ],
    [canManage, onDelete, onEdit, onView]
  );

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-hidden">
      <ConfigurableTable<IOrganizationListItem>
        columns={columns}
        data={Organizations}
        loading={loading}
        emptyMessage="No Organizations found"
        rowKey="id"
        configOptions={{ persistenceKey: "organization-onboarding-table" }}
        renderColumnSelector={(selector) => (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Organizations ({totalItems})
            </h3>
            <div className="flex items-center gap-4">
              <button onClick={onExport}>
                <SimpleTooltip label="Organizations Report" side="top">
                  <ExcelIcon />
                </SimpleTooltip>
              </button>
              {selector}
            </div>
          </div>
        )}
      />

      {!!totalItems && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          itemsPerPageOptions={[5, 10, 20, 50, 100]}
        />
      )}
    </div>
  );
};

export default OrganizationTableSection;
