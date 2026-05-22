import React, { useState, useCallback } from 'react';
import { Info, X } from 'lucide-react';
import { SimpleTooltip } from '../../common';
import type { KpiSetRow } from '../KpiAssignment.types';
import type { IUserListItem } from '../../../types/user.api.types';
import type { IKpiResponseV2 } from '../../../types/kpi.api.types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (setIds: string[]) => void;
  user: IUserListItem | null;
  sets: KpiSetRow[];
  selectedSets: Set<string>;
  onSetToggle: (setId: string) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  sets,
  selectedSets,
  onSetToggle
}) => {
  const handleSubmit = useCallback(() => {
    onSubmit(Array.from(selectedSets));
  }, [selectedSets, onSubmit]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{marginTop: 0}}>
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Edit Sets for {user?.fullName}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 text-xs sm:text-sm text-slate-600">
            Select the KPI sets you want to assign to{' '}
            <span className="font-medium">{user?.fullName}</span>.
            Existing assignments will be replaced with your current selection.
          </div>
          <div className="border border-slate-300 rounded-lg max-h-[60vh] overflow-y-auto">
            {sets.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No sets available to assign.</p>
            ) : (
              <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                {sets.map((set) => (
                  <div
                    key={set.id}
                    className="border border-slate-100 rounded-lg w-full hover:border-primary-200 transition duration-150"
                  >
                    <label
                      className="flex-col items-center justify-between gap-3 p-3 cursor-pointer"
                    >
                      <div className='flex justify-between items-center px-3 pb-2'>
                        <div className='flex items-start gap-3'>
                          <input
                            type="checkbox"
                            checked={selectedSets.has(set.id)}
                            onChange={() => onSetToggle(set.id)}
                            className="w-3 h-3 sm:w-4 sm:h-4 mt-1 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 flex-shrink-0"
                          />
                          <div className="flex flex-col gap-2">
                            
                            <span className="text-xs sm:text-sm font-medium whitespace-nowrap text-slate-900 max-w-64 truncate overflow-hidden">{set?.name}</span>
                              <div className="flex items-center">
                                <span className="text-xs bg-primary-100 text-primary-800 px-1 py-0.5 md:px-2 md:py-1 rounded-full">
                                {set?.timeline}
                              </span>
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                {set?.kpis?.length || 0} KPI{set?.kpis?.length !== 1 ? 's' : ''}
                              </span>
                              </div>
                          </div>
                        </div>

                      {selectedSets.has(set.id) && (
                        <span 
                          className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full whitespace-nowrap self-start"
                        >
                          Selected
                        </span>
                      )}
                      </div>
                      {set.kpis && set.kpis.length > 0 && (
                      <div className="px-3 border-t border-slate-100">
                        <ul className="text-xs mt-2 mb-0 text-slate-600 space-y-1 mt-3">
                          {set.kpis?.map((k: IKpiResponseV2, i: number) => (
                            <span className='flex items-center'>
                              <li className="truncate">
                                <span className="text-slate-400 mr-1">•</span>
                                {k.name}
                              </li>
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
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 px-6 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm md:text-base text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm md:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Save Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
