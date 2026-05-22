import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface PeriodNavigatorProps {
	label: string;
	canGoNext: boolean;
	onPrev: () => void;
	onNext: () => void;
}

const PeriodNavigator: React.FC<PeriodNavigatorProps> = ({ label, canGoNext, onPrev, onNext }) => {
	return (
		<div className="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
			<div className="flex items-center gap-2">
				<Calendar className="w-5 h-5 text-slate-600" />
				<span className="text-sm font-semibold text-slate-700">Period:</span>
			</div>
			<div className="flex items-center md:gap-4">
				<button onClick={onPrev} className="p-2 text-slate-600 hover:text-slate-800">
					<ChevronLeft className="w-5 h-5" />
				</button>
				<span className="text-xs md:text-sm font-medium text-slate-900 whitespace-nowrap text-center">{label}</span>
				<button onClick={onNext} disabled={canGoNext === false} className="p-2 text-slate-600 hover:text-slate-800 disabled:opacity-50">
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
};

export default PeriodNavigator;


