import React from "react";
import { CheckCircle, SquarePen, XCircle } from "lucide-react";
import { SimpleTooltip, ConfigurableTable } from "../common";
import type { TableColumn } from "../common/Table";
import Badge from "../common/Badge";

interface KpiTableProps {
  kpis: any[];
  loading?: boolean;
  onEditKpi: (kpi: any) => void;
  canManage?: boolean;
}

const KpiTable: React.FC<KpiTableProps> = ({
  kpis,
  loading,
  onEditKpi,
  canManage = false,
}) => {
  const columns: TableColumn<any>[] = [
    {
      key: "index",
      title: "#",
      label: "S.No",
      align: "center",
      width: "60px",
      render: (_, __, index) => (
        <span className="text-sm font-medium text-slate-500">{index + 1}</span>
      ),
    },
    {
      key: "name",
      title: "KPI Name",
      label: "KPI Name",
      required: true,
      dataIndex: "name",
      width: "25%",
      render: (name: any) => (
        <div className="text-sm font-medium text-slate-900">{name as string}</div>
      ),
    },
    {
      key: "description",
      title: "Description",
      label: "Description",
      dataIndex: "description",
      width: "40%",
      render: (description: any) => (
        <div
          className="text-sm text-slate-900 max-w-lg truncate"
          title={(description as string) || "No description"}
        >
          {(description as string) || "No description"}
        </div>
      ),
    },
    {
      key: "weight",
      title: "Weightage",
      label: "Weightage",
      dataIndex: "weight",
      align: "center",
      width: "100px",
      render: (weight: any) => (
        <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 font-medium">
          {(weight as number) || 10}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      dataIndex: "isActive",
      align: "center",
      width: "100px",
      render: (isActive: any) => (
        <Badge
          variant={isActive ? "green" : "red"}
          size="middle"
          icon={
            isActive ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    ...(canManage
      ? [
          {
            key: "actions",
            title: "Actions",
            label: "Actions",
            required: true,
            align: "center" as const,
            width: "80px",
            render: (_: unknown, record: any) => (
              <SimpleTooltip
                label="Edit"
                side="top"
                className="inline-block"
                tooltipClassName="text-xs shadow-soft border-0"
              >
                <button
                  onClick={() => onEditKpi(record)}
                  aria-label="Edit "
                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                >
                  <SquarePen className="w-4 h-4" />
                </button>
              </SimpleTooltip>
            ),
          },
        ]
      : []),
  ];

  return (
    <ConfigurableTable
      columns={columns}
      data={kpis}
      loading={loading}
      emptyMessage="No KPIs found"
      rowKey="_id"
      striped
      hoverable
      bordered
      configOptions={{ persistenceKey: "kpi-management-table" }}
      renderColumnSelector={(selector) => (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            KPI Management
          </h3>
          {selector}
        </div>
      )}
    />
  );
};

export default KpiTable;
