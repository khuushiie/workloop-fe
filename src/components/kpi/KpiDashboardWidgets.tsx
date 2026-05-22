import React from "react";

type Props = { featureEnabled: boolean };

const KpiDashboardWidgets: React.FC<Props> = ({ featureEnabled }) => {
  if (!featureEnabled) return null;
  return (
    <div className="p-4 grid gap-4 md:grid-cols-2">
      <div className="bg-white rounded-lg shadow-soft p-4">KPI Scorecard (coming soon)</div>
      <div className="bg-white rounded-lg shadow-soft p-4">Weekly Leaderboard (coming soon)</div>
      <div className="bg-white rounded-lg shadow-soft p-4">Achievements (coming soon)</div>
    </div>
  );
};

export default KpiDashboardWidgets;

