/**
 * Survey Management Hook - Refactored with RTK Query
 * ====================================================
 * Uses RTK Query for data fetching and surveySlice for UI state.
 * Components using this hook require NO changes.
 */

import { useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { RootState, AppDispatch } from '../../../../store';
import { scrollToTop } from '../../hooks';

// RTK Query hooks
import {
  useGetSurveyStatisticsQuery,
  useGetPublishedSurveysQuery,
  useGetDraftsQuery,
  useGetTemplatesQuery,
  useToggleSurveyStatusMutation,
  useDeleteSurveyMutation,
  useDeleteDraftMutation,
  useDeleteTemplateMutation,
  useDuplicateTemplateMutation,
} from '../../../../store/apis/survey.api';

// Local types for component compatibility
import { DraftSurvey, TemplateItem, AccordionSection } from '../types';

// Redux slice actions
import {
  setPage,
  setLimit,
  setSearchQuery,
  setStatusFilter,
  setDateRange,
  clearFilters as clearFiltersAction,
  ManagementTab,
} from '../../../../store/slices/surveySlice';
import { SurveyStatus } from '../../../../utils/survey.enum';
import { useDebounce } from '../../../../utils/debounce';

/**
 * Main hook for Survey Management page
 * Refactored to use RTK Query + Redux slice for state management
 */
export const useSurveyManagement = (activeTab: ManagementTab) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // ==================== REDUX SLICE STATE ====================
  const {
    page,
    limit,
    searchQuery,
    statusFilter,
    dateRange,
  } = useSelector((state: RootState) => state.survey);

  // ==================== LOCAL UI STATE (not global) ====================

  // Local pagination for drafts/templates (not synced globally)
  const [draftsPage, setDraftsPage] = useState(1);
  const [draftsLimit, setDraftsLimit] = useState(10);

  const [templatesPage, setTemplatesPage] = useState(1);
  const [templatesLimit, setTemplatesLimit] = useState(10);

  // Accordion state - local since it's page-specific
  const [openAccordions, setOpenAccordions] = useState<Set<AccordionSection>>(
    new Set(['published'])
  );

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'published' | 'draft' | 'template';
    id: string;
    title: string;
  } | null>(null);

  // Duplicate template modal state
  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean;
    templateId: string;
    originalName: string;
  } | null>(null);

  // ==================== RTK QUERIES ====================

  const statisticsQuery = useGetSurveyStatisticsQuery();

  const debouncedSearchQuery = useDebounce(searchQuery || "", 500);

  const publishedSurveysQuery = useGetPublishedSurveysQuery({
    search: debouncedSearchQuery || undefined,
    status: SurveyStatus.PUBLISHED,
    fromDate: dateRange.from || undefined,
    toDate: dateRange.to || undefined,
    page,
    limit,
  },
    { skip: activeTab !== 'published' }
  );

  // Always fetch drafts and templates for tab-based UI
  const draftsQuery = useGetDraftsQuery(
    { search: searchQuery || undefined, page, limit },
    { skip: activeTab !== 'drafts' }
  );

  // Always fetch templates for stats and tab display
  const templatesQuery = useGetTemplatesQuery(
    { search: debouncedSearchQuery || undefined },
    { skip: activeTab !== 'templates' }
  );

  // ==================== MUTATIONS ====================

  const [toggleSurveyStatus, toggleStatusState] = useToggleSurveyStatusMutation();
  const [deleteSurvey, deleteSurveyState] = useDeleteSurveyMutation();
  const [duplicateTemplate, duplicateTemplateState] = useDuplicateTemplateMutation();

  // Combined action loading state
  const actionLoading = useMemo(() => {
    if (toggleStatusState.isLoading) return toggleStatusState.originalArgs?.id;
    if (deleteSurveyState.isLoading) return deleteSurveyState.originalArgs;
    if (duplicateTemplateState.isLoading) return duplicateTemplateState.originalArgs?.id;
    return null;
  }, [
    toggleStatusState,
    deleteSurveyState,
    duplicateTemplateState,
  ]);

  // ==================== FILTER ACTIONS (Dispatch to Redux) ====================

  // Local search input state for debounced search
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Local state for createdAt and updatedAt filters (not in Redux, local to component)
  const [createdAtFilter, setCreatedAtFilter] = useState<string | null>(null);
  const [updatedAtFilter, setUpdatedAtFilter] = useState<string | null>(null);

  // Transform filters to match SurveyFilters interface expected by components
  const filters = useMemo(() => ({
    search: searchQuery,
    status: statusFilter === null ? '' : statusFilter,
    fromDate: dateRange.from,
    toDate: dateRange.to,
    createdAt: createdAtFilter,
    updatedAt: updatedAtFilter,
  }), [searchQuery, statusFilter, dateRange, createdAtFilter, updatedAtFilter]) as {
    search: string;
    status: '' | 'active' | 'inactive';
    fromDate: string | null;
    toDate: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };

  const setFilters = useCallback((newFilters: {
    search?: string;
    status?: 'draft' | 'published' | 'template' | 'inactive' | null;
    dateRange?: { from?: string | null; to?: string | null };
  }) => {
    if (newFilters.search !== undefined) {
      dispatch(setSearchQuery(newFilters.search));
    }
    if (newFilters.status !== undefined) {
      dispatch(setStatusFilter(newFilters.status));
    }
    if (newFilters.dateRange !== undefined) {
      dispatch(setDateRange({
        from: newFilters.dateRange.from || null,
        to: newFilters.dateRange.to || null,
      }));
    }
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(clearFiltersAction());

    dispatch(setPage(1));
    dispatch(setLimit(10));
    dispatch(setStatusFilter(null));
    dispatch(setDateRange({ from: null, to: null }));

    // Local state (if not stored in redux)
    setSearchInput('');
    setCreatedAtFilter(null);
    setUpdatedAtFilter(null);

  }, [dispatch]);

  // Individual filter update functions for component compatibility
  const updateSearch = useCallback((value: string) => {
    setSearchInput(value);
    dispatch(setSearchQuery(value));
    dispatch(setPage(1));
  }, [dispatch]);

  const updateStatus = useCallback((status: '' | 'draft' | 'published' | 'template' | 'inactive') => {
    dispatch(setStatusFilter(status === '' ? null : status));
    dispatch(setPage(1));
  }, [dispatch]);

  const updateFromDate = useCallback((date: string | null) => {
    dispatch(setDateRange({ from: date, to: dateRange.to }));
    dispatch(setPage(1));
  }, [dispatch, dateRange.to]);

  const updateToDate = useCallback((date: string | null) => {
    dispatch(setDateRange({ from: dateRange.from, to: date }));
    dispatch(setPage(1));
  }, [dispatch, dateRange.from]);

  const updateCreatedAt = useCallback((date: string | null) => {
    setCreatedAtFilter(date);
    dispatch(setPage(1));
  }, [dispatch]);

  const updateUpdatedAt = useCallback((date: string | null) => {
    setUpdatedAtFilter(date);
    dispatch(setPage(1));
  }, [dispatch]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setCreatedAtFilter(null);
    setUpdatedAtFilter(null);
    dispatch(clearFiltersAction());
  }, [dispatch]);

  const hasActiveFilters = useMemo(() => {
    return !!(searchQuery || statusFilter || dateRange.from || dateRange.to || createdAtFilter || updatedAtFilter);
  }, [searchQuery, statusFilter, dateRange, createdAtFilter, updatedAtFilter]);

  // ==================== PAGINATION ACTIONS ====================

  const setPublishedPage = useCallback((p: number) => {
    dispatch(setPage(p));
  }, [dispatch]);

  const setPublishedLimit = useCallback((l: number) => {
    dispatch(setLimit(l));
  }, [dispatch]);

  // ==================== ACCORDION HANDLERS ====================

  const toggleAccordion = useCallback((section: AccordionSection) => {
    setOpenAccordions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const isAccordionOpen = useCallback(
    (section: AccordionSection) => openAccordions.has(section),
    [openAccordions]
  );

  // ==================== NAVIGATION HANDLERS ====================

  const handleCreateSurvey = useCallback(() => {
    navigate('/survey-builder');
    scrollToTop();
  }, [navigate]);

  const handleViewSurvey = useCallback(
    (surveyId: string) => {
      navigate(`/survey-builder?surveyId=${surveyId}&mode=view`);
      scrollToTop();
    },
    [navigate]
  );

  const handleEditDraft = useCallback(
    (draftId: string) => {
      navigate(`/survey-builder?draftId=${draftId}`);
      scrollToTop();
    },
    [navigate]
  );

  const handleEditTemplate = useCallback(
    (templateId: string) => {
      navigate(`/survey-builder?templateId=${templateId}&mode=edit-template`);
      scrollToTop();
    },
    [navigate]
  );

  const handleViewDraft = useCallback(
    (draftId: string) => {
      navigate(`/survey-builder?draftId=${draftId}&mode=view`);
      scrollToTop();
    },
    [navigate]
  );

  const handleViewTemplate = useCallback(
    (templateId: string) => {
      navigate(`/survey-builder?templateId=${templateId}&mode=view`);
      scrollToTop();
    },
    [navigate]
  );

  // ==================== ACTION HANDLERS ====================

  const handleToggleSurveyStatus = useCallback(
    async (surveyId: string, newStatus: boolean) => {
      try {
        await toggleSurveyStatus({ id: surveyId, isActive: newStatus }).unwrap();
        toast.success(`Survey ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } catch (error) {
        console.error('Failed to toggle survey status:', error);
        toast.error('Failed to update survey status');
      }
    },
    [toggleSurveyStatus]
  );

  const openDeleteModal = useCallback(
    (type: 'published' | 'draft' | 'template', id: string, title: string) => {
      setDeleteModal({ isOpen: true, type, id, title });
    },
    []
  );

  const closeDeleteModal = useCallback(() => {
    setDeleteModal(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteModal) return;

    const { type, id } = deleteModal;

    try {
      switch (type) {
        case 'published':
          await deleteSurvey(id).unwrap();
          break;
        case 'draft':
          await deleteSurvey(id).unwrap();
          break;
        case 'template':
          await deleteSurvey(id).unwrap();
          break;
      }

      toast.success('Deleted successfully');
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete');
    }
  }, [deleteModal, deleteSurvey, closeDeleteModal]);

  const openDuplicateModal = useCallback((templateId: string, originalName: string) => {
    setDuplicateModal({ isOpen: true, templateId, originalName });
  }, []);

  const closeDuplicateModal = useCallback(() => {
    setDuplicateModal(null);
  }, []);

  const confirmDuplicate = useCallback(
    async (newName: string) => {
      if (!duplicateModal) return;

      try {
        await duplicateTemplate({
          id: duplicateModal.templateId,
          name: newName,
        }).unwrap();
        toast.success('Template duplicated successfully');
        closeDuplicateModal();
      } catch (error) {
        console.error('Failed to duplicate template:', error);
        toast.error('Failed to duplicate template');
      }
    },
    [duplicateModal, duplicateTemplate, closeDuplicateModal]
  );

  // ==================== REFRESH FUNCTIONS ====================

  const refreshPublished = useCallback(() => {
    publishedSurveysQuery.refetch();
  }, [publishedSurveysQuery]);

  const refreshDrafts = useCallback(() => {
    draftsQuery.refetch();
  }, [draftsQuery]);

  const refreshTemplates = useCallback(() => {
    templatesQuery.refetch();
  }, [templatesQuery]);

  const refreshAll = useCallback(() => {
    statisticsQuery.refetch();
    publishedSurveysQuery.refetch();
    if (openAccordions.has('drafts')) draftsQuery.refetch();
    if (openAccordions.has('templates')) templatesQuery.refetch();
  }, [statisticsQuery, publishedSurveysQuery, draftsQuery, templatesQuery, openAccordions]);

  // ==================== DATA TRANSFORMATIONS ====================
  // Transform RTK Query data to match component expected types

  // Transform drafts to DraftSurvey format
  const transformedDrafts = useMemo((): DraftSurvey[] => {
    const rawDrafts = draftsQuery.data ?? [];
    return rawDrafts.map((draft) => ({
      _id: draft._id,
      title: draft.title,
      description: draft.description,
      status: 'draft' as const,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      // Use questionCount from API if available, otherwise calculate from questions array
      questionCount: (draft as { questionCount?: number }).questionCount ?? draft.questions?.length ?? 0,
      sourceTemplateId: draft.sourceTemplateId,
    }));
  }, [draftsQuery.data]);

  // Transform templates to TemplateItem format
  const transformedTemplates = useMemo((): TemplateItem[] => {
    const rawTemplates = templatesQuery.data ?? [];
    return rawTemplates.map((template) => ({
      _id: template._id,
      name: template.name,
      title: template.name, // Use name as title for display
      description: template.description ?? '',
      // questionCount comes directly from API transformation (questions.length)
      questionCount: template.questionCount ?? 0,
      category: undefined, // Not provided by API
      usageCount: 0, // Default value - not tracked yet
      createdAt: template.createdAt,
      updatedAt: template.updatedAt ?? template.createdAt, // Fallback to createdAt if updatedAt missing
      createdBy: template.createdBy ?? { _id: '', firstName: '', lastName: '' },
    }));
  }, [templatesQuery.data]);

  // ==================== RETURN (Same interface as before) ====================

  return {
    // Statistics
    statistics: statisticsQuery.data ?? null,
    statsLoading: statisticsQuery.isLoading,

    // Accordion
    toggleAccordion,
    isAccordionOpen,

    // Filters (same interface)
    filters,
    searchInput,
    setFilters,
    updateSearch,
    updateStatus,
    updateFromDate,
    updateToDate,
    updateCreatedAt,
    updateUpdatedAt,
    clearFilters,
    hasActiveFilters,
    resetFilters,

    // Published surveys
    publishedSurveys: publishedSurveysQuery.data?.data ?? [],
    publishedLoading: publishedSurveysQuery.isLoading,
    publishedPage: page,
    publishedTotal: publishedSurveysQuery.data?.pagination?.total ?? 0,
    publishedLimit: limit,
    setPublishedPage,
    setPublishedLimit,

    // Drafts
    drafts: transformedDrafts,
    draftsLoading: draftsQuery.isLoading,
    draftsPage,
    draftsTotal: transformedDrafts.length,
    draftsLimit,
    setDraftsPage,
    setDraftsLimit,

    // Templates
    templates: transformedTemplates,
    templatesLoading: templatesQuery.isLoading,
    templatesPage,
    templatesTotal: transformedTemplates.length,
    templatesLimit,
    setTemplatesPage,
    setTemplatesLimit,

    // Navigation
    handleCreateSurvey,
    handleViewSurvey,
    handleEditDraft,
    handleEditTemplate,
    handleViewDraft,
    handleViewTemplate,

    // Actions
    handleToggleSurveyStatus,
    actionLoading,

    // Delete modal
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,

    // Duplicate modal
    duplicateModal,
    openDuplicateModal,
    closeDuplicateModal,
    confirmDuplicate,

    // Refresh functions
    refreshPublished,
    refreshDrafts,
    refreshTemplates,
    refreshAll,
  };
};

export default useSurveyManagement;
