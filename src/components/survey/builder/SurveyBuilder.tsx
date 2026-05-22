import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSurveyBuilder, scrollToTop } from '../hooks';
import SurveyBuilderHeader from './SurveyBuilderHeader';
import SurveyDetailsAccordion from './accordions/SurveyDetailsAccordion';
import ScheduleAccordion from './accordions/ScheduleAccordion';
import AssignSurveyAccordion from './accordions/AssignSurveyAccordion';
import QuestionsAccordion from './accordions/QuestionsAccordion';
import QuestionOverviewPanel from './QuestionOverviewPanel';
import { ConfirmationModal, SaveAsTemplateModal } from '../modals';
import { IconButton } from './components';

import SurveyBuilderSkeleton from './SurveyBuilderSkeleton';

// Build mode types
interface SurveyBuilderProps { }

const SurveyBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Parse URL params for mode detection
  const draftId = searchParams.get('draftId');
  const templateId = searchParams.get('templateId');
  const surveyId = searchParams.get('surveyId'); // For viewing published surveys
  const modeParam = searchParams.get('mode');

  // Determine builder mode
  const builderMode = useMemo((): BuilderMode => {
    if (modeParam === 'view') return 'view';
    if (modeParam === 'edit-template' && templateId) return 'edit-template';
    if (draftId) return 'edit-draft';
    if (surveyId) return 'view'; // Published surveys always open in view mode
    if (templateId && !modeParam) return 'create'; // Load template for new survey
    return 'create';
  }, [draftId, templateId, surveyId, modeParam]);

  // Computed properties for mode
  const isViewMode = builderMode === 'view';
  const isEditingTemplate = builderMode === 'edit-template';
  const isEditingDraft = builderMode === 'edit-draft';
  const isEditing = isEditingTemplate || isEditingDraft;
  const shouldHideLoadTemplate = isEditing || isViewMode;

  // Survey Builder Hook
  const {
    formState,
    isLoading,
    isSaving,
    isPublishing,
    isDirty,
    setTitle,
    setDescription,
    setSchedule,
    setAssignment,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    loadTemplate,
    loadDraft,
    clearForm,
    saveAsDraft,
    saveAsNewTemplate,
    updateExistingTemplate,
    publishSurvey,
    validationErrors,
  } = useSurveyBuilder();

  useEffect(() => {
    const loadInitialData = async () => {
      if (surveyId && builderMode === 'view') {
        await loadDraft(surveyId); // loadDraft uses getSurveyById which works for any survey
      } else if (draftId && (builderMode === 'edit-draft' || builderMode === 'view')) {
        await loadDraft(draftId);
      } else if (templateId) {
        await loadTemplate(templateId);
      }
    };
    loadInitialData();
  }, [draftId, templateId, surveyId, builderMode, loadDraft, loadTemplate]);

  // Determine page title based on mode
  const pageTitle = useMemo(() => {
    if (isViewMode) return 'View Survey';
    if (isEditingTemplate) return 'Edit Template';
    if (isEditingDraft) return 'Edit Draft';
    return 'Create Survey';
  }, [isViewMode, isEditingTemplate, isEditingDraft]);

  // Accordion states - all open by default
  const [openAccordions, setOpenAccordions] = useState({
    details: true,
    schedule: true,
    assign: true,
    questions: true,
  });

  // Modal states
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Overview panel state - open by default on desktop
  const [isOverviewPanelOpen, setIsOverviewPanelOpen] = useState(true);

  // Toggle accordion
  const toggleAccordion = useCallback((key: keyof typeof openAccordions) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (isDirty) {
      setShowExitConfirmation(true);
    } else {
      navigate(-1);
    }
  }, [isDirty, navigate]);

  // Handle template selection from Load from Template dropdown
  const handleLoadTemplate = useCallback(async (templateId: string) => {
    await loadTemplate(templateId);
  }, [loadTemplate]);

  // Handle publish - clear form and start new survey after successful publish
  const handlePublish = useCallback(async () => {
    const success = await publishSurvey();
    if (success) {
      clearForm();
      scrollToTop();
    }
  }, [publishSurvey, clearForm]);

  const confirmClearForm = useCallback(() => {
    clearForm();
    setShowClearConfirmation(false);
  }, [clearForm]);

  // Handle exit confirmation
  const confirmExit = useCallback(() => {
    setShowExitConfirmation(false);
    navigate(-1);
    scrollToTop();
  }, [navigate]);

  // Get error for a specific field
  const getFieldError = useCallback((field: string) => {
    return validationErrors.find((e: any) => e.field === field)?.message;
  }, [validationErrors]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return <SurveyBuilderSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Page Header with Back Button */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <IconButton
            variant="ghost"
            size="md"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </IconButton>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 pt-2 md:text-3xl">
              {pageTitle}
            </h1>
          </div>
        </div>
      </div>
      <SurveyBuilderHeader
        onLoadTemplate={handleLoadTemplate}
        onSaveAsDraft={saveAsDraft}
        onSaveAsTemplate={() => setShowSaveTemplateModal(true)}
        onUpdateExistingTemplate={updateExistingTemplate}
        onPublish={handlePublish}
        isSaving={isSaving}
        isPublishing={isPublishing}
        sourceTemplateId={formState.sourceTemplateId}
        isViewMode={isViewMode}
        hideLoadTemplate={shouldHideLoadTemplate}
        isEditingTemplate={isEditingTemplate}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <SurveyDetailsAccordion
            isOpen={openAccordions.details}
            onToggle={() => toggleAccordion('details')}
            title={formState.title}
            description={formState.description}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            titleError={getFieldError('title')}
            readOnly={isViewMode}
          />

          <ScheduleAccordion
            isOpen={openAccordions.schedule}
            onToggle={() => toggleAccordion('schedule')}
            schedule={formState.schedule}
            onScheduleChange={setSchedule}
            scheduleError={getFieldError('schedule')}
            readOnly={isViewMode}
          />

          <AssignSurveyAccordion
            isOpen={openAccordions.assign}
            onToggle={() => toggleAccordion('assign')}
            assignment={formState.assignment}
            onAssignmentChange={setAssignment}
            entityTypeError={getFieldError('assignment.entityType')}
            entityIdsError={getFieldError('assignment.entityIds')}
            readOnly={isViewMode}
          />

          <QuestionsAccordion
            isOpen={openAccordions.questions}
            onToggle={() => toggleAccordion('questions')}
            questions={formState.questions}
            onAddQuestion={addQuestion}
            onUpdateQuestion={updateQuestion}
            onDeleteQuestion={deleteQuestion}
            onReorderQuestions={reorderQuestions}
            questionsError={getFieldError('questions')}
            readOnly={isViewMode}
          />
        </div>

        <QuestionOverviewPanel
          questions={formState.questions}
          onQuestionClick={(tempId: string) => {
            const element = document.getElementById(`question-${tempId}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          onDeleteQuestion={deleteQuestion}
          isOpen={isOverviewPanelOpen}
          onToggle={() => setIsOverviewPanelOpen(prev => !prev)}
        />
      </div>
      <SaveAsTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={saveAsNewTemplate}
        defaultName={formState.title}
        isSaving={isSaving}
      />

      <ConfirmationModal
        isOpen={showExitConfirmation}
        onClose={() => setShowExitConfirmation(false)}
        onConfirm={confirmExit}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmText="Leave"
        cancelText="Stay"
        variant="warning"
      />

      <ConfirmationModal
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={confirmClearForm}
        title="Clear Form"
        message="Are you sure you want to clear the form? All your changes will be lost."
        confirmText="Clear"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default SurveyBuilder;
