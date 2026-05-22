import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { ConfigurableTable } from '../../../common';
import { TableColumn } from '../../../common/Table';
import Pagination from '../../../common/Pagination';
import Badge from '../../../common/Badge';
import { DraftSurvey, PaginationData } from '../types';
import SimpleTooltip from '../../../common/SimpleTooltip';
import { formatDate } from '../../../../utils/timeUtils';

import { TimesheetManagementSkeleton } from '../../../timesheet/Skeleton';

interface DraftsAccordionProps {
  drafts: DraftSurvey[];
  loading: boolean;
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onView: (draft: DraftSurvey) => void;
  onEdit: (draft: DraftSurvey) => void;
  onDelete: (draft: DraftSurvey) => void;
}

const baseCellClass = "text-sm text-slate-900";
const placeholderCellClass = "text-sm text-slate-800";

const DraftsAccordion: React.FC<DraftsAccordionProps> = ({
  drafts,
  loading,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns: TableColumn<DraftSurvey>[] = [
    {
      key: 'title',
      title: 'Title',
      label: 'Title',
      required: true,
      render: (_, record) => (
        <span className="text-sm font-medium text-slate-900">{record.title || 'Untitled Draft'}</span>
      ),
    },
    {
      key: 'status',
      title: 'Type',
      label: 'Type',
      align: 'center',
      render: () => <Badge variant="orange" size="middle">Draft</Badge>,
    },
    {
      key: 'questionCount',
      title: 'Count of Questions',
      label: 'Questions',
      align: 'center',
      render: (_, record) => <span className={baseCellClass}>{record.questionCount || 0}</span>,
    },
    {
      key: 'createdAt',
      title: 'Created At',
      label: 'Creation Date',
      render: (_, record) => (
        <span className={record.createdAt ? baseCellClass : placeholderCellClass}>
          {record.createdAt ? formatDate(record.createdAt) : "N/A"}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      title: 'Updated At',
      label: 'Last Updated',
      render: (_, record) => (
        <span className={record.updatedAt ? baseCellClass : placeholderCellClass}>
          {record.updatedAt ? formatDate(record.updatedAt) : "N/A"}
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
          <SimpleTooltip label="Edit" side="top">
            <button onClick={() => onEdit(record)} className="text-green-600 hover:text-green-800 transition-colors">
              <Edit className="w-4 h-4" />
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
        data={drafts}
        loading={loading}
        skeleton={<TimesheetManagementSkeleton rows={pagination.limit || 5} />}
        rowKey="_id"
        emptyMessage="No drafts found"
        configOptions={{ persistenceKey: "survey-drafts-table" }}
        renderColumnSelector={(selector) => (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Survey Drafts</h3>
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

export default DraftsAccordion;