/**
 * Completed Responses Tab - V2 Backend
 * Columns: Employee Name + ID | Reporting Manager | Functional Manager | Submitted On | Action
 */

import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { Eye } from 'lucide-react';
import Table, { TableColumn } from '../../../common/Table';
import Pagination from '../../../common/Pagination';
import ViewResponseModal from './ViewResponseModal';

import { CompletedResponse } from '../types';
import { formatDate } from "../../../../utils/timeUtils";

// RTK Query
import { useGetCompletedResponsesQuery } from '../../../../store/apis/survey.api';
import { setPage, setLimit } from '../../../../store/slices/surveySlice';
import SimpleTooltip from '../../../common/SimpleTooltip';

import { TimesheetManagementSkeleton } from '../../../timesheet/Skeleton';

interface CompletedResponsesTabProps {
  surveyId: string;
  search?: string;
}

const CompletedResponsesTab: React.FC<CompletedResponsesTabProps> = ({ surveyId, search = '' }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { page, limit } = useSelector((state: RootState) => state.survey);

  const [selectedResponse, setSelectedResponse] = useState<CompletedResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useGetCompletedResponsesQuery({
    surveyId,
    search: search || undefined,
    page,
    pageSize: limit,
  });

  const responses = data?.data ?? [];
  const totalResponses = data?.pagination?.total ?? 0;

  const handleViewResponse = useCallback((response: CompletedResponse) => {
    setSelectedResponse(response);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedResponse(null);
  }, []);

  const columns: TableColumn<CompletedResponse>[] = [
    {
      key: 'employee',
      title: 'Employee Name',
      label: 'Employee Name',
      required: true,
      width: '25%',
      render: (_: unknown, record: CompletedResponse) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-primary-600">
              {record.employee.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900 truncate">{record.employee.name}</span>
            <span className="text-xs text-slate-500">{record.employee.employeeCode || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'reportingManager',
      title: 'Reporting Manager',
      label: 'Reporting Manager',
      width: '20%',
      render: (_: any, record: CompletedResponse) => (
        <span className="text-sm text-slate-900">{record.reportingManager.trim() || 'N/A'}</span>
      ),
    },
    {
      key: 'functionalManager',
      title: 'Functional Manager',
      label: 'Functional Manager',
      width: '20%',
      render: (_: any, record: CompletedResponse) => (
        <span className="text-sm text-slate-900">{record.functionalManager.trim() || 'N/A'}</span>
      ),
    },
    {
      key: 'submittedOn',
      title: 'Submitted On',
      label: 'Submission Date',
      width: '20%',
      render: (_: unknown, record: CompletedResponse) => (
        <div className="flex flex-col">
          <span className="text-sm text-slate-900">
            {record.submittedDate ? formatDate(record.submittedDate) : 'N/A'}
          </span>
          {record.submittedTime && (
            <span className="text-xs text-slate-500">{record.submittedTime}</span>
          )}
        </div>
      ),
    },
    {
      key: 'action',
      title: 'Action',
      label: 'Actions',
      required: true,
      width: '15%',
      align: 'center',
      render: (_: unknown, record: CompletedResponse) => (
        <SimpleTooltip label="View Response" side="top">
          <button onClick={() => handleViewResponse(record)} className="text-primary-600 hover:text-primary-800 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </SimpleTooltip>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <ConfigurableTable<CompletedResponse>
          columns={columns}
          data={responses}
          loading={isLoading}
          skeleton={<TimesheetManagementSkeleton rows={limit || 5} />}
          rowKey="id"
          emptyMessage="No completed responses found"
          configOptions={{ persistenceKey: `survey-completed-responses-${surveyId}` }}
        />
      </div>

      {totalResponses > 0 && (
        <div className="flex items-center justify-between">
          <Pagination
            currentPage={page}
            totalItems={totalResponses}
            itemsPerPage={limit}
            onPageChange={(newPage) => dispatch(setPage(newPage))}
            onItemsPerPageChange={(newLimit) => dispatch(setLimit(newLimit))}
          />
        </div>
      )}

      {selectedResponse && (
        <ViewResponseModal
          responseId={selectedResponse.responseId}
          isOpen={modalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CompletedResponsesTab;
