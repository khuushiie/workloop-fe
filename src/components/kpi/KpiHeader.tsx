import React, { memo } from "react";
import { Eye, Plus } from "lucide-react";

interface KpiHeaderProps {
  isAdmin: boolean;
  onViewKpis: () => void;
  onAddKpi: () => void;
}

const KpiHeader: React.FC<KpiHeaderProps> = memo(({
  isAdmin,
  onViewKpis,
  onAddKpi
}) => {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold">KPI Management Dashboard</h1>
        <p className="text-sm text-slate-600">Manage KPIs and assign them to team members</p>
      </div>
      <div className="flex gap-2">
        <button 
          className="inline-flex items-center gap-2 px-3 py-2 border rounded text-slate-700" 
          onClick={onViewKpis}
        >
          <Eye className="w-4 h-4"/> View KPIs
        </button>
        {isAdmin && (
          <button 
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded" 
            onClick={onAddKpi}
          >
            <Plus className="w-4 h-4"/> Add KPIs
          </button>
        )}
      </div>
    </div>
  );
});

KpiHeader.displayName = 'KpiHeader';

export default KpiHeader;
