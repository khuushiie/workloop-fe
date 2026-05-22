import React from "react";
import { Layers, CheckCircle, Briefcase, TrendingUp } from "lucide-react";
import { ProjectStats } from "../../services/api";

const cards = [
  {
    key: "totalProjects" as const,
    label: "Total Active Projects",
    color: "bg-primary-500",
    icon: Layers,
  },
  {
    key: "currentProjects" as const,
    label: "Current Projects",
    color: "bg-green-500",
    icon: Briefcase,
  },
  {
    key: "completedProjects" as const,
    label: "Completed Projects",
    color: "bg-purple-500",
    icon: CheckCircle,
  },
  {
    key: "billableProjects" as const,
    label: "Billable Projects",
    color: "bg-orange-500",
    icon: TrendingUp,
  },
];

interface ProjectStatsCardsProps {
  stats: ProjectStats;
}

const ProjectStatsCards: React.FC<ProjectStatsCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">

    {cards.map((card) => {
      const Icon = card.icon;

      return (
        <div
          key={card.key}
          className="bg-white rounded-xl shadow-soft border border-slate-200 p-4 sm:p-5 lg:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between h-full">
            
            {/* LEFT TEXT */}
            <div className="flex-1 min-w-0 mb-3 sm:mb-0 pr-2">
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2 leading-tight">
                {card.label}
              </p>

              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {stats[card.key]}
              </p>
            </div>

            {/* ICON */}
            <div
              className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0
              group-hover:scale-105 transition-transform duration-300`}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>

          </div>
        </div>
      );
    })}
  </div>
);

export default ProjectStatsCards;