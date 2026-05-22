import React, { useMemo } from 'react';
import { X, Calendar, Layers, AlertCircle, Info } from 'lucide-react';
import { Button, SimpleTooltip } from '../../common';
import { KpiTimeline, type IKpiResponseV2 } from '../../../types/kpi.api.types';
import type { KpiSetRow } from '../KpiAssignment.types';
import type { IUserListItem } from '../../../types/user.api.types';

interface ViewUserSetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUserListItem | null;
  sets: KpiSetRow[];
  selectedSets: Set<string>;
}

const ViewUserSetsModal: React.FC<ViewUserSetsModalProps> = ({
  isOpen,
  onClose,
  user,
  sets,
  selectedSets,
}) => {

  // Filter the full list of sets to find only the ones currently assigned
  const assignedSetsDetails = useMemo(() => {
    return sets?.filter((set) => selectedSets?.has(set.id));
  }, [sets, selectedSets]);

  if (!isOpen || !user) return null;

  const userName = user?.fullName;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-all" style={{marginTop: 0}}>
      <div className="bg-white rounded-xl shadow-soft-hover max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-2 py-4
         border-b border-slate-100 bg-slate-50/50">
          <div> 
            <h2 className="text-xl font-bold text-slate-800 mb-0">Assigned Sets</h2>
            <p className="text-sm text-slate-500 mt-0.5 mb-0">Viewing configuration for <span className="font-medium text-primary-600">{userName}</span></p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 bg-slate-50/30 py-3">
          {assignedSetsDetails?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No Active Sets</h3>
              <p className="text-slate-500 max-w-xs mt-2">
                There are currently no KPI sets assigned to this user.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {assignedSetsDetails?.map((set) => (
                <div
                  key={set.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-slate-800 line-clamp-1" title={set.name}>
                      {set.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider
                      ${set.timeline === KpiTimeline.WEEKLY ? 'bg-green-100 text-green-700' : 
                        set.timeline === KpiTimeline.MONTHLY ? 'bg-primary-100 text-primary-700' : 
                        'bg-purple-100 text-purple-700'}`}
                    >
                      {set.timeline}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* KPI Count */}
                    <div className="flex items-center text-xs text-slate-500">
                      <Layers className="w-3.5 h-3.5 mr-2" />
                      <span>{set.kpis?.length || 0} KPIs included</span>
                    </div>
                    
                    {/* Date/Info Placeholder (Optional) */}
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 mr-2" />
                      <span>Active Assignment</span>
                    </div>
                  </div>
                  
                  {/* Quick KPI Preview (Optional - show first 2 names) */}
                  {set.kpis && set.kpis.length > 0 && (
                     <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">Includes:</p>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {set.kpis?.map((k: IKpiResponseV2, i: number) => (
                            <span className='flex items-center'>
                            <li key={i} className="truncate">• {k.name}</li>
                            <SimpleTooltip
                              key={i}
                              label={
                                <div className="text-xs max-w-[200px]">
                                  <p className="font-semibold mb-1 text-justify border-b border-slate-500/30 pb-1">
                                    {k?.name}
                                  </p>
                                  <p className="text-slate-500 text-justify">
                                    {k?.description}
                                  </p>
                                </div>
                              }
                              side="top"
                            >
                              <span className="flex self-center cursor-pointer flex-shrink-0 ml-1" style={{marginTop: '2px'}}>
                                <Info size={10} className="w-3 h-3 text-slate-400" />
                              </span>
                            </SimpleTooltip>
                            </span>
                          ))}
                        </ul>
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Footer --- */}
        <div className="p-3 pr-4 border-t border-slate-100 bg-white flex justify-end">
          <Button
            onClick={onClose}
            appearance='secondary'
            size="large"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserSetsModal;