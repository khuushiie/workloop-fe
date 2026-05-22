import React from 'react';
import { Eye, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { ConfigurableTable } from '../../../common';
import { TableColumn } from '../../../common/Table';
import Pagination from '../../../common/Pagination';
import Badge from '../../../common/Badge';
import { PublishedSurvey, PaginationData } from '../types';
import { cn } from '../../../../utils/cn';
import SimpleTooltip from '../../../common/SimpleTooltip';
import { formatDate } from "../../../../utils/timeUtils";

import { TimesheetManagementSkeleton } from '../../../timesheet/Skeleton';

interface PublishedSurveysAccordionProps {
  isOpen: boolean;
  surveys: PublishedSurvey[];
  loading: boolean;
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onView: (survey: PublishedSurvey) => void;
  onToggleStatus: (survey: PublishedSurvey) => void;
  onDelete: (survey: PublishedSurvey) => void;
  hideHeader?: boolean;
}

const baseCellClass = "text-sm text-slate-900";
const placeholderCellClass = "text-sm text-slate-800";

const PublishedSurveysAccordion: React.FC<PublishedSurveysAccordionProps> = ({
  surveys,
  loading,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  onView,
  onToggleStatus,
  onDelete,
}) => {
  const columns: TableColumn<PublishedSurvey>[] = [
    {
      key: 'title',
      title: 'Survey Title',
      label: 'Title',
      required: true,
      width: '28%',
      render: (_, record) => (
        <SimpleTooltip label={record.title} side="top" tooltipClassName={`${record.title.length > 24 ? '' : 'hidden'}`}>
          <div className="text-sm font-medium text-slate-900 truncate max-w-xs">
            {record.title}
          </div>
        </SimpleTooltip>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      label: 'Status',
      align: 'center',
      render: (_, record) => (
        <Badge variant={record.isActive ? "green" : "gray"} size="middle">
          {record.isActive ? 'Published' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'startDate',
      title: 'Start Date',
      label: 'Start Date',
      render: (_, record) => (
        <span className={record.startDate ? baseCellClass : placeholderCellClass}>
          {record.startDate ? formatDate(record.startDate) : "N/A"}
        </span>
      ),
    },
    {
      key: 'endDate',
      title: 'End Date',
      label: 'End Date',
      render: (_, record) => (
        <span className={record.endDate ? baseCellClass : placeholderCellClass}>
          {record.endDate ? formatDate(record.endDate) : "N/A"}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      label: 'Created On',
      render: (_, record) => (
        <span className={record.createdAt ? baseCellClass : placeholderCellClass}>
          {record.createdAt ? formatDate(record.createdAt) : "N/A"}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      label: 'Actions',
      required: true,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center space-x-2">
          <SimpleTooltip label="View" side="top">
            <button onClick={() => onView(record)} className="text-primary-600 hover:text-primary-800 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip label={record.isActive ? "Deactivate" : "Activate"} side="top">
            <button onClick={() => onToggleStatus(record)} className={cn(
              "transition-colors",
              record.isActive ? "text-green-600 hover:text-green-800" : "text-slate-400 hover:text-slate-500"
            )}>
              {record.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
          </SimpleTooltip>

          <SimpleTooltip label="Delete" side="top">
            <button onClick={() => onDelete(record)} className="text-red-600 hover:text-red-800 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
      <ConfigurableTable
        columns={columns}
        data={surveys}
        loading={loading}
        skeleton={<TimesheetManagementSkeleton rows={pagination.limit || 5} />}
        rowKey="_id"
        emptyMessage="No published surveys found"
        configOptions={{ persistenceKey: "survey-published-table" }}
        renderColumnSelector={(selector) => (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Published Surveys</h3>
            <div className="flex items-center gap-2">
              {selector}
            </div>
          </div>
        )}
      />
      {pagination.total > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          itemsPerPageOptions={[5, 10, 20, 50]}
        />
      )}
    </div>
  );
};

export default PublishedSurveysAccordion;