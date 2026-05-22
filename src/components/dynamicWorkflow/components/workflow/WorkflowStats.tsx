import { Users, CheckCircle2, XCircle, Package } from "lucide-react";
import { IWorkflowStats } from "../../../../store/apis/dynamicWorkflow.api";
import { MODULES } from "../../../../utils/dynamicworkflow/constants";

interface IStat {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

interface WorkflowStatsProps {
  stats?: IWorkflowStats;
}

export function WorkflowStats({ stats }: Readonly<WorkflowStatsProps>) {
  

  const statItems: IStat[] = [
  {
    label: "Total Workflows",
    value: stats?.total_workflows || 0,
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Active Workflows",
    value: stats?.active || 0,
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Inactive Workflows",
    value: stats?.inactive || 0,
    icon: XCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    label: "Workflow Modules",
    value: Object.keys(MODULES).length || 0,
    icon: Package,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => {
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