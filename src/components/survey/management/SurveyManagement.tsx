import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle, LayoutList, ClipboardList, FileText as FileTextIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from '../../common'; // Standard Button
import FilterWrapper from '../../common/FilterWrapper';
import SearchInput from '../../common/SearchInput';
import DatePicker from '../../common/DatePicker';
import TabSelector from '../../employee-service/component/TabSelector';
import { StatsCards, StatCardConfig } from '../common';
import {
  PublishedSurveysAccordion,
  DraftsAccordion,
  TemplatesAccordion,
  DeleteConfirmModal,
  DuplicateTemplateModal,
  DeleteItemType,
} from './components';
import { useSurveyManagement } from './hooks';
import { PaginationData } from './types';

type ManagementTabKey = 'published' | 'drafts' | 'templates';

interface TabItem {
  k: ManagementTabKey;
  label: string;
}

const managementTabs: TabItem[] = [
  { k: 'published', label: 'Published Surveys' },
  { k: 'drafts', label: 'Drafts' },
  { k: 'templates', label: 'Templates' },
];

const statsCardsConfig: StatCardConfig[] = [
  { key: 'total', label: 'Total Surveys', color: 'bg-primary-500', icon: ClipboardList },
  { key: 'published', label: 'Published', color: 'bg-green-500', icon: CheckCircle }, // Changed purple to green to match Employee status
  { key: 'templates', label: 'Templates', color: 'bg-purple-500', icon: LayoutList },
  { key: 'drafts', label: 'Drafts', color: 'bg-orange-500', icon: FileTextIcon },
];

const statusOptions = [
  { value: 'active', label: 'Published' },
  { value: 'inactive', label: 'Closed' },
];

const SurveyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ManagementTabKey>('published');
  const {
    statistics, statsLoading, filters, searchInput, updateSearch, updateStatus,
    updateFromDate, updateToDate, updateCreatedAt, updateUpdatedAt, publishedSurveys,
    publishedLoading, publishedPage, publishedTotal, publishedLimit, setPublishedPage,
    setPublishedLimit, drafts, draftsLoading, draftsPage, draftsTotal, draftsLimit,
    setDraftsPage, setDraftsLimit, templates, templatesLoading, templatesPage, templatesTotal,
    templatesLimit, setTemplatesPage, setTemplatesLimit, handleCreateSurvey, handleViewSurvey,
    handleEditDraft, handleEditTemplate, handleViewDraft, handleViewTemplate,
    handleToggleSurveyStatus, actionLoading, deleteModal, openDeleteModal,
    closeDeleteModal, confirmDelete, duplicateModal, openDuplicateModal,
    closeDuplicateModal, confirmDuplicate, resetFilters
  } = useSurveyManagement(activeTab);


  const publishedPagination: PaginationData = {
    page: publishedPage, currentPage: publishedPage, limit: publishedLimit,
    total: publishedTotal, totalPages: Math.ceil(publishedTotal / publishedLimit) || 1,
  };

  const draftsPagination: PaginationData = {
    page: draftsPage, currentPage: draftsPage, limit: draftsLimit,
    total: draftsTotal, totalPages: Math.ceil(draftsTotal / draftsLimit) || 1,
  };

  const templatesPagination: PaginationData = {
    page: templatesPage, currentPage: templatesPage, limit: templatesLimit,
    total: templatesTotal, totalPages: Math.ceil(templatesTotal / templatesLimit) || 1,
  };

  useEffect(() => {
    resetFilters();
  }, [activeTab]);

  const renderFilters = () => {
    switch (activeTab) {
      case 'published':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchInput
              value={searchInput}
              onChange={updateSearch}
              label="Search Surveys"
              placeholder="Search by name..."
            />
            <DatePicker
              label="Start Date"
              value={filters.fromDate ? dayjs(filters.fromDate) : null}
              onChange={(d) => updateFromDate(d ? d.format('YYYY-MM-DD') : null)}
              placeholder="Select start date"
            />
            <DatePicker
              label="End Date"
              value={filters.toDate ? dayjs(filters.toDate) : null}
              onChange={(d) => updateToDate(d ? d.format('YYYY-MM-DD') : null)}
              placeholder="Select end date"
              minDate={filters.fromDate ? dayjs(filters.fromDate) : undefined}
            />
          </div>
        );

      case 'drafts':
      case 'templates':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchInput
              value={searchInput}
              onChange={updateSearch}
              label="Search"
              placeholder="Search employee by name..."
            />
            <DatePicker
              label="Created At"
              value={filters.createdAt ? dayjs(filters.createdAt) : null}
              onChange={(d) => updateCreatedAt(d ? d.format('YYYY-MM-DD') : null)}
              placeholder="Select date"
            />
            <DatePicker
              label="Updated At"
              value={filters.updatedAt ? dayjs(filters.updatedAt) : null}
              onChange={(d) => updateUpdatedAt(d ? d.format('YYYY-MM-DD') : null)}
              placeholder="Select date"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header aligned with Employee Management */}
      <div className="flex max-[830px]:flex-col items-start sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 md:text-3xl">
            Survey Management
          </h1>
        </div>
        <Button
          htmlType="button"
          size="large"
          appearance="primary"
          onClick={handleCreateSurvey}
          icon={<Plus className="w-5 h-5" />} // Standard icon scale
        >
          Create Survey
        </Button>
      </div>

      <StatsCards stats={statistics} cards={statsCardsConfig} loading={statsLoading} />

      <FilterWrapper>
        {renderFilters()}
      </FilterWrapper>

      <TabSelector tabs={managementTabs} active={activeTab} onChange={(key: string) => setActiveTab(key as ManagementTabKey)} />

      {/* Main Content Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden">
        {activeTab === 'published' && (
          <PublishedSurveysAccordion
            isOpen={true}
            surveys={publishedSurveys}
            loading={publishedLoading}
            pagination={publishedPagination}
            onPageChange={setPublishedPage}
            onItemsPerPageChange={setPublishedLimit}
            onView={(s) => handleViewSurvey(s._id)}
            onToggleStatus={(s) => handleToggleSurveyStatus(s._id, !s.isActive)}
            onDelete={(s) => openDeleteModal('published', s._id, s.title)}
          />
        )}

        {activeTab === 'drafts' && (
          <DraftsAccordion
            drafts={drafts}
            loading={draftsLoading}
            pagination={draftsPagination}
            onPageChange={setDraftsPage}
            onItemsPerPageChange={setDraftsLimit}
            onView={(d) => handleViewDraft(d._id)}
            onEdit={(d) => handleEditDraft(d._id)}
            onDelete={(d) => openDeleteModal('draft', d._id, d.title || 'Untitled Draft')}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesAccordion
            templates={templates}
            loading={templatesLoading}
            pagination={templatesPagination}
            onPageChange={setTemplatesPage}
            onItemsPerPageChange={setTemplatesLimit}
            onView={(t) => handleViewTemplate(t._id)}
            onEdit={(t) => handleEditTemplate(t._id)}
            onDuplicate={(t) => openDuplicateModal(t._id, t.title || t.name)}
            onDelete={(t) => openDeleteModal('template', t._id, t.title || t.name)}
          />
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal?.isOpen ?? false}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        loading={!!actionLoading}
        itemType={deleteModal?.type === 'published' ? 'survey' : deleteModal?.type as DeleteItemType}
        itemTitle={deleteModal?.title}
      />

      <DuplicateTemplateModal
        isOpen={duplicateModal?.isOpen ?? false}
        onClose={closeDuplicateModal}
        onConfirm={confirmDuplicate}
        loading={!!actionLoading}
        template={templates.find((t) => t._id === duplicateModal?.templateId) || null}
      />
    </div>
  );
};

export default SurveyManagement;