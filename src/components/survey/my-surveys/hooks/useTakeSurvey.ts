import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { TakeSurveyData, TakeSurveyQuestion, QuestionState, UserAnswer } from '../../types';
import toast from 'react-hot-toast';

import {
  useGetSurveyDetailsQuery,
  useSaveSurveyProgressMutation,
  useSaveAnswersMutation,
  useSubmitSurveyMutation,
} from '../../../../store/apis/survey.api';

import {
  setCurrentQuestionIndex,
  startTakingSurvey,
  stopTakingSurvey,
} from '../../../../store/slices/surveySlice';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const isValidAnswer = (value: string | string[] | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return false;
};

interface UseTakeSurveyReturn {
  surveyData: TakeSurveyData | null;
  currentQuestion: TakeSurveyQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  answers: Record<string, string | string[] | number | null>;
  questionStates: Record<string, QuestionState>;
  answeredCount: number;
  requiredRemaining: number;
  progress: number;
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  autoSaveStatus: AutoSaveStatus;
  setAnswer: (questionId: string, value: string | string[] | number | null) => void;
  goToQuestion: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  saveAndExit: () => Promise<void>;
  submitSurvey: () => Promise<boolean>;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  canSubmit: boolean;
}

export const useTakeSurvey = (surveyId: string): UseTakeSurveyReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentQuestionIndex: sliceIndex } = useSelector((state: RootState) => state.survey);

  const { data: surveyData, isLoading } = useGetSurveyDetailsQuery(surveyId, { skip: !surveyId });
  const [saveSurveyProgressMutation, { isLoading: isSavingMutation }] = useSaveSurveyProgressMutation();
  const [saveAnswersMutation] = useSaveAnswersMutation();
  const [submitSurveyMutation, { isLoading: isSubmitting }] = useSubmitSurveyMutation();

  const [answers, setAnswers] = useState<Record<string, string | string[] | number | null>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const [submittedAnswerIds, setSubmittedAnswerIds] = useState<Set<string>>(new Set());

  const submittedAnswerIdsRef = useRef<Set<string>>(new Set());
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isInitializedRef = useRef(false);

  const stringifyValue = (value: string | string[] | number | null): string | string[] | number | null => {
    if (typeof value === 'number') return String(value);
    return value;
  };

  useEffect(() => {
    submittedAnswerIdsRef.current = submittedAnswerIds;
  }, [submittedAnswerIds]);

  useEffect(() => {
    dispatch(startTakingSurvey(surveyId));

    return () => {
      dispatch(stopTakingSurvey());
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [dispatch, surveyId]);

  useEffect(() => {
    if (sliceIndex >= 0 && sliceIndex !== currentIndex) {
      setCurrentIndex(sliceIndex);
    }
  }, [sliceIndex]);

  useEffect(() => {
  if (surveyData && !isInitializedRef.current) {
    if (surveyData.savedAnswers) {
      setAnswers(surveyData.savedAnswers);
      const answeredIds = Object.keys(surveyData.savedAnswers).filter((id) =>
        isValidAnswer(surveyData.savedAnswers![id])
      );
      setVisitedQuestions(new Set(answeredIds));
      setSubmittedAnswerIds(new Set(answeredIds));
    }
    
    if (surveyData.lastQuestionIndex !== undefined && surveyData.lastQuestionIndex > 0) {
      setCurrentIndex(surveyData.lastQuestionIndex);
      dispatch(setCurrentQuestionIndex(surveyData.lastQuestionIndex));
    }
    
    if (surveyData.questions?.length > 0) {
      setVisitedQuestions((prev) => new Set(prev).add(surveyData.questions[0]._id));
    }
    
    // Mark as initialized so background refetches don't overwrite user progress
    isInitializedRef.current = true;
  }
}, [surveyData, dispatch]);

  const currentQuestion = surveyData?.questions[currentIndex] || null;
  const totalQuestions = surveyData?.questions.length || 0;

  const questionStates = useMemo(() => {
    if (!surveyData) return {};

    const states: Record<string, QuestionState> = {};

    surveyData.questions.forEach((question, index) => {
      const hasAnswer = isValidAnswer(answers[question._id]);
      const isVisited = visitedQuestions.has(question._id);

      if (index === currentIndex) {
        states[question._id] = 'current';
      } else if (hasAnswer) {
        states[question._id] = 'answered';
      } else if (isVisited) {
        states[question._id] = 'notAnswered';
      } else {
        states[question._id] = 'notVisited';
      }
    });

    return states;
  }, [surveyData, answers, currentIndex, visitedQuestions]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter(isValidAnswer).length;
  }, [answers]);

  const requiredRemaining = useMemo(() => {
    if (!surveyData) return Infinity;

    const requiredQuestions = surveyData.questions.filter((q) => q.isRequired);
    const answeredRequired = requiredQuestions.filter((q) => isValidAnswer(answers[q._id]));

    return requiredQuestions.length - answeredRequired.length;
  }, [surveyData, answers]);

  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const saveCurrentProgress = useCallback(async (
    currentAnswers: Record<string, string | string[] | number | null>
  ) => {
    if (!surveyId || Object.keys(currentAnswers).length === 0) return;

    try {
      setAutoSaveStatus('saving');
      const userAnswers: UserAnswer[] = Object.entries(currentAnswers).map(
        ([questionId, value]) => ({ questionId, value: stringifyValue(value) })
      );

      await saveSurveyProgressMutation({
        surveyId,
        answers: userAnswers,
      }).unwrap();

      const newSubmittedIds = new Set(submittedAnswerIdsRef.current);
      Object.entries(currentAnswers).forEach(([questionId, value]) => {
        if (isValidAnswer(value)) {
          newSubmittedIds.add(questionId);
        } else {
          newSubmittedIds.delete(questionId);
        }
      });
      setSubmittedAnswerIds(newSubmittedIds);

      setAutoSaveStatus('saved');

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Save progress failed:', error);
      setAutoSaveStatus('error');

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
    }
  }, [surveyId, saveSurveyProgressMutation]);

  const setAnswer = useCallback((questionId: string, value: string | string[] | number | null) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      saveCurrentProgress(answers);
      setCurrentIndex(index);
    }
  }, [totalQuestions, answers, saveCurrentProgress]);

  const goToNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      saveCurrentProgress(answers);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions, answers, saveCurrentProgress]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      saveCurrentProgress(answers);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, answers, saveCurrentProgress]);

  const saveAndExit = useCallback(async () => {
    if (!surveyId) return;

    try {
      setAutoSaveStatus('saving');
      const userAnswers: UserAnswer[] = Object.entries(answers).map(
        ([questionId, value]) => ({ questionId, value: stringifyValue(value) })
      );

      await saveAnswersMutation({
        surveyId,
        answers: userAnswers,
      }).unwrap();

      const newSubmittedIds = new Set(submittedAnswerIdsRef.current);
      Object.entries(answers).forEach(([questionId, value]) => {
        if (isValidAnswer(value)) {
          newSubmittedIds.add(questionId);
        } else {
          newSubmittedIds.delete(questionId);
        }
      });
      setSubmittedAnswerIds(newSubmittedIds);

      toast.success('Progress saved successfully!');
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Failed to save progress:', error);
      toast.error('Failed to save progress');
      setAutoSaveStatus('error');
    }
  }, [surveyId, answers, saveAnswersMutation]);

  const submitSurvey = useCallback(async (): Promise<boolean> => {
    if (!surveyId || !surveyData) return false;

    const unansweredRequired = surveyData.questions.filter((q) =>
      q.isRequired && !isValidAnswer(answers[q._id])
    );

    if (unansweredRequired.length > 0) {
      toast.error(
        `Please answer all required questions. ${unansweredRequired.length} remaining.`
      );
      return false;
    }

    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const userAnswers: UserAnswer[] = Object.entries(answers).map(
        ([questionId, value]) => ({ questionId, value: stringifyValue(value) })
      );

      await submitSurveyMutation({
        surveyId,
        answers: userAnswers,
        timeSpent,
      }).unwrap();

      toast.success('Survey submitted successfully!');
      return true;
    } catch (error) {
      console.error('Failed to submit survey:', error);
      toast.error('Failed to submit survey');
      return false;
    }
  }, [surveyId, surveyData, answers, startTime, submitSurveyMutation]);

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const canSubmit = !!surveyData && requiredRemaining === 0;

  return {
    surveyData: surveyData ?? null,
    currentQuestion,
    currentIndex,
    totalQuestions,
    answers,
    questionStates,
    answeredCount,
    requiredRemaining,
    progress,
    isLoading,
    isSaving: isSavingMutation,
    isSubmitting,
    autoSaveStatus,
    setAnswer,
    goToQuestion,
    goToNext,
    goToPrevious,
    saveAndExit,
    submitSurvey,
    isFirstQuestion,
    isLastQuestion,
    canSubmit,
  };
};

export default useTakeSurvey;