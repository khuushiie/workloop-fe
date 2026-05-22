import React, { useMemo } from "react";
import { Eye, Trash2, SquarePen, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { ConfigurableTable } from "../../common";
import { TableColumn } from "../../common/Table";
import Pagination from "../../common/Pagination";
import type { IUserListItem } from "../../../types/user.api.types";
import Badge from "../../common/Badge";
import { getEmployeeStatusVariant } from "../../../utils/badgeVariants";
import { formatDate } from "../../../utils/timeUtils";
import { SimpleTooltip } from "../../common";
import ExcelIcon from "../../../icons/ExcelIcon";

interface EmployeeTableSectionProps {
  employees: IUserListItem[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onView: (employee: IUserListItem) => void;
  onEdit: (employee: IUserListItem) => void;
  onDelete: (employeeId: string) => void;
  onExport: () => void;
  canManage: boolean;
}

export const getEmployeeStatusIcon = (status?: string) => {
  const normalized = status?.trim().toLowerCase();

  switch (normalized) {
    case "active":
      return CheckCircle;
    case "inactive":
      return XCircle;
    case "terminated":
      return XCircle;
    default:
      return MinusCircle;
  }
};

const maskValue = (value?: string | null, length = 4) =>
  value ? `****${value.toString().slice(-length)}` : "N/A";

const EmployeeTableSection: React.FC<EmployeeTableSectionProps> = ({
  employees,
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
  const columns = useMemo<TableColumn<IUserListItem>[]>(() => {
    const baseCellClass = "text-sm text-slate-900";
    const subtleCellClass = "text-sm text-slate-800";
    const placeholderCellClass = "text-sm text-slate-800";

    return [
      {
        key: "employee",
        title: "Employee",
        label: "Employee",
        required: true,
        render: (_: unknown, employee: IUserListItem) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">
                {(employee.fullName?.charAt(0) || "?").toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">
                {employee.fullName}
              </span>
              <span className="text-xs text-slate-500">{employee.employeeId}</span>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        title: "Work Email",
        label: "Work Email",
        dataIndex: "workEmail",
        className: baseCellClass,
        render: (value: any) => (
          <span className={value ? baseCellClass : placeholderCellClass}>
            {value || "N/A"}
          </span>
        ),
      },
      {
        key: "department",
        title: "Department",
        label: "Department",
        dataIndex: "departmentName",
        className: baseCellClass,
        render: (value: any) => (
          <span className={value ? baseCellClass : placeholderCellClass}>
            {value || "N/A"}
          </span>
        ),
      },
      {
        key: "designation",
        title: "Designation",
        label: "Designation",
        dataIndex: "designationName",
        className: baseCellClass,
        render: (value: any) => (
          <span className={value ? baseCellClass : placeholderCellClass}>
            {value || "N/A"}
          </span>
        ),
      },
      {
        key: "joiningDate",
        title: "Joining Date",
        label: "Joining Date",
        className: baseCellClass,
        render: (_: unknown, employee: IUserListItem) => (
          <span className={employee.joiningDate ? baseCellClass : placeholderCellClass}>
            {employee.joiningDate ? formatDate(employee.joiningDate) : "N/A"}
          </span>
        ),
      },
      {
        key: "employmentType",
        title: "Employment Type",
        dataIndex: "employmentTypeName",
        className: baseCellClass,
        render: (value: any) => (
          <span className={(value as string) ? baseCellClass : placeholderCellClass}>
            {(value as string) || "N/A"}
          </span>
        ),
      },
      {
        key: "aadhaar",
        title: "Aadhar",
        label: "Aadhar",
        render: (_: unknown, employee: IUserListItem) => (
          <span className={employee.aadhaarNumber ? baseCellClass : placeholderCellClass}>
            {employee.aadhaarNumber ? maskValue(employee.aadhaarNumber) : "N/A"}
          </span>
        ),
      },
      {
        key: "pan",
        title: "PAN",
        label: "PAN",
        render: (_: unknown, employee: IUserListItem) => (
          <span className={employee.panNumber ? baseCellClass : placeholderCellClass}>
            {employee.panNumber ? maskValue(employee.panNumber) : "N/A"}
          </span>
        ),
      },
      {
        key: "bankDetails",
        title: "Bank Details",
        label: "Bank Details",
        className: baseCellClass,
        render: (_: unknown, employee: IUserListItem) => {
          const bankName = employee.bankName ?? employee.bankDetails?.bankName;
          const accountNumber = employee.bankDetails?.accountNumber;
          if (bankName || accountNumber) {
            return (
              <div className="text-sm text-slate-900">
                {bankName && <div className="font-medium">{bankName}</div>}
                {accountNumber && (
                  <div className={subtleCellClass}>{maskValue(accountNumber)}</div>
                )}
              </div>
            );
          }
          return <span className={placeholderCellClass}>N/A</span>;
        },
      },
      {
        key: "reportingManager",
        title: "Reporting Manager (L1)",
        label: "Reporting Manager (L1)",
        render: (_: unknown, employee: IUserListItem) => (
          <span className={employee.reportingManagerName ? baseCellClass : placeholderCellClass}>
            {employee.reportingManagerName || "N/A"}
          </span>
        ),
      },
      {
        key: "functionalManager",
        title: "Functional Manager (L2)",
        label: "Functional Manager (L2)",
        render: (_: unknown, employee: IUserListItem) => (
          <span className={employee.functionalManagerName ? baseCellClass : placeholderCellClass}>
            {employee.functionalManagerName || "N/A"}
          </span>
        ),
      },
      {
        key: "status",
        title: "Status",
        label: "Status",
        render: (_: unknown, employee: IUserListItem) => {
          const normalizedStatus = (employee.status ?? "").trim().toLowerCase();
          const label =
            normalizedStatus.length > 0
              ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
              : "—";

          const StatusIcon = getEmployeeStatusIcon(normalizedStatus);

          return (
            <Badge variant={getEmployeeStatusVariant(normalizedStatus)} size="middle">
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
        render: (_: unknown, employee: IUserListItem) => (
          <div className="flex items-center space-x-2">
            <SimpleTooltip
              label="View"
              side="top"
              className="inline-block"
              tooltipClassName="text-xs shadow-md border-0"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.currentTarget.blur();
                  onView(employee);
                }}
                aria-label="View"
                className="relative group text-primary-600 hover:text-primary-800 transition-colors"
              >
                <Eye className="w-4 h-4 text-primary-600" aria-hidden="true" />
              </button>
            </SimpleTooltip>

            {canManage && (
              <>
                <SimpleTooltip
                  label="Edit"
                  side="top"
                  className="inline-block"
                  tooltipClassName="text-xs shadow-md border-0"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.blur();
                      onEdit(employee);
                    }}
                    aria-label="Edit"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    <SquarePen className="w-4 h-4" aria-hidden="true" />
                  </button>
                </SimpleTooltip>

                <SimpleTooltip
                  label="Delete"
                  side="top"
                  className="inline-block"
                  tooltipClassName="text-xs shadow-md border-0"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.blur();
                      onDelete(employee.id);
                    }}
                    aria-label="Delete"
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
    ];
  }, [canManage, onDelete, onEdit, onView, formatDate]);

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden">
      <ConfigurableTable
        columns={columns}
        data={employees}
        loading={loading}
        emptyMessage="No employees found"
        rowKey="id"
        spacing={0}
        configOptions={{ persistenceKey: "employee-management-table" }}
        renderColumnSelector={(selector) => (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Employees ({totalItems})</h3>
            <div className="flex items-center gap-3">
              <SimpleTooltip label="Export to Excel" side="bottom">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport();
                  }}
                  className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  aria-label="Export to Excel"
                >
                  <ExcelIcon className="w-5 h-5" />
                </button>
              </SimpleTooltip>
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

export default EmployeeTableSection;
