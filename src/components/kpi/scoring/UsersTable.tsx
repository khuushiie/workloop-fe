import React from "react";
import { Eye, Send, SquarePen } from "lucide-react";
import { SimpleTooltip, ConfigurableTable } from "../../common";
import Badge from "../../common/Badge";
import SignedImage from "../../common/SignedImage";
import { TableColumn } from "../../common/Table";

interface UsersTableProps {
  users: any[];
  assignmentsMap: Record<string, any[]>;
  onView: (user: any) => void;
  onScore: (user: any) => void;
  onUserView: (user: any) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  assignmentsMap,
  onView,
  onScore,
  onUserView,
}) => {
  const columns: TableColumn<any>[] = [
    {
      key: "employee",
      title: "Employee",
      label: "Employee",
      required: true,
      render: (_: unknown, user: any) => {
        const initials = user?.firstName
          ? `${user?.firstName?.charAt(0)}`.toUpperCase()
          : user?.username?.charAt(0).toUpperCase() || "U";
        const name =
          user?.firstName && user?.lastName
            ? `${user?.firstName} ${user?.lastName}`
            : (
                user?.firstName ||
                user?.workEmail?.split("@")?.[0] ||
                "Unknown"
              ).replace(/[^a-zA-Z0-9]/g, "");

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 flex-shrink-0 rounded-full flex items-center justify-center object-cover text-white text-sm font-medium">
              {user?.profilePic ? (
                <SignedImage
                  rawUrl={user.profilePic}
                  alt="Profile Pic"
                  className="w-8 h-8 rounded-full object-cover object-center"
                />
              ) : (
                initials
              )}
            </div>
            <span className="text-sm font-medium text-slate-900 truncate ">
              {name}
            </span>
          </div>
        );
      },
    },
    {
      key: "email",
      title: "Email",
      label: "Email",
      dataIndex: "workEmail",
      render: (value: any) => (
        <span className="text-sm text-slate-600">{value || "N/A"}</span>
      ),
    },
    {
      key: "department",
      title: "Department",
      label: "Department",
      dataIndex: "department",
      render: (value: any) => (
        <Badge size="middle" variant="blue">
          {value || "Not Assigned"}
        </Badge>
      ),
    },
    {
      key: "reportingManager",
      title: "Reporting Manager",
      label: "Reporting Manager",
      render: (_: unknown, user: any) => (
        <Badge size="middle" variant="blue">
          {user?.reportingManager
            ? [
                user?.reportingManager?.firstName,
                user?.reportingManager?.lastName,
              ]
                .filter(Boolean)
                .join(" ")
            : "Not Assigned"}
        </Badge>
      ),
    },
    {
      key: "functionalManager",
      title: "Functional Manager",
      label: "Functional Manager",
      render: (_: unknown, user: any) => (
        <Badge size="middle" variant="blue">
          {user?.functionalManager
            ? [
                user?.functionalManager?.firstName,
                user?.functionalManager?.lastName,
              ]
                .filter(Boolean)
                .join(" ")
            : "Not Assigned"}
        </Badge>
      ),
    },
    {
      key: "assignedSets",
      title: "Assigned Sets",
      label: "Assigned Sets",
      render: (_: unknown, user: any) => {
        const userId = user?._id || user?.id;
        const assignments = assignmentsMap?.[userId] || [];
        if (assignments.length === 0) {
          return <span className="text-xs text-slate-500">No sets assigned</span>;
        }

        const tooltipContent = (
          <div className="p-2">
            <div className="mb-2 pb-2 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-700">
                Assigned KPIs
              </span>
            </div>
            <ul className="space-y-1">
              {assignments.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span className="text-slate-700">
                    {item?.setId?.name || "Unknown"}
                  </span>
                  <span className="ml-auto text-slate-500">
                    {item?.setId?.timeline || "N/A"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );

        const first = assignments[0];
        const remainingCount = assignments.length - 1;

        return (
          <div className="flex flex-wrap gap-1">
            <SimpleTooltip side="top" label={tooltipContent}>
              <span className="cursor-pointer inline-block">
                <Badge size="middle" variant="blue">
                  {first?.setId?.name || "Unknown"} (
                  {first?.setId?.timeline || "N/A"})
                </Badge>
              </span>
            </SimpleTooltip>
            {assignments.length > 1 && (
              <SimpleTooltip side="top" label={tooltipContent}>
                <span className="cursor-pointer inline-block">
                  <Badge variant="gray">+{remainingCount} more</Badge>
                </span>
              </SimpleTooltip>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_: unknown, user: any) => (
        <div className="flex items-center gap-0 md:gap-4">
          <SimpleTooltip
            label="View"
            side="top"
            className="inline-block"
            tooltipClassName=" text-xs shadow-soft border-0"
          >
            <button
              aria-label="View"
              onClick={() => onUserView(user)}
              className="text-primary-600 hover:text-primary-800 transition-colors"
            >
              <Eye className="w-4 h-4 text-primary-600" aria-hidden="true" />
            </button>
          </SimpleTooltip>
          <SimpleTooltip
            label="Edit"
            side="top"
            className="inline-block"
            tooltipClassName=" text-xs shadow-soft border-0"
          >
            <button
              aria-label="Edit"
              onClick={() => onScore(user)}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <SquarePen className="w-4 h-4" aria-hidden="true" />
            </button>
          </SimpleTooltip>
          <SimpleTooltip
            label="User Details"
            side="top"
            className="inline-block"
            tooltipClassName=" text-xs shadow-soft border-0"
          >
            <button
              aria-label="User Details"
              onClick={() => onView(user)}
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-soft border border-slate-200">
      <div className="p-6">
        <ConfigurableTable
          columns={columns}
          data={users}
          emptyMessage="No employees found"
          rowKey={(user) => user?._id || user?.id || Math.random().toString()}
          configOptions={{ persistenceKey: "kpi-scoring-employees" }}
          renderColumnSelector={(selector) => (
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 mb-0">Employees</h2>
              <div className="flex items-center gap-2">
                {selector}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default UsersTable;
