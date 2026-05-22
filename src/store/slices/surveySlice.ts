import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export type ManagementTab = "published" | "drafts" | "templates";
export type MySurveysTab = "pending" | "inProgress" | "completed" | "all";
export type ResponsesTab = "completed" | "pending" | "notStarted";

export interface IDateRange {
    from: string | null;
    to: string | null;
}

export interface ISurveyState {
    activeTab: ManagementTab;
    selectedSurveyId: string | null;
    selectedTemplateId: string | null;
    selectedDraftId: string | null;
    isDrawerOpen: boolean;
    isDeleteModalOpen: boolean;
    isDuplicateModalOpen: boolean;
    page: number;
    limit: number;
    searchQuery: string;
    statusFilter: 'draft' | 'published' | 'template' | 'inactive' | null;
    dateRange: IDateRange;
    mySurveysTab: MySurveysTab;
    selectedMySurveyId: string | null;
    responsesTab: ResponsesTab;
    selectedResponseId: string | null;
    currentQuestionIndex: number;
    isTakingSurvey: boolean;
}

const initialState: ISurveyState = {
    activeTab: "published",
    selectedSurveyId: null,
    selectedTemplateId: null,
    selectedDraftId: null,
    isDrawerOpen: false,
    isDeleteModalOpen: false,
    isDuplicateModalOpen: false,
    page: 1,
    limit: 10,
    searchQuery: "",
    statusFilter: null,
    dateRange: { from: null, to: null },

    mySurveysTab: "all",
    selectedMySurveyId: null,
    responsesTab: "completed",
    selectedResponseId: null,
    currentQuestionIndex: 0,
    isTakingSurvey: false,
};
// SLICE
// ============================================================================

const surveySlice = createSlice({
    name: "survey",
    initialState,
    reducers: {
        // === TAB NAVIGATION ===
        setActiveTab(state, action: PayloadAction<ManagementTab>) {
            state.activeTab = action.payload;
            state.page = 1;
            state.selectedSurveyId = null;
            state.selectedTemplateId = null;
            state.selectedDraftId = null;
        },

        setMySurveysTab(state, action: PayloadAction<MySurveysTab>) {
            state.mySurveysTab = action.payload;
        },

        setResponsesTab(state, action: PayloadAction<ResponsesTab>) {
            state.responsesTab = action.payload;
        },

        // === SELECTION ===
        setSelectedSurveyId(state, action: PayloadAction<string | null>) {
            state.selectedSurveyId = action.payload;
        },

        setSelectedTemplateId(state, action: PayloadAction<string | null>) {
            state.selectedTemplateId = action.payload;
        },

        setSelectedDraftId(state, action: PayloadAction<string | null>) {
            state.selectedDraftId = action.payload;
        },

        setSelectedMySurveyId(state, action: PayloadAction<string | null>) {
            state.selectedMySurveyId = action.payload;
        },

        setSelectedResponseId(state, action: PayloadAction<string | null>) {
            state.selectedResponseId = action.payload;
        },

        // === MODALS & DRAWERS ===
        openDrawer(state) {
            state.isDrawerOpen = true;
        },

        closeDrawer(state) {
            state.isDrawerOpen = false;
            // Clear selections when closing drawer
            state.selectedSurveyId = null;
            state.selectedTemplateId = null;
            state.selectedDraftId = null;
        },

        openDeleteModal(state, action: PayloadAction<{ type: "survey" | "template" | "draft"; id: string }>) {
            state.isDeleteModalOpen = true;
            if (action.payload.type === "survey") state.selectedSurveyId = action.payload.id;
            if (action.payload.type === "template") state.selectedTemplateId = action.payload.id;
            if (action.payload.type === "draft") state.selectedDraftId = action.payload.id;
        },

        closeDeleteModal(state) {
            state.isDeleteModalOpen = false;
        },

        openDuplicateModal(state, action: PayloadAction<string>) {
            state.isDuplicateModalOpen = true;
            state.selectedTemplateId = action.payload;
        },

        closeDuplicateModal(state) {
            state.isDuplicateModalOpen = false;
            state.selectedTemplateId = null;
        },

        // === PAGINATION ===
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },

        setLimit(state, action: PayloadAction<number>) {
            state.limit = action.payload;
            state.page = 1; // Reset to first page when changing limit
        },

        setPagination(state, action: PayloadAction<{ page: number; limit: number }>) {
            state.page = action.payload.page;
            state.limit = action.payload.limit;
        },

        // === FILTERS ===
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
            state.page = 1; // Reset to first page when searching
        },

        setStatusFilter(state, action: PayloadAction<'draft' | 'published' | 'template' | 'inactive' | null>) {
            state.statusFilter = action.payload;
            state.page = 1;
        },

        setDateRange(state, action: PayloadAction<IDateRange>) {
            state.dateRange = action.payload;
            state.page = 1;
        },

        clearFilters(state) {
            state.searchQuery = "";
            state.statusFilter = null;
            state.dateRange = { from: null, to: null };
            state.page = 1;
        },

        // === SURVEY TAKING ===
        setCurrentQuestionIndex(state, action: PayloadAction<number>) {
            state.currentQuestionIndex = action.payload;
        },

        goToNextQuestion(state) {
            state.currentQuestionIndex += 1;
        },

        goToPreviousQuestion(state) {
            if (state.currentQuestionIndex > 0) {
                state.currentQuestionIndex -= 1;
            }
        },

        startTakingSurvey(state, action: PayloadAction<string>) {
            state.isTakingSurvey = true;
            state.selectedMySurveyId = action.payload;
            state.currentQuestionIndex = 0;
        },

        stopTakingSurvey(state) {
            state.isTakingSurvey = false;
            state.currentQuestionIndex = 0;
        },

        // === RESET ===
        resetSurveyState() {
            return initialState;
        },

        resetManagementState(state) {
            state.activeTab = "published";
            state.selectedSurveyId = null;
            state.selectedTemplateId = null;
            state.selectedDraftId = null;
            state.isDrawerOpen = false;
            state.page = 1;
            state.searchQuery = "";
            state.statusFilter = null;
            state.dateRange = { from: null, to: null };
        },
    },
});

export const {
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
    setPagination,
    setSearchQuery,
    setStatusFilter,
    setDateRange,
    clearFilters,

    // Survey Taking
    setCurrentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,
    startTakingSurvey,
    stopTakingSurvey,

    // Reset
    resetSurveyState,
    resetManagementState,
} = surveySlice.actions;

export default surveySlice.reducer;
