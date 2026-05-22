import React, { useMemo } from "react";
import { SquarePen } from "lucide-react";
import { SimpleTooltip, ConfigurableTable, Pagination } from "../../common";
import { scrollToTop } from "../../survey/hooks";
import { TableColumn } from "../../common/Table";

export interface RoleUserRow {
  id: string;
  name?: string | null;
  username?: string | null;
  workEmail?: string | null;
  employeeId?: string | null;
  department?: string | null;
  role?: string | null;
  roleId?: string | null;
  functionalManagerName?: string | null;
  reportingManagerName?: string | null;
}

interface UserRoleTableSectionProps {
  users: RoleUserRow[];
  loading?: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onEditUser?: (user: RoleUserRow) => void;
}

const UserRoleTableSection: React.FC<UserRoleTableSectionProps> = ({
  users,
  loading = false,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onEditUser,
}) => {
  const columns = useMemo<TableColumn<RoleUserRow>[]>(() => {
    const baseCellClass = "text-sm text-slate-900";
    const placeholderCellClass = "text-sm text-slate-400";

    return [
      {
        key: "employee",
        title: "Employee Name",
        required: true,
        render: (_: any, user: RoleUserRow) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-600">
                {(
                  user.name?.charAt(0) ||
                  user.workEmail?.charAt(0) ||
                  user.username?.charAt(0) ||
                  "?"
                ).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {user.name ||
                  user.workEmail?.split("@")[0] ||
                  user.username ||
                  "Unknown"}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "Employee ID",
        title: "Employee ID",
        required: true,
        render: (_: any, user: RoleUserRow) => (
          <span
            className={user.employeeId ? baseCellClass : placeholderCellClass}
          >
            {user.employeeId || "Not assigned"}
          </span>
        ),
      },
      {
        key: "department",
        title: "Department",
        dataIndex: "department",
        className: baseCellClass,
        render: (value: any) => (
          <span className={value ? baseCellClass : placeholderCellClass}>
            {value || "N/A"}
          </span>
        ),
      },
      {
        key: "role",
        title: "Role",
        dataIndex: "role",
        className: baseCellClass,
        render: (value: any) => (
          <span className={value ? baseCellClass : placeholderCellClass}>
            {value || "Not assigned"}
          </span>
        ),
      },
      {
        key: "reportingManagerName",
        title: "Reporting Manager",
        render: (_: any, user: RoleUserRow) => (
          <span
            className={
              user.reportingManagerName ? baseCellClass : placeholderCellClass
            }
          >
            {user.reportingManagerName || "Not assigned"}
          </span>
        ),
      },
      {
        key: "functionalManagerName",
        title: "Functional Manager",
        render: (_: any, user: RoleUserRow) => (
          <span
            className={
              user.functionalManagerName ? baseCellClass : placeholderCellClass
            }
          >
            {user.functionalManagerName || "Not assigned"}
          </span>
        ),
      },
      ...(onEditUser
        ? ([
          {
            key: "actions",
            title: "Actions",
            required: true,
            render: (_: any, user: RoleUserRow) => (
              <div className="flex items-center space-x-2">
                <SimpleTooltip
                  label="Edit"
                  side="top"
                  className="inline-block"
                  tooltipClassName=" text-xs shadow-md border-0"
                >
                  <button
                    type="button"
                    aria-label="Edit"
                    onClick={(e) => {
                      scrollToTop('smooth');
                      e.stopPropagation();
                      onEditUser(user);
                    }}
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    <SquarePen className="w-4 h-4" aria-hidden="true" />
                  </button>
                </SimpleTooltip>
              </div>

            ),
          } as TableColumn<RoleUserRow>,
        ] satisfies TableColumn<RoleUserRow>[])
        : []),
    ];
  }, [onEditUser]);

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 flex flex-col">
      <ConfigurableTable<RoleUserRow>
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        rowKey="id"
        configOptions={{ persistenceKey: "access-rights-user-table" }}
        renderColumnSelector={(selector) => (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Users ({totalItems})
            </h3>
            {selector}
          </div>
        )}
      />
      {!!totalItems && (
        <div className="px-6 py-4 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            itemsPerPageOptions={[5, 10, 20, 50, 100]}
          />
        </div>
      )}
    </div>
  );
};

export default UserRoleTableSection;
