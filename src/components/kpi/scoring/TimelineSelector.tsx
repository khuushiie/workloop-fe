import React from 'react';
import { TimelineType } from './types';
import { KPI_TIMELINE_VALUES } from '../../../types/kpi.api.types';

interface TimelineSelectorProps {
	selected: TimelineType;
	onChange: (value: TimelineType) => void;
	activeTab: "current" | "history";
	onTabChange: (tab: "current" | "history") => void;
}

const TimelineSelector: React.FC<TimelineSelectorProps> = ({ selected, onChange, activeTab, onTabChange }) => {
	return (
		<div className="px-6 py-3 border-b border-slate-200 bg-primary-50">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div className="flex flex-col md:flex-row md:items-center gap-4">
					<span className="text-xs md:text-sm font-medium whitespace-nowrap text-slate-700">Select Period Type:</span>
					<div className="flex gap-2 overflow-y-auto">
						{KPI_TIMELINE_VALUES.map((t) => (
							<button
								key={t}
								onClick={() => onChange(t)}
								className={`px-4 py-2 rounded-md text-xs md:text-sm font-medium ${
									selected === t
										? 'bg-primary-600 text-white'
										: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
								}`}
							>
								{t.charAt(0) + t.slice(1).toLowerCase()}
							</button>
						))}
					</div>
				</div>
				
				<div className="flex border-b border-slate-300">
					<button
						onClick={() => onTabChange("current")}
						className={`px-4 py-2 text-xs md:text-sm font-medium border-b-2 transition-colors ${
							activeTab === "current"
								? "border-primary-600 text-primary-600"
								: "border-transparent text-slate-600 hover:text-slate-800"
						}`}
					>
						Current
					</button>
					<button
						onClick={() => onTabChange("history")}
						className={`px-4 py-2 text-xs md:text-sm font-medium border-b-2 transition-colors ${
							activeTab === "history"
								? "border-primary-600 text-primary-600"
								: "border-transparent text-slate-600 hover:text-slate-800"
						}`}
					>
						History
					</button>
				</div>
			</div>
		</div>
	);
};

export default TimelineSelector;


