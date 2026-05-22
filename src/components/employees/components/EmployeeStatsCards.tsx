import React from "react";
import { Users } from "lucide-react";

export interface EmployeeStats {
  total: number;
  active: number;
  departments: number;
  newThisMonth: number;
}

const cards = [
  {
    key: "total" as const,
    label: "Total Employees",
    color: "bg-primary-500",
    description: "All registered employees",
  },
  {
    key: "active" as const,
    label: "Active Employees",
    color: "bg-green-500",
    description: "Currently employed",
  },
  {
    key: "departments" as const,
    label: "Departments",
    color: "bg-purple-500",
    description: "Active departments",
  },
  {
    key: "newThisMonth" as const,
    label: "New This Month",
    color: "bg-orange-500",
    description: "Recently joined",
  },
];

interface EmployeeStatsCardsProps {
  stats: EmployeeStats;
}

const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
    {cards.map((card) => (
      <div
        key={card.key}
        className="bg-white rounded-xl shadow-soft border border-slate-100 p-4 sm:p-5 lg:p-6 transition-all duration-300 group"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between h-full">
          <div className="flex-1 min-w-0 mb-3 sm:mb-0 pr-2 card-content">
            <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2 leading-tight card-title">
              {card.label}
            </p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 sm:mb-3 leading-tight card-value">
              {stats[card.key]}
            </p>
            <p className="text-xs text-slate-500">{card.description}</p>
          </div>
          <div
            className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}
          >
            <Users className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default EmployeeStatsCards;

