import React from "react";

const SummaryStatsBanner: React.FC = () => (
  <div className="space-y-6">
    {/* Header - aligned similar to Employee Management hero (without action buttons) */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Access Right Management
        </h1>
      </div>
      {/* Intentionally no action buttons here to match requirement */}
    </div>
  </div>
);

export default SummaryStatsBanner;
