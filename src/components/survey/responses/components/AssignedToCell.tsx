
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, Briefcase, Award, Building2 } from 'lucide-react';
import { AssignedToInfo, AssignedToType } from '../types';
import { SimpleTooltip } from '../../../common';

interface AssignedToCellProps {
  surveyId: string;
  assignedTo: AssignedToInfo;
}

const MAX_VISIBLE = 2;

const ICONS: Record<AssignedToType, React.ReactNode> = {
  individual: <Users className="w-4 h-4 text-primary-500" />,
  role: <Briefcase className="w-4 h-4 text-purple-500" />,
  designation: <Award className="w-4 h-4 text-amber-500" />,
  department: <Building2 className="w-4 h-4 text-green-500" />,
};

const LABELS: Record<AssignedToType, string> = {
  individual: 'Individuals',
  role: 'Roles',
  designation: 'Designations',
  department: 'Departments',
};

const AssignedToCell: React.FC<AssignedToCellProps> = ({ assignedTo }) => {
  const { type, entities, totalCount } = assignedTo;

  const getDisplayText = () => {
    // Show up to 2 names, then add ellipsis if more exist
    const names = entities.slice(0, 2).map(e => e.name);
    let text = names.join(', ');

    if (entities.length > 2 || totalCount > 2) {
      text += '...';
    }

    return text || 'N/A';
  };

  return (
    <div className="flex items-center gap-2 max-w-full">
      <div className="flex-shrink-0">
        {ICONS[type] || <Users className="w-3.5 h-3.5 text-slate-400" />}
      </div>
      <SimpleTooltip
        closeOnScroll={false}
        tooltipClassName={`${assignedTo.entities.length > 2 || assignedTo.totalCount > 2 ? 'mt-2' : 'hidden'}`}
        delay={150}
        side="top"
        label={
          <div className="max-w-xs p-2">
            <div className="text-xs font-medium text-slate-500 mb-2">
              Assigned Users ({entities.length})
            </div>

            <div className="flex flex-col gap-[2px] max-h-48 overflow-y-auto pr-1">
              {entities.map((e, i) => (
                <div
                  key={i}
                  className="text-sm text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
                >
                  {e.name}
                </div>
              ))}
            </div>
          </div>
        }
      >
        <span
          className="text-sm text-slate-700 truncate font-normal"
        >
          {getDisplayText()}
        </span>
      </SimpleTooltip>
      {totalCount > 0 && (
        <span className="text-xs text-slate-400 font-medium">
          ({totalCount})
        </span>
      )}
    </div>
  );
};

export default AssignedToCell;
