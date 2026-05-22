

import React from "react";
import { Building2, CheckCircle, XCircle } from "lucide-react";

export interface IOrganizationStats {
  total: number;
  active: number;
  inactive: number;
}

const cards = [
  {
    key: "total" as const,
    label: "Total Organizations",
    color: "bg-primary-500",
    icon: Building2,
  },
  {
    key: "active" as const,
    label: "Active Organizations",
    color: "bg-green-500",
    icon: CheckCircle,
  },
  {
    key: "inactive" as const,
    label: "Inactive Organizations",
    color: "bg-red-500",
    icon: XCircle,
  },
];

interface OrganizationStatsCardsProps {
  stats: IOrganizationStats;
}

const OrganizationStatsCards: React.FC<OrganizationStatsCardsProps> = ({
  stats,
}) => (
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
                {stats[card.key] || 0}
              </p>
            </div>

            {/* ICON */}
            <div
              className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0 transition-transform duration-300`}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>

          </div>
        </div>
      );
    })}
  </div>
);

export default OrganizationStatsCards;