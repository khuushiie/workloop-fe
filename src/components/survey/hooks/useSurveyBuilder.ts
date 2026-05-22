import { useState, useCallback } from 'react';
import {
  SurveyFormState,
  SurveyQuestion,
  SurveySchedule,
  SurveyAssignment,
  QuestionType,
  ValidationError,
  SurveyValidationResult,
  createEmptyFormState,
  createEmptyQuestion,
  generateTempId,
  QUESTION_TYPE_CONFIG,
} from '../types';
import toast from 'react-hot-toast';
import { extractApiError } from '../../../utils/apiErrorUtils';

// RTK Query hooks
import {
  useLazyGetTemplateByIdQuery,
  useLazyGetSurveyByIdQuery,
  useCreateDraftMutation,
  useUpdateDraftMutation,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  usePublishSurveyMutation,
} from '../../../store/apis/survey.api';

interface UseSurveyBuilderReturn {
  // Form State
  formState: SurveyFormState;
  isLoading: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isDirty: boolean;

  // Form Actions
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSchedule: (schedule: Partial<SurveySchedule>) => void;
  setAssignment: (assignment: Partial<SurveyAssignment>) => void;

  // Question Actions
  addQuestion: (type: QuestionType) => void;
  updateQuestion: (tempId: string, updates: Partial<SurveyQuestion>) => void;
  deleteQuestion: (tempId: string) => void;
  reorderQuestions: (questions: SurveyQuestion[]) => void;

  // Template/Draft Actions
  loadTemplate: (templateId: string) => Promise<void>;
  loadDraft: (draftId: string) => Promise<void>;
  clearForm: () => void;

  // Save Actions
  saveAsDraft: () => Promise<void>;
  saveAsNewTemplate: (name?: string) => Promise<void>;
  updateExistingTemplate: () => Promise<void>;
  publishSurvey: () => Promise<boolean>;

  // Validation
  validate: () => SurveyValidationResult;
  validationErrors: ValidationError[];
}

export const useSurveyBuilder = (): UseSurveyBuilderReturn => {
  const [formState, setFormState] = useState<SurveyFormState>(createEmptyFormState());
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const [getTemplateById, templateQuery] = useLazyGetTemplateByIdQuery();
  const [getSurveyById, surveyQuery] = useLazyGetSurveyByIdQuery();
  const [createDraft, createDraftState] = useCreateDraftMutation();
  const [updateDraft, updateDraftState] = useUpdateDraftMutation();
  const [createTemplate, createTemplateState] = useCreateTemplateMutation();
  const [updateTemplate, updateTemplateState] = useUpdateTemplateMutation();
  const [publishSurveyMutation, publishState] = usePublishSurveyMutation();

  // Derived loading states
  const isLoading = templateQuery.isLoading || surveyQuery.isLoading;
  const isSaving = createDraftState.isLoading || updateDraftState.isLoading ||
    createTemplateState.isLoading || updateTemplateState.isLoading;
  const isPublishing = publishState.isLoading;

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const setTitle = useCallback((title: string) => {
    setFormState(prev => ({ ...prev, title }));
    markDirty();
  }, [markDirty]);

  const setDescription = useCallback((description: string) => {
    setFormState(prev => ({ ...prev, description }));
    markDirty();
  }, [markDirty]);

  const setSchedule = useCallback((schedule: Partial<SurveySchedule>) => {
    setFormState(prev => ({
      ...prev,
      schedule: { ...prev.schedule, ...schedule },
    }));
    markDirty();
  }, [markDirty]);

  const setAssignment = useCallback((assignment: Partial<SurveyAssignment>) => {
    setFormState(prev => ({
      ...prev,
      assignment: { ...prev.assignment, ...assignment },
    }));
    markDirty();
  }, [markDirty]);

  const addQuestion = useCallback((type: QuestionType) => {
    setFormState(prev => {
      const newOrder = prev.questions.length + 1;
      const newQuestion = createEmptyQuestion(type, newOrder);
      return {
        ...prev,
        questions: [...prev.questions, newQuestion],
      };
    });
    markDirty();
  }, [markDirty]);

  const updateQuestion = useCallback((tempId: string, updates: Partial<SurveyQuestion>) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.tempId === tempId ? { ...q, ...updates } : q
      ),
    }));
    markDirty();
  }, [markDirty]);

  const deleteQuestion = useCallback((tempId: string) => {
    setFormState(prev => {
      const filtered = prev.questions.filter(q => q.tempId !== tempId);
      // Reorder remaining questions
      const reordered = filtered.map((q, idx) => ({ ...q, order: idx + 1 }));
      return { ...prev, questions: reordered };
    });
    markDirty();
  }, [markDirty]);

  const reorderQuestions = useCallback((questions: SurveyQuestion[]) => {
    const reordered = questions.map((q, idx) => ({ ...q, order: idx + 1 }));
    setFormState(prev => ({ ...prev, questions: reordered }));
    markDirty();
  }, [markDirty]);


  const loadTemplate = useCallback(async (templateId: string) => {
    try {
      const template = await getTemplateById(templateId).unwrap();

      if (!template) {
        toast.error('Template not found');
        return;
      }

      const rawTemplate = template as any;
      let schedule = {
        startDate: null as string | null,
        endDate: null as string | null,
        startTime: null as string | null,
        endTime: null as string | null,
      };

      if (rawTemplate.startTime) {
        const isoStr = rawTemplate.startTime;
        schedule.startDate = isoStr.slice(0, 10); // "2026-02-11"
        schedule.startTime = isoStr.slice(11, 16); // "09:00"
      }
      if (rawTemplate.endTime) {
        const isoStr = rawTemplate.endTime;
        schedule.endDate = isoStr.slice(0, 10);
        schedule.endTime = isoStr.slice(11, 16);
      }

      setFormState({
        title: template.name,
        description: template.description || '',
        schedule,
        assignment: template.assignment || { entityType: null, entityIds: [] },
        questions: template.questions.map((q, idx) => ({
          ...q,
          tempId: generateTempId(),
          order: idx + 1,
        })),
        sourceTemplateId: template._id,
        sourceDraftId: null,
      });

      setIsDirty(false);
      toast.success(`Template "${template.name}" loaded`);
    } catch (error) {
      toast.error('Failed to load template');
      console.error('Load template error:', error);
    }
  }, [getTemplateById]);

  const loadDraft = useCallback(async (draftId: string) => {
    try {
      const draft = await getSurveyById(draftId).unwrap();

      if (!draft) {
        toast.error('Draft not found');
        return;
      }

      const rawDraft = draft as any;
      let schedule = {
        startDate: null as string | null,
        endDate: null as string | null,
        startTime: null as string | null,
        endTime: null as string | null,
      };

      if (rawDraft.startTime) {
        const isoStr = rawDraft.startTime;
        schedule.startDate = isoStr.slice(0, 10); // "2026-02-11"
        schedule.startTime = isoStr.slice(11, 16); // "09:00"
      }
      if (rawDraft.endTime) {
        const isoStr = rawDraft.endTime;
        schedule.endDate = isoStr.slice(0, 10);
        schedule.endTime = isoStr.slice(11, 16);
      }

      setFormState({
        title: draft.name || '',
        description: draft.description || '',
        schedule,
        assignment: draft.assignment || { entityType: null, entityIds: [] },
        questions: draft.questions.map((q, idx) => ({
          ...q,
          tempId: generateTempId(),
          order: idx + 1,
        })),
        sourceTemplateId: rawDraft.sourceTemplateId || null,
        sourceDraftId: draft._id,
      });

      setIsDirty(false);
      toast.success(`Draft "${draft.name || 'Untitled'}" loaded`);
    } catch (error) {
      toast.error('Failed to load draft');
      console.error('Load draft error:', error);
    }
  }, [getSurveyById]);

  const clearForm = useCallback(() => {
    setFormState(createEmptyFormState());
    setIsDirty(false);
    setValidationErrors([]);
  }, []);

  const validate = useCallback((): SurveyValidationResult => {
    const errors: ValidationError[] = [];
    if (!formState.title.trim()) {
      errors.push({ field: 'title', message: 'Survey title is required' });
    }

    if (formState.questions.length === 0) {
      errors.push({ field: 'questions', message: 'At least one question is required' });
    }

    formState.questions.forEach((q, idx) => {
      if (!q.text.trim()) {
        errors.push({
          field: `questions[${idx}].text`,
          message: `Question ${idx + 1} text is required`,
        });
      }

      const qConfig = QUESTION_TYPE_CONFIG[q.type] || QUESTION_TYPE_CONFIG.short_text;
      if (qConfig.hasOptions && q.options) {
        const validOptions = q.options.filter(opt => opt.text.trim());
        const minOptions = qConfig.minOptions || 2;

        if (validOptions.length < minOptions) {
          errors.push({
            field: `questions[${idx}].options`,
            message: `Question ${idx + 1} requires at least ${minOptions} options`,
          });
        }
      }
    });

    const { startDate, startTime, endDate, endTime } = formState.schedule;
    if (!startDate || !startTime) {
      errors.push({
        field: 'schedule',
        message: 'Start date and time are required',
      });
    }
    if (!endDate || !endTime) {
      errors.push({
        field: 'schedule',
        message: 'End date and time are required',
      });
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.push({
        field: 'schedule',
        message: 'End date must be after start date',
      });
    }

    if (!formState.assignment.entityType) {
      errors.push({
        field: 'assignment.entityType',
        message: 'Please select an assignment type',
      });
    }

    if (formState.assignment.entityType && formState.assignment.entityIds.length === 0) {
      errors.push({
        field: 'assignment.entityIds',
        message: 'Please select at least one recipient',
      });
    }

    setValidationErrors(errors);
    return { isValid: errors.length === 0, errors };
  }, [formState]);


  const saveAsDraft = useCallback(async () => {
    if (!formState.schedule.startDate || !formState.schedule.endDate) {
      toast.error('Schedule is required. Please set a Start and End date.');
      document.getElementById('schedule-accordion')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const payload = {
        title: formState.title || 'Untitled Survey',
        description: formState.description,
        schedule: formState.schedule,
        assignment: formState.assignment,
        questions: formState.questions,
        sourceTemplateId: formState.sourceTemplateId,
      };

      if (formState.sourceDraftId) {
        await updateDraft({ id: formState.sourceDraftId, body: { ...payload, _id: formState.sourceDraftId } }).unwrap();
        toast.success('Draft updated successfully');
      } else {
        const draft = await createDraft(payload).unwrap();
        setFormState(prev => ({ ...prev, sourceDraftId: draft._id }));
        toast.success('Saved as draft');
      }

      setIsDirty(false);
    } catch (error) {
      toast.error(extractApiError(error));
    }
  }, [formState, createDraft, updateDraft]);

  const saveAsNewTemplate = useCallback(async (name?: string) => {
    if (!formState.schedule.startDate || !formState.schedule.endDate) {
      toast.error('Schedule is required. Please set a Start and End date.');
      document.getElementById('schedule-accordion')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const templateName = name || formState.title || 'Untitled Template';

      if (!formState.questions.length) {
        toast.error('Add at least one question to save as template');
        return;
      }

      await createTemplate({
        name: templateName,
        description: formState.description,
        questions: formState.questions,
        assignment: formState.assignment.entityType ? formState.assignment : undefined,
      }).unwrap();

      toast.success('Template saved successfully');
    } catch (error) {
      toast.error(extractApiError(error));
      // Bug #19 Fix: Silent error handling - error already shown via toast
    }
  }, [formState, createTemplate]);

  const updateExistingTemplate = useCallback(async () => {
    if (!formState.schedule.startDate || !formState.schedule.endDate) {
      toast.error('Schedule is required. Please set a Start and End date.');
      document.getElementById('schedule-accordion')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!formState.sourceTemplateId) {
      toast.error('No template to update');
      return;
    }

    try {
      await updateTemplate({
        id: formState.sourceTemplateId,
        body: {
          _id: formState.sourceTemplateId,
          name: formState.title,
          description: formState.description,
          questions: formState.questions,
          assignment: formState.assignment.entityType ? formState.assignment : undefined,
        },
      }).unwrap();

      toast.success('Template updated successfully');
    } catch (error) {
      toast.error(extractApiError(error));
    }
  }, [formState, updateTemplate]);

  const publishSurvey = useCallback(async (): Promise<boolean> => {
    const validation = validate();

    if (!validation.isValid) {
      const firstError = validation.errors[0];
      toast.error(firstError?.message || 'Please fix validation errors');

      if (firstError?.field) {
        const fieldMap: Record<string, string> = {
          'title': 'survey-title',
          'questions': 'questions-accordion',
          'schedule': 'schedule-accordion',
          'assignment.entityType': 'assign-accordion',
          'assignment.entityIds': 'assign-accordion',
        };
        const fieldKey = firstError.field.startsWith('questions[') ? 'questions' : firstError.field;
        const elementId = fieldMap[fieldKey] || fieldKey;
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return false;
    }

    try {
      await publishSurveyMutation({
        title: formState.title,
        description: formState.description,
        schedule: formState.schedule,
        assignment: formState.assignment,
        questions: formState.questions,
        sourceTemplateId: formState.sourceTemplateId,
        sourceDraftId: formState.sourceDraftId,
      }).unwrap();

      toast.success('Survey Published Successfully');
      setFormState(prev => ({ ...prev, sourceDraftId: null, sourceTemplateId: null }));
      setIsDirty(false);
      return true;
    } catch (error) {
      toast.error(extractApiError(error));
      return false;
    }
  }, [formState, validate, publishSurveyMutation]);

  return {
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
    validate,
    validationErrors,
  };
};

export default useSurveyBuilder;
