import { Eye } from 'lucide-react';
import { ConfigurableTable } from '../../../common';
import { TableColumn } from '../../../common/Table';
import Badge from '../../../common/Badge';
import AssignedToCell from './AssignedToCell';
import { SurveyResponseSummary, SurveyStatus } from '../types';
import type { BadgeProps } from '../../../common/Badge';
import { formatDate } from '../../../../utils/timeUtils';
import SimpleTooltip from '../../../common/SimpleTooltip';

import { TimesheetManagementSkeleton } from '../../../timesheet/Skeleton';

interface ResponsesTableProps {
  data: SurveyResponseSummary[];
  loading?: boolean;
  onViewInsights?: (survey: SurveyResponseSummary) => void;
  renderColumnSelector?: (selector: React.ReactNode) => React.ReactNode;
}

const getStatusBadgeVariant = (status: SurveyStatus): BadgeProps['variant'] => {
  return status === 'active' ? 'green' : 'gray';
};

const ResponsesTable: React.FC<ResponsesTableProps> = ({
  data,
  loading = false,
  onViewInsights,
  renderColumnSelector,
}) => {
  const columns: TableColumn<SurveyResponseSummary>[] = [
    {
      key: 'title',
      title: 'Survey Title',
      label: 'Survey Title',
      required: true,
      dataIndex: 'title',
      width: '28%',
      render: (value: any, record: SurveyResponseSummary) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">
            {value}
          </span>
          <span className="text-xs text-slate-500">
            {formatDate(record.startDate)} - {formatDate(record.endDate)}
          </span>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      title: 'Assigned To',
      label: 'Assignee',
      width: '18%',
      render: (_: unknown, record: SurveyResponseSummary) => (
        <AssignedToCell surveyId={record.id} assignedTo={record.assignedTo} />
      ),
    },
    {
      key: 'status',
      title: 'Status',
      label: 'Status',
      width: '10%',
      align: 'center',
      render: (_: unknown, record: SurveyResponseSummary) => (
        <Badge variant={getStatusBadgeVariant(record.status)} size="middle" className="capitalize">
          {record.status}
        </Badge>
      ),
    },
    {
      key: 'responsesProgress',
      title: 'Responses Progress',
      label: 'Progress',
      width: '30%',
      render: (_: unknown, record: SurveyResponseSummary) => {
        const completionPercent = record.total > 0
          ? Math.round((record.completed / record.total) * 100)
          : 0;

        return (
          <div className="space-y-1.5 ">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-100  rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600 w-10 text-right">
                {completionPercent}%
              </span>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-green-600">
                <span className="font-medium">{record.completed}</span> completed
              </span>
              <span className="text-amber-600">
                <span className="font-medium">{record.pending}</span> pending
              </span>
              <span className="text-slate-500">
                <span className="font-medium">{record.notStarted}</span> not started
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'action',
      title: 'Action',
      label: 'Actions',
      required: true,
      width: '14%',
      align: 'center',
      render: (_: unknown, record: SurveyResponseSummary) => (
        <SimpleTooltip label="View Insights" side="top">
          <button onClick={() => onViewInsights?.(record)} className="text-primary-600 hover:text-primary-800 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </SimpleTooltip>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <ConfigurableTable<SurveyResponseSummary>
        columns={columns}
        data={data}
        loading={loading}
        skeleton={<TimesheetManagementSkeleton rows={5} />}
        rowKey="id"
        emptyMessage="No surveys found"
        configOptions={{ persistenceKey: 'survey-responses-table' }}
        renderColumnSelector={renderColumnSelector}
      />
    </div>
  );
};

export default ResponsesTable;
