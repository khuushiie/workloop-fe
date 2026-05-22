import { Users, CheckCircle2, XCircle } from "lucide-react";
import React from "react";
import { useGetApprovalGroupStatsQuery } from "../../../../store/apis/dynamicWorkflow.api";

export function GroupStats() {

  const { data: groupStats } = useGetApprovalGroupStatsQuery();

  const stats = [
    {
      label: "Total Groups",
      value: groupStats?.data?.total || 0,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Groups",
      value: groupStats?.data?.active || 0,
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Inactive Groups",
      value: groupStats?.data?.inactive || 0,
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  // 4. Render the UI
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>

            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${stat.iconBg}`}
            >
              <Icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}