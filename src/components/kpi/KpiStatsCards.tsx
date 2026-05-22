import React, { memo } from "react";
import { Target, Users as UsersIcon, Cog } from "lucide-react";

interface KpiStatsCardsProps {
  totalKpis: number;
  totalUsers: number;
  usersWithKpis: number;
}

const KpiStatsCards: React.FC<KpiStatsCardsProps> = memo(({
  totalKpis,
  totalUsers,
  usersWithKpis
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg border p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary-600"/>
        </div>
        <div>
          <div className="text-xs text-slate-500">Total KPIs</div>
          <div className="text-xl font-semibold">{totalKpis}</div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
          <UsersIcon className="w-5 h-5 text-green-600"/>
        </div>
        <div>
          <div className="text-xs text-slate-500">Total Users</div>
          <div className="text-xl font-semibold">{totalUsers}</div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
          <Cog className="w-5 h-5 text-purple-600"/>
        </div>
        <div>
          <div className="text-xs text-slate-500">Users with KPIs</div>
          <div className="text-xl font-semibold">{usersWithKpis}</div>
        </div>
      </div>
    </div>
  );
});

KpiStatsCards.displayName = 'KpiStatsCards';

export default KpiStatsCards;
