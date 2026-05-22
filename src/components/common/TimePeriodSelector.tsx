import React from 'react';
import { ChevronDown } from 'lucide-react';

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  className?: string;
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  className = ''
}) => {
  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'month', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'year', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
  ];

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="appearance-none bg-white border-2 border-primary-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-slate-700 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors cursor-pointer min-w-[160px] shadow-sm"
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-primary-500" />
        </div>
      </div>
    </div>
  );
};

export default TimePeriodSelector;
