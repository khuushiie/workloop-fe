/**
 * Pending/Not Started Tab - V2 Backend
 * Columns: Employee Name + ID | Reporting Manager | Functional Manager | Start Time
 */

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { Bell } from 'lucide-react';
import Table, { TableColumn } from '../../../common/Table';
import Button from '../../../common/Button';
import Pagination from '../../../common/Pagination';
import AlertModal from '../../../common/AlertModal';
import TabSelector from '../../../employee-service/component/TabSelector';
import { PendingResponse, PendingSubTabKey } from '../types';
import Badge from '../../../common/Badge';
import { formatDate } from '../../../../utils/timeUtils';
import { useGetPendingResponsesQuery } from '../../../../store/apis/survey.api';
import { setPage, setLimit } from '../../../../store/slices/surveySlice';

import { TimesheetManagementSkeleton } from '../../../timesheet/Skeleton';

interface PendingNotStartedTabProps {
  surveyId: string;
  pendingCount: number;
  notStartedCount: number;
  search?: string;
}

const PendingNotStartedTab: React.FC<PendingNotStartedTabProps> = ({
  surveyId,
  pendingCount,
  notStartedCount,
  search = '',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { page, limit } = useSelector((state: RootState) => state.survey);

  const [activeSubTab, setActiveSubTab] = useState<PendingSubTabKey>('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });
  const { data, isLoading } = useGetPendingResponsesQuery({
    surveyId,
    tab: activeSubTab,
    search: search || undefined,
    page,
    pageSize: limit,
  });

  const responses = data?.data ?? [];
  const totalResponses = data?.pagination?.total ?? 0;

  const subTabs: { k: PendingSubTabKey; label: string }[] = [
    { k: 'pending', label: `Pending (${pendingCount})` },
    { k: 'not_started', label: `Not Started (${notStartedCount})` },
  ];

  useEffect(() => {
    setSelectedIds([]);
    dispatch(setPage(1));
  }, [activeSubTab, dispatch]);

  const handleBulkSendReminder = useCallback(() => {
    setAlertConfig({
      title: 'Feature In Development',
      message: 'The Bulk Send Reminder feature is currently under development.',
      type: 'info',
    });
    setAlertOpen(true);
  }, []);

  const columns: TableColumn<PendingResponse>[] = [
    {
      key: 'employee',
      title: 'Employee Name',
      label: 'Employee Name',
      required: true,
      width: '25%',
      render: (_: unknown, record: PendingResponse) => (
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
      width: '22%',
      render: (_: any, record: PendingResponse) => (
        <span className="text-sm text-slate-900">{record.reportingManager.trim() || 'N/A'}</span>
      ),
    },
    {
      key: 'functionalManager',
      title: 'Functional Manager',
      label: 'Functional Manager',
      width: '22%',
      render: (_: any, record: PendingResponse) => (
        <span className="text-sm text-slate-900">{record.functionalManager.trim() || 'N/A'}</span>
      ),
    },
    {
      key: 'startTime',
      title: 'Start Time',
      label: 'Start Time',
      width: '21%',
      render: (_: unknown, record: PendingResponse) => (
        record.startTime ? (
          <span className="text-sm text-slate-900">{formatDate(record.startTime)}</span>
        ) : (
          <Badge variant="red" size="small">Not Started</Badge>
        )
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <TabSelector
          tabs={subTabs}
          active={activeSubTab}
          onChange={(key) => setActiveSubTab(key)}
        />

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Button
            appearance="primary"
            size="small"
            onClick={handleBulkSendReminder}
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Send Reminder ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <ConfigurableTable<PendingResponse>
          columns={columns}
          data={responses}
          loading={isLoading}
          skeleton={<TimesheetManagementSkeleton rows={limit || 5} />}
          rowKey="id"
          emptyMessage={
            activeSubTab === 'pending'
              ? 'No pending responses found'
              : 'No employees have started the survey yet'
          }
          configOptions={{ persistenceKey: `survey-pending-responses-${surveyId}` }}
        />
      </div>

      {/* Pagination */}
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

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
};

export default PendingNotStartedTab;
