import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../index";
import {
    // Templates
    useGetTemplatesQuery,
    useGetTemplateByIdQuery,
    useCreateTemplateMutation,
    useUpdateTemplateMutation,
    useDeleteTemplateMutation,
    useDuplicateTemplateMutation,

    // Drafts
    useGetDraftsQuery,
    useCreateDraftMutation,
    useUpdateDraftMutation,
    useDeleteDraftMutation,

    // Survey Management
    useGetSurveyStatisticsQuery,
    useGetPublishedSurveysQuery,
    useToggleSurveyStatusMutation,
    useDeleteSurveyMutation,
    usePublishSurveyMutation,

    // My Surveys
    useGetMySurveysStatsQuery,
    useGetMySurveysQuery,
    useGetSurveyInfoQuery,
    useGetSurveyDetailsQuery,
    useStartSurveyMutation,
    useSaveAnswerMutation,
    useSaveAnswersMutation,
    useSubmitSurveyMutation,
    useGetMyResponseQuery,

    // Responses
    useGetResponsesOverviewStatsQuery,
    useGetResponsesOverviewQuery,
    useGetSurveyInsightsQuery,
    useGetCompletedResponsesQuery,
    useGetPendingResponsesQuery,
    // useSendReminderMutation,
} from "../apis/survey.api";

// Slice Actions
import {
    setActiveTab,
    setMySurveysTab,
    setResponsesTab,
    setSelectedSurveyId,
    setSelectedTemplateId,
    setSelectedDraftId,
    setSelectedMySurveyId,
    setSelectedResponseId,
    openDrawer,
    closeDrawer,
    openDeleteModal,
    closeDeleteModal,
    openDuplicateModal,
    closeDuplicateModal,
    setPage,
    setLimit,
    setSearchQuery,
    setStatusFilter,
    setDateRange,
    clearFilters,
    setCurrentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,
    startTakingSurvey,
    stopTakingSurvey,
    resetSurveyState,
    resetManagementState,
    type ManagementTab,
    type MySurveysTab as MySurveysTabType,
    type ResponsesTab,
    type IDateRange,
} from "../slices/surveySlice";
interface UseSurveyOptions {
    skipManagement?: boolean;
    skipMySurveys?: boolean;
    skipResponses?: boolean;
}

export const useSurvey = (options: UseSurveyOptions = {}) => {
    const { skipManagement = false, skipMySurveys = false, skipResponses = false } = options;
    const dispatch = useDispatch<AppDispatch>();
    const {
        activeTab,
        selectedSurveyId,
        selectedTemplateId,
        selectedDraftId,
        isDrawerOpen,
        isDeleteModalOpen,
        isDuplicateModalOpen,
        page,
        limit,
        searchQuery,
        statusFilter,
        dateRange,
        mySurveysTab,
        selectedMySurveyId,
        responsesTab,
        selectedResponseId,
        currentQuestionIndex,
        isTakingSurvey,
    } = useSelector((state: RootState) => state.survey);
    const statisticsQuery = useGetSurveyStatisticsQuery(undefined, { skip: skipManagement });

    const templatesQuery = useGetTemplatesQuery(
        { search: searchQuery || undefined },
        { skip: skipManagement || activeTab !== "templates" }
    );

    const draftsQuery = useGetDraftsQuery(
        { search: searchQuery || undefined, page, limit },
        { skip: skipManagement || activeTab !== "drafts" }
    );

    const publishedSurveysQuery = useGetPublishedSurveysQuery(
        {
            search: searchQuery || undefined,
            status: statusFilter || undefined,
            fromDate: dateRange.from || undefined,
            toDate: dateRange.to || undefined,
            page,
            limit,
        },
        { skip: skipManagement || activeTab !== "published" }
    );

    const selectedTemplateQuery = useGetTemplateByIdQuery(selectedTemplateId!, {
        skip: !selectedTemplateId,
    });
    const mySurveysStatsQuery = useGetMySurveysStatsQuery(undefined, { skip: skipMySurveys });

    const mySurveysQuery = useGetMySurveysQuery(
        { status: mySurveysTab !== "all" ? mySurveysTab : undefined },
        { skip: skipMySurveys }
    );

    const surveyInfoQuery = useGetSurveyInfoQuery(selectedMySurveyId!, {
        skip: skipMySurveys || !selectedMySurveyId,
    });

    const surveyDetailsQuery = useGetSurveyDetailsQuery(selectedMySurveyId!, {
        skip: skipMySurveys || !selectedMySurveyId || !isTakingSurvey,
    });

    const myResponseQuery = useGetMyResponseQuery(selectedMySurveyId!, {
        skip: skipMySurveys || !selectedMySurveyId,
    });
    const responsesOverviewStatsQuery = useGetResponsesOverviewStatsQuery(undefined, {
        skip: skipResponses,
    });

    const responsesOverviewQuery = useGetResponsesOverviewQuery(
        { search: searchQuery || undefined, page, pageSize: limit },
        { skip: skipResponses }
    );

    const surveyInsightsQuery = useGetSurveyInsightsQuery(selectedSurveyId!, {
        skip: skipResponses || !selectedSurveyId,
    });

    const completedResponsesQuery = useGetCompletedResponsesQuery(
        { surveyId: selectedSurveyId!, search: searchQuery || undefined, page, pageSize: limit },
        { skip: skipResponses || !selectedSurveyId || responsesTab !== "completed" }
    );

    const pendingResponsesQuery = useGetPendingResponsesQuery(
        {
            surveyId: selectedSurveyId!,
            tab: responsesTab === "notStarted" ? "not_started" : "pending",
            search: searchQuery || undefined,
            page,
            pageSize: limit,
        },
        { skip: skipResponses || !selectedSurveyId || responsesTab === "completed" }
    );

    const [createTemplate, createTemplateState] = useCreateTemplateMutation();
    const [updateTemplate, updateTemplateState] = useUpdateTemplateMutation();
    const [deleteTemplate, deleteTemplateState] = useDeleteTemplateMutation();
    const [duplicateTemplate, duplicateTemplateState] = useDuplicateTemplateMutation();

    // Drafts
    const [createDraft, createDraftState] = useCreateDraftMutation();
    const [updateDraft, updateDraftState] = useUpdateDraftMutation();
    const [deleteDraft, deleteDraftState] = useDeleteDraftMutation();

    // Surveys
    const [toggleSurveyStatus, toggleSurveyStatusState] = useToggleSurveyStatusMutation();
    const [deleteSurvey, deleteSurveyState] = useDeleteSurveyMutation();
    const [publishSurvey, publishSurveyState] = usePublishSurveyMutation();

    // Survey Taking
    const [startSurvey, startSurveyState] = useStartSurveyMutation();
    const [saveAnswer, saveAnswerState] = useSaveAnswerMutation();
    const [saveAnswers, saveAnswersState] = useSaveAnswersMutation();
    const [submitSurvey, submitSurveyState] = useSubmitSurveyMutation();

    // Responses
    // const [sendReminder, sendReminderState] = useSendReminderMutation();

    const actions = {
        // Tab navigation
        setActiveTab: (tab: ManagementTab) => dispatch(setActiveTab(tab)),
        setMySurveysTab: (tab: MySurveysTabType) => dispatch(setMySurveysTab(tab)),
        setResponsesTab: (tab: ResponsesTab) => dispatch(setResponsesTab(tab)),

        // Selection
        selectSurvey: (id: string | null) => dispatch(setSelectedSurveyId(id)),
        selectTemplate: (id: string | null) => dispatch(setSelectedTemplateId(id)),
        selectDraft: (id: string | null) => dispatch(setSelectedDraftId(id)),
        selectMySurvey: (id: string | null) => dispatch(setSelectedMySurveyId(id)),
        selectResponse: (id: string | null) => dispatch(setSelectedResponseId(id)),

        // Modals & Drawers
        openDrawer: () => dispatch(openDrawer()),
        closeDrawer: () => dispatch(closeDrawer()),
        openDeleteModal: (type: "survey" | "template" | "draft", id: string) =>
            dispatch(openDeleteModal({ type, id })),
        closeDeleteModal: () => dispatch(closeDeleteModal()),
        openDuplicateModal: (id: string) => dispatch(openDuplicateModal(id)),
        closeDuplicateModal: () => dispatch(closeDuplicateModal()),

        // Pagination
        setPage: (p: number) => dispatch(setPage(p)),
        setLimit: (l: number) => dispatch(setLimit(l)),

        // Filters
        setSearch: (query: string) => dispatch(setSearchQuery(query)),
        setStatusFilter: (status: 'draft' | 'published' | 'template' | 'inactive' | null) => dispatch(setStatusFilter(status)),
        setDateRange: (range: IDateRange) => dispatch(setDateRange(range)),
        clearFilters: () => dispatch(clearFilters()),

        // Survey Taking
        setQuestionIndex: (index: number) => dispatch(setCurrentQuestionIndex(index)),
        nextQuestion: () => dispatch(goToNextQuestion()),
        prevQuestion: () => dispatch(goToPreviousQuestion()),
        startTaking: (surveyId: string) => dispatch(startTakingSurvey(surveyId)),
        stopTaking: () => dispatch(stopTakingSurvey()),

        // Reset
        reset: () => dispatch(resetSurveyState()),
        resetManagement: () => dispatch(resetManagementState()),
    };

    // =========================================================================
    // LOADING STATE
    // =========================================================================

    const isLoading =
        statisticsQuery.isLoading ||
        templatesQuery.isLoading ||
        draftsQuery.isLoading ||
        publishedSurveysQuery.isLoading ||
        mySurveysQuery.isLoading ||
        createTemplateState.isLoading ||
        updateTemplateState.isLoading ||
        deleteTemplateState.isLoading ||
        createDraftState.isLoading ||
        updateDraftState.isLoading ||
        deleteDraftState.isLoading ||
        publishSurveyState.isLoading ||
        submitSurveyState.isLoading;

    const isMutating =
        createTemplateState.isLoading ||
        updateTemplateState.isLoading ||
        deleteTemplateState.isLoading ||
        duplicateTemplateState.isLoading ||
        createDraftState.isLoading ||
        updateDraftState.isLoading ||
        deleteDraftState.isLoading ||
        toggleSurveyStatusState.isLoading ||
        deleteSurveyState.isLoading ||
        publishSurveyState.isLoading ||
        startSurveyState.isLoading ||
        saveAnswerState.isLoading ||
        saveAnswersState.isLoading ||
        submitSurveyState.isLoading
    // sendReminderState.isLoading;
    return {
        // === UI State ===
        activeTab,
        selectedSurveyId,
        selectedTemplateId,
        selectedDraftId,
        isDrawerOpen,
        isDeleteModalOpen,
        isDuplicateModalOpen,
        page,
        limit,
        searchQuery,
        statusFilter,
        dateRange,
        mySurveysTab,
        selectedMySurveyId,
        responsesTab,
        selectedResponseId,
        currentQuestionIndex,
        isTakingSurvey,

        // === Management Data ===
        statistics: statisticsQuery.data,
        templates: templatesQuery.data,
        drafts: draftsQuery.data,
        publishedSurveys: publishedSurveysQuery.data,
        selectedTemplate: selectedTemplateQuery.data,

        // === My Surveys Data ===
        mySurveysStats: mySurveysStatsQuery.data,
        mySurveys: mySurveysQuery.data,
        surveyInfo: surveyInfoQuery.data,
        surveyDetails: surveyDetailsQuery.data,
        myResponse: myResponseQuery.data,

        // === Responses Data ===
        responsesOverviewStats: responsesOverviewStatsQuery.data,
        responsesOverview: responsesOverviewQuery.data,
        surveyInsights: surveyInsightsQuery.data,
        completedResponses: completedResponsesQuery.data,
        pendingResponses: pendingResponsesQuery.data,

        // === Actions ===
        ...actions,

        // === Mutations ===
        createTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        createDraft,
        updateDraft,
        deleteDraft,
        toggleSurveyStatus,
        deleteSurvey,
        publishSurvey,
        startSurvey,
        saveAnswer,
        saveAnswers,
        submitSurvey,
        // sendReminder,

        // === Loading States ===
        isLoading,
        isMutating,

        // === Query States (for fine-grained control) ===
        queries: {
            statistics: statisticsQuery,
            templates: templatesQuery,
            drafts: draftsQuery,
            publishedSurveys: publishedSurveysQuery,
            selectedTemplate: selectedTemplateQuery,
            mySurveysStats: mySurveysStatsQuery,
            mySurveys: mySurveysQuery,
            surveyInfo: surveyInfoQuery,
            surveyDetails: surveyDetailsQuery,
            myResponse: myResponseQuery,
            responsesOverviewStats: responsesOverviewStatsQuery,
            responsesOverview: responsesOverviewQuery,
            surveyInsights: surveyInsightsQuery,
            completedResponses: completedResponsesQuery,
            pendingResponses: pendingResponsesQuery,
        },

        // === Mutation States (for fine-grained control) ===
        mutations: {
            createTemplate: createTemplateState,
            updateTemplate: updateTemplateState,
            deleteTemplate: deleteTemplateState,
            duplicateTemplate: duplicateTemplateState,
            createDraft: createDraftState,
            updateDraft: updateDraftState,
            deleteDraft: deleteDraftState,
            toggleSurveyStatus: toggleSurveyStatusState,
            deleteSurvey: deleteSurveyState,
            publishSurvey: publishSurveyState,
            startSurvey: startSurveyState,
            saveAnswer: saveAnswerState,
            saveAnswers: saveAnswersState,
            submitSurvey: submitSurveyState,
            // sendReminder: sendReminderState,
        },
    };
};

export const useSurveyManagement = () => {
    return useSurvey({ skipMySurveys: true, skipResponses: true });
};

export const useMySurveys = () => {
    return useSurvey({ skipManagement: true, skipResponses: true });
};

export const useSurveyResponses = () => {
    return useSurvey({ skipManagement: true, skipMySurveys: true });
};
