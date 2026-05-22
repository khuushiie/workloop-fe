import React from 'react';
import { Eye, Edit, Copy, Trash2 } from 'lucide-react';
import { ConfigurableTable } from '../../../common';
import { TableColumn } from '../../../common/Table';
import Pagination from '../../../common/Pagination';
import { TemplateItem, PaginationData } from '../types';
import SimpleTooltip from '../../../common/SimpleTooltip';
import { formatDate } from '../../../../utils/timeUtils';

import { TimesheetManagementSkeleton } from '../../../timesheet/Skeleton';

interface TemplatesAccordionProps {
  templates: TemplateItem[];
  loading: boolean;
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onView: (template: TemplateItem) => void;
  onEdit: (template: TemplateItem) => void;
  onDuplicate: (template: TemplateItem) => void;
  onDelete: (template: TemplateItem) => void;
}

const baseCellClass = "text-sm text-slate-900";
const placeholderCellClass = "text-sm text-slate-800";

const TemplatesAccordion: React.FC<TemplatesAccordionProps> = ({
  templates,
  loading,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const columns: TableColumn<TemplateItem>[] = [
    {
      key: 'title',
      title: 'Title',
      label: 'Title',
      required: true,
      render: (_, record) => (
        <span className="text-sm font-medium text-slate-900">{record.title}</span>
      ),
    },
    {
      key: 'questionCount',
      title: 'No. of Questions',
      label: 'Questions',
      align: 'center',
      render: (_, record) => (
        <span className={baseCellClass}>{record.questionCount || 0}</span>
      ),
    },
    {

      key: 'createdAt',
      title: 'Created On',
      label: 'Creation Date',
      align: 'center',
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
          <SimpleTooltip label="Use Template" side="top">
            <button onClick={() => onView(record)} className="text-primary-600 hover:text-primary-800 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </SimpleTooltip>
          <SimpleTooltip label="Edit" side="top">
            <button onClick={() => onEdit(record)} className="text-green-600 hover:text-green-800 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </SimpleTooltip>
          <SimpleTooltip label="Duplicate" side="top">
            <button onClick={() => onDuplicate(record)} className="text-purple-600 hover:text-purple-800 transition-colors">
              <Copy className="w-4 h-4" />
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
        data={templates}
        loading={loading}
        skeleton={<TimesheetManagementSkeleton rows={pagination.limit || 5} />}
        rowKey="_id"
        emptyMessage="No templates found"
        configOptions={{ persistenceKey: "survey-templates-table" }}
        renderColumnSelector={(selector) => (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Survey Templates</h3>
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

export default TemplatesAccordion;