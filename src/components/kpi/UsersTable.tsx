import React, { memo } from "react";
import { Pencil, Eye, SquarePen } from "lucide-react";
import { SimpleTooltip } from "../common";

interface User {
  _id: string;
  id?: string; // Support both _id and id fields
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  workEmail?: string;
  role?: string;
  department?: string;
}

interface KpiAssignment {
  _id: string;
  userId: string;
  kpiId: string;
}

interface UsersTableProps {
  users: User[];
  assignedKpisByUser: Record<string, KpiAssignment[]>;
  kpiById: Record<string, any>;
  isAdmin: boolean;
  onEditUser: (user: User) => void;
  onViewUser: (user: User) => void;
  loading?: boolean;
}

const UsersTable: React.FC<UsersTableProps> = memo(
  ({
    users,
    assignedKpisByUser,
    kpiById,
    isAdmin,
    onEditUser,
    onViewUser,
    loading = false,
  }) => {
    return (
      <div className="bg-white rounded-lg border overflow-hidden relative">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">All Employees</h2>
        </div>
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="text-slate-600">Updating results...</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Assigned KPIs
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => {
                const userId = user._id || user.id; // Support both _id and id fields
                const userAssignments = assignedKpisByUser[userId || ""] || [];

                // Helper function to capitalize names
                const capitalizeFirstLetter = (str: string) =>
                  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

                // Generate capitalized name
                const getCapitalizedName = () => {
                  if (user.firstName && user.lastName) {
                    return `${capitalizeFirstLetter(
                      user.firstName,
                    )} ${capitalizeFirstLetter(user.lastName)}`;
                  } else if (user.firstName) {
                    return capitalizeFirstLetter(user.firstName);
                  } else if (user.lastName) {
                    return capitalizeFirstLetter(user.lastName);
                  } else if (user.username) {
                    return capitalizeFirstLetter(user.username);
                  } else {
                    return "Unknown User";
                  }
                };

                // Generate initials for avatar
                const getInitials = () => {
                  if (user.firstName && user.lastName) {
                    return `${user.firstName
                      .charAt(0)
                      .toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`;
                  } else if (user.firstName) {
                    return user.firstName.charAt(0).toUpperCase();
                  } else if (user.lastName) {
                    return user.lastName.charAt(0).toUpperCase();
                  } else if (user.username) {
                    return user.username.charAt(0).toUpperCase();
                  } else {
                    return "U";
                  }
                };

                return (
                  <tr key={userId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {getInitials()}
                        </div>
                        <span>{getCapitalizedName()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {user?.workEmail || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {userAssignments.length === 0 && (
                          <span className="text-xs text-slate-500">
                            No KPIs assigned
                          </span>
                        )}
                        {userAssignments.slice(0, 2).map((assignment: any) => {
                          const kpiId =
                            assignment.kpiId ||
                            assignment.kpi?._id ||
                            assignment.kpi;
                          const kpi = kpiById[kpiId];
                          const kpiName =
                            kpi?.name || kpi?.title || "Unknown KPI";

                          return (
                            <span
                              key={assignment._id}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700 border border-primary-200"
                              title={kpiName}
                            >
                              {kpiName}
                            </span>
                          );
                        })}
                        {userAssignments.length > 2 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            +{userAssignments.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700">
                        {user.department || "Not Assigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <SimpleTooltip
                          label="View"
                          side="top"
                          className="inline-block"
                          tooltipClassName=" text-xs shadow-soft border-0 "
                        >
                          <button
                            onClick={() => onViewUser(user)}
                            aria-label="View"
                            className="text-primary-600 hover:text-primary-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </SimpleTooltip>

                        {isAdmin && (
                          <SimpleTooltip
                            label="Edit"
                            side="top"
                            className="inline-block"
                            tooltipClassName=" text-xs shadow-soft border-0 "
                          >
                            <button
                              onClick={() => onEditUser(user)}
                              aria-label="Edit"
                              className="text-green-600 hover:text-green-800 transition-colors"
                            >
                              <SquarePen className="w-4 h-4" />
                            </button>
                          </SimpleTooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

UsersTable.displayName = "UsersTable";

export default UsersTable;
