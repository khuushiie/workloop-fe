import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { transformBackendSurveyToPublished, transformBackendQuestionToFrontend, transformFrontendQuestionToBackend, transformBackendAssigneeToFrontend } from "../../types";
import type {
    ISurveyTemplateListItem as SurveyTemplateListItem,
    ISurveyTemplate as SurveyTemplate,
    ICreateTemplatePayload as CreateTemplatePayload,
    IUpdateTemplatePayload as UpdateTemplatePayload,
    ISurveyDraft as SurveyDraft,
    ICreateDraftPayload as CreateDraftPayload,
    IUpdateDraftPayload as UpdateDraftPayload,
    IPublishedSurvey,
    IMySurvey as MySurvey,
    IMySurveysStats as MySurveysStats,
    ISurveyInfo as SurveyInfo,
    ITakeSurveyData as TakeSurveyData,
    IUserSurveyResponse as UserSurveyResponse,
    ISurveyUserAnswer as UserAnswer,
    ISubmitSurveyPayload as SubmitSurveyPayload,
    IPublishSurveyPayload as PublishSurveyPayload,
    ISurveyStatistics,
    IResponsesOverviewStats,
    IResponseOverviewItem,
    IResponseOverviewParams,
    ICompletedResponse,
    ICompletedResponsesParams,
    IPendingResponse,
    IPendingResponsesParams,
    ISurveyInsights,
    IResponseDetail,
    ISurveyPaginatedResponse as IPaginatedResponse,
    IBackendStatsResponse,
    IBackendResponsesStatsResponse,
    IBackendInsightsStatsResponse,
    IBackendMySurveyItem,
    IBackendDeleteSurveyResponse,
    IBackendResponseDetail,
    IBackendTemplateDropdownItem,
    IBackendSurveyResponse,
    IBackendSurveyListResponse,
    IBackendUpsertSurveyRequest,
    BackendSurveyStatus,
    ISurveyQuestion,
    IBackendSurveyForSubmission,
    IBackendResponsesOverviewItem,
    IBackendSurveyReportRow,
} from "../../types";

interface IApiPaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface ISurveyListParams {
    search?: string;
    status?: 'draft' | 'published' | 'template' | 'inactive';
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface IUpsertSurveyPayload {
    id?: string;
    title: string;
    description?: string;
    questions: ISurveyQuestion[];
    startDate: string;
    endDate: string;
    status: BackendSurveyStatus;
}

function buildQueryString(params: Record<string, unknown>): string {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
            search.set(key, String(value));
        }
    });
    const qs = search.toString();
    return qs ? `?${qs}` : "";
}
export const surveyApi = createApi({
    reducerPath: "surveyApi",
    baseQuery,
    tagTypes: ["Survey", "Template", "Draft", "MySurvey", "Response", "Statistics"],
    keepUnusedDataFor: 60 * 60, // 1 hour cache
    endpoints: (builder) => ({
        /**     
         * GET /v2/surveys
         */
        getSurveys: builder.query<IApiPaginatedResponse<IPublishedSurvey>, ISurveyListParams | void>({
            query: (params = {}) => ({
                url: `/v2/surveys${buildQueryString(params as Record<string, unknown>)}`,
            }),
            transformResponse: (raw: { data?: IBackendSurveyListResponse } & IBackendSurveyListResponse): IApiPaginatedResponse<IPublishedSurvey> => {
                const response = raw.data ?? raw;
                const surveys = response.data ?? [];
                const total = response.total ?? 0;
                const page = response.page ?? 1;
                const limit = response.limit ?? 10;

                return {
                    success: true,
                    data: surveys.map(transformBackendSurveyToPublished),
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "Survey" as const, id: _id })),
                        { type: "Survey", id: "LIST" },
                    ]
                    : [{ type: "Survey", id: "LIST" }],
        }),

        /**
         * GET /v2/surveys/:id
         */
        getSurveyById: builder.query<SurveyTemplate, string>({
            query: (id) => ({ url: `/v2/surveys/${id}` }),
            transformResponse: (raw: { data?: IBackendSurveyResponse } | IBackendSurveyResponse): SurveyTemplate => {
                const survey = (raw as { data?: IBackendSurveyResponse }).data ?? raw as IBackendSurveyResponse;
                const creatorParts = survey.createdBy?.split(' ') ?? ['', ''];

                return {
                    _id: survey._id,
                    name: survey.title,
                    description: survey.description,
                    questions: survey.questions.map((q, i) => transformBackendQuestionToFrontend(q, i)),
                    startTime: survey.startTime,
                    endTime: survey.endTime,
                    assignment: transformBackendAssigneeToFrontend(survey.assignee),
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                    createdBy: {
                        _id: '',
                        firstName: creatorParts[0] ?? '',
                        lastName: creatorParts.slice(1).join(' ') ?? '',
                    },
                };
            },
            providesTags: (_, __, id) => [{ type: "Survey", id }, { type: "Template", id }],
        }),

        /**
         * POST /v2/surveys/upsert
         */
        upsertSurvey: builder.mutation<SurveyTemplate, IUpsertSurveyPayload>({
            query: (payload) => {
                const backendPayload: IBackendUpsertSurveyRequest = {
                    id: payload.id,
                    title: payload.title,
                    description: payload.description,
                    questions: payload.questions.map((q, i) => transformFrontendQuestionToBackend(q, i)),
                    // Assignee is required - default to empty individual assignment
                    assignee: {
                        type: 'individual',
                        value: [],
                    },
                    startTime: payload.startDate,
                    endTime: payload.endDate,
                    status: payload.status,
                };
                return {
                    url: "/v2/surveys/upsert",
                    method: "POST",
                    body: backendPayload,
                };
            },
            transformResponse: (raw: { data?: IBackendSurveyResponse } | IBackendSurveyResponse): SurveyTemplate => {
                const survey = (raw as { data?: IBackendSurveyResponse }).data ?? raw as IBackendSurveyResponse;
                const creatorParts = survey.createdBy?.split(' ') ?? ['', ''];

                return {
                    _id: survey._id,
                    name: survey.title,
                    description: survey.description,
                    questions: survey.questions.map((q, i) => transformBackendQuestionToFrontend(q, i)),
                    assignment: transformBackendAssigneeToFrontend(survey.assignee),
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                    createdBy: {
                        _id: '',
                        firstName: creatorParts[0] ?? '',
                        lastName: creatorParts.slice(1).join(' ') ?? '',
                    },
                };
            },
            invalidatesTags: ["Survey", "Template", "Draft", "Statistics"],
        }),

        /**
         * PATCH /v2/surveys/:id/status-toggle
         */
        toggleSurveyStatus: builder.mutation<void, { id: string; isActive: boolean }>({
            query: ({ id }) => ({
                url: `/v2/surveys/${id}/status-toggle`,
                method: "PATCH",
            }),
            async onQueryStarted({ id, isActive }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    surveyApi.util.updateQueryData("getSurveys", undefined, (draft) => {
                        const survey = draft.data.find((s) => s._id === id);
                        if (survey) survey.isActive = isActive;
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (_, __, { id }) => [{ type: "Survey", id }, "Statistics"],
        }),

        /**
         * POST /v2/surveys/:id/duplicate
         */
        duplicateSurvey: builder.mutation<SurveyTemplate, { id: string; title: string }>({
            query: ({ id, title }) => ({
                url: `/v2/surveys/${id}/duplicate`,
                method: "POST",
                body: { title },
            }),
            transformResponse: (raw: { data?: IBackendSurveyResponse } | IBackendSurveyResponse): SurveyTemplate => {
                const survey = (raw as { data?: IBackendSurveyResponse }).data ?? raw as IBackendSurveyResponse;
                const creatorParts = survey.createdBy?.split(' ') ?? ['', ''];

                return {
                    _id: survey._id,
                    name: survey.title,
                    description: survey.description,
                    questions: survey.questions.map((q, i) => transformBackendQuestionToFrontend(q, i)),
                    assignment: transformBackendAssigneeToFrontend(survey.assignee),
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                    createdBy: {
                        _id: '',
                        firstName: creatorParts[0] ?? '',
                        lastName: creatorParts.slice(1).join(' ') ?? '',
                    },
                };
            },
            invalidatesTags: ["Survey", "Template", "Draft", "Statistics"],
        }),
        /** 
         * GET /v2/surveys?status=template
         */
        getTemplates: builder.query<SurveyTemplateListItem[], { search?: string; page?: number; limit?: number } | void>({
            query: (params = {}) => ({
                url: `/v2/surveys${buildQueryString({ ...params as Record<string, unknown>, status: 'template' })}`,
            }),
            transformResponse: (raw: { data?: IBackendSurveyListResponse } & IBackendSurveyListResponse): SurveyTemplateListItem[] => {
                const response = raw.data ?? raw;
                const surveys = response.data ?? [];

                return surveys.map(survey => ({
                    _id: survey._id,
                    name: survey.title,
                    description: survey.description ?? '',
                    questionCount: survey.questions?.length ?? 0,
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                    createdBy: {
                        _id: '',
                        firstName: survey.createdBy?.split(' ')[0] ?? '',
                        lastName: survey.createdBy?.split(' ').slice(1).join(' ') ?? '',
                    },
                }));
            },
            providesTags: ["Template"],
        }),

        /** 
         * GET /v2/surveys/templates/dropdown
         */
        getTemplatesDropdown: builder.query<IBackendTemplateDropdownItem[], void>({
            query: () => ({ url: '/v2/surveys/templates/dropdown' }),
            transformResponse: (raw: { data?: IBackendTemplateDropdownItem[]; success?: boolean } | IBackendTemplateDropdownItem[]): IBackendTemplateDropdownItem[] => {
                if (Array.isArray(raw)) {
                    return raw;
                }
                return raw.data ?? [];
            },
            providesTags: ["Template"],
        }),

        /** 
         * Uses getSurveyById internally
         */
        getTemplateById: builder.query<SurveyTemplate, string>({
            query: (id) => ({ url: `/v2/surveys/${id}` }),
            transformResponse: (raw: { data?: IBackendSurveyResponse } | IBackendSurveyResponse): SurveyTemplate => {
                const survey = (raw as { data?: IBackendSurveyResponse }).data ?? raw as IBackendSurveyResponse;
                const creatorParts = survey.createdBy?.split(' ') ?? ['', ''];

                return {
                    _id: survey._id,
                    name: survey.title,
                    description: survey.description,
                    questions: survey.questions.map((q, i) => transformBackendQuestionToFrontend(q, i)),
                    startTime: survey.startTime,
                    endTime: survey.endTime,
                    assignment: transformBackendAssigneeToFrontend(survey.assignee),
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                    createdBy: {
                        _id: '',
                        firstName: creatorParts[0] ?? '',
                        lastName: creatorParts.slice(1).join(' ') ?? '',
                    },
                };
            },
            providesTags: (_, __, id) => [{ type: "Template", id }],
        }),

        /** 
         * Create new template (V2 Backend - uses upsert)
         */
        createTemplate: builder.mutation<SurveyTemplate, CreateTemplatePayload>({
            query: (body) => {
                const backendPayload: IBackendUpsertSurveyRequest = {
                    title: body.name,
                    description: body.description,
                    questions: body.questions.map((q, i) => transformFrontendQuestionToBackend(q as ISurveyQuestion, i)),
                    assignee: {
                        type: body.assignment?.entityType ?? 'individual',
                        value: body.assignment?.entityIds ?? [],
                    },
                    startTime: new Date().toISOString(),
                    endTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'template',
                };
                return {
                    url: "/v2/surveys/upsert",
                    method: "POST",
                    body: backendPayload,
                };
            },
            transformResponse: (raw: { data?: IBackendSurveyResponse } | IBackendSurveyResponse): SurveyTemplate => {
                const survey = (raw as { data?: IBackendSurveyResponse }).data ?? raw as IBackendSurveyResponse;
                const creatorParts = survey.createdBy?.split(' ') ?? ['', ''];

                return {
                    _id: survey._id,
                    name: survey.title,
                    description: survey.description,
                    questions: survey.questions.map((q, i) => transformBackendQuestionToFrontend(q, i)),
                    assignment: transformBackendAssigneeToFrontend(survey.assignee),
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                    createdBy: {
                        _id: '',
                        firstName: creatorParts[0] ?? '',
                        lastName: creatorParts.slice(1).join(' ') ?? '',
                    },
                };
            },
            invalidatesTags: ["Template", "Statistics"],
        }),

        /** 
         * Update existing template (V2 Backend - uses upsert)
         */
        updateTemplate: builder.mutation<SurveyTemplate, { id: string; body: UpdateTemplatePayload }>({
            query: ({ id, body }) => {
                const backendPayload: IBackendUpsertSurveyRequest = {
                    id,
                    title: body.name,
                    description: body.description,
                    questions: body.questions.map((q, i) => transformFrontendQuestionToBackend(q as ISurveyQuestion, i)),
                    assignee: {
                        type: body.assignment?.entityType ?? 'individual',
                        value: body.assignment?.entityIds ?? [],
                    },
                    startTime: new Date().toISOString(),
                    endTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'template',
                };
                return {
                    url: "/v2/surveys/upsert",
                    method: "POST",
                    body: backendPayload,
                };
            },
            transformResponse: (raw: { data?: IBackendSurveyResponse } | IBackendSurveyResponse): SurveyTemplate => {
                const survey = (raw as { data?: IBackendSurveyResponse }).data ?? raw as IBackendSurveyResponse;
                const creatorParts = survey.createdBy?.split(' ') ?? ['', ''];

                return {
                    _id: survey._id,
                    name: survey.title,
                    description: survey.description,
                    questions: survey.questions.map((q, i) => transformBackendQuestionToFrontend(q, i)),
                    assignment: transformBackendAssigneeToFrontend(survey.assignee),
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                    createdBy: {
                        _id: '',
                        firstName: creatorParts[0] ?? '',
                        lastName: creatorParts.slice(1).join(' ') ?? '',
                    },
                };
            },
            invalidatesTags: (_, __, { id }) => [{ type: "Template", id }, "Template", "Statistics"],
        }),

        /** Delete template (V2 backend doesn't support delete yet) */
        deleteTemplate: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/v1/survey/templates/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Template", "Statistics"],
        }),

        /** 
         * Duplicate template (V2 Backend)
         * POST /v2/surveys/:id/duplicate
         */
        duplicateTemplate: builder.mutation<SurveyTemplate, { id: string; name: string }>({
            query: ({ id, name }) => ({
                url: `/v2/surveys/${id}/duplicate`,
                method: "POST",
                body: { title: name },
            }),
            transformResponse: (raw: { data?: IBackendSurveyResponse } | IBackendSurveyResponse): SurveyTemplate => {
                const survey = (raw as { data?: IBackendSurveyResponse }).data ?? raw as IBackendSurveyResponse;
                const creatorParts = survey.createdBy?.split(' ') ?? ['', ''];

                return {
                    _id: survey._id,
                    name: survey.title,
                    description: survey.description,
                    questions: survey.questions.map((q, i) => transformBackendQuestionToFrontend(q, i)),
                    assignment: transformBackendAssigneeToFrontend(survey.assignee),
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                    createdBy: {
                        _id: '',
                        firstName: creatorParts[0] ?? '',
                        lastName: creatorParts.slice(1).join(' ') ?? '',
                    },
                };
            },
            invalidatesTags: ["Template", "Draft", "Statistics"],
        }),
        /** 
         * Uses getSurveys with status=draft filter
         */
        getDrafts: builder.query<SurveyDraft[], { search?: string; page?: number; limit?: number } | void>({
            query: (params = {}) => ({
                url: `/v2/surveys${buildQueryString({ ...params as Record<string, unknown>, status: 'draft' })}`,
            }),
            transformResponse: (raw: { data?: IBackendSurveyListResponse } & IBackendSurveyListResponse): SurveyDraft[] => {
                const response = raw.data ?? raw;
                const surveys = response.data ?? [];

                return surveys.map(survey => ({
                    _id: survey._id,
                    title: survey.title,
                    description: survey.description,
                    schedule: {
                        startDate: survey.startTime?.split('T')[0] ?? null,
                        endDate: survey.endTime?.split('T')[0] ?? null,
                        startTime: survey.startTime?.split('T')[1]?.substring(0, 5) ?? null,
                        endTime: survey.endTime?.split('T')[1]?.substring(0, 5) ?? null,
                    },
                    assignment: transformBackendAssigneeToFrontend(survey.assignee),
                    questions: survey.questions.map((q, i) => transformBackendQuestionToFrontend(q, i)),
                    sourceTemplateId: null,
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                }));
            },
            providesTags: ["Draft"],
        }),

        /** 
         * Create new draft (V2 Backend - uses upsert)
         */
        createDraft: builder.mutation<SurveyDraft, CreateDraftPayload>({
            query: (body) => {
                const startTime = body.schedule.startDate && body.schedule.startTime
                    ? `${body.schedule.startDate}T${body.schedule.startTime}:00.000Z`
                    : new Date().toISOString();
                const endTime = body.schedule.endDate && body.schedule.endTime
                    ? `${body.schedule.endDate}T${body.schedule.endTime}:00.000Z`
                    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Default: 7 days from now

                const backendPayload: IBackendUpsertSurveyRequest = {
                    title: body.title,
                    description: body.description,
                    questions: body.questions.map((q, i) => transformFrontendQuestionToBackend(q as ISurveyQuestion, i)),
                    // Assignee is required - use assignment data or default to empty individual
                    assignee: {
                        type: body.assignment?.entityType ?? 'individual',
                        value: body.assignment?.entityIds ?? [],
                    },
                    startTime,
                    endTime,
                    status: 'draft',
                };
                return {
                    url: "/v2/surveys/upsert",
                    method: "POST",
                    body: backendPayload,
                };
            },
            transformResponse: (raw: { data?: IBackendSurveyResponse } | IBackendSurveyResponse): SurveyDraft => {
                const survey = (raw as { data?: IBackendSurveyResponse }).data ?? raw as IBackendSurveyResponse;

                return {
                    _id: survey._id,
                    title: survey.title,
                    description: survey.description,
                    schedule: {
                        startDate: survey.startTime?.split('T')[0] ?? null,
                        endDate: survey.endTime?.split('T')[0] ?? null,
                        startTime: survey.startTime?.split('T')[1]?.substring(0, 5) ?? null,
                        endTime: survey.endTime?.split('T')[1]?.substring(0, 5) ?? null,
                    },
                    assignment: transformBackendAssigneeToFrontend(survey.assignee),
                    questions: survey.questions.map((q, i) => transformBackendQuestionToFrontend(q, i)),
                    sourceTemplateId: null,
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                };
            },
            invalidatesTags: ["Draft", "Statistics"],
        }),

        /** 
         * Update existing draft (V2 Backend - uses upsert)
         */
        updateDraft: builder.mutation<SurveyDraft, { id: string; body: UpdateDraftPayload }>({
            query: ({ id, body }) => {
                const startTime = body.schedule.startDate && body.schedule.startTime
                    ? `${body.schedule.startDate}T${body.schedule.startTime}:00.000Z`
                    : new Date().toISOString();
                const endTime = body.schedule.endDate && body.schedule.endTime
                    ? `${body.schedule.endDate}T${body.schedule.endTime}:00.000Z`
                    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Default: 7 days from now

                const backendPayload: IBackendUpsertSurveyRequest = {
                    id,
                    title: body.title,
                    description: body.description,
                    questions: body.questions.map((q, i) => transformFrontendQuestionToBackend(q as ISurveyQuestion, i)),
                    // Assignee is required - use assignment data or default to empty individual
                    assignee: {
                        type: body.assignment?.entityType ?? 'individual',
                        value: body.assignment?.entityIds ?? [],
                    },
                    startTime,
                    endTime,
                    status: 'draft',
                };
                return {
                    url: "/v2/surveys/upsert",
                    method: "POST",
                    body: backendPayload,
                };
            },
            transformResponse: (raw: { data?: IBackendSurveyResponse } | IBackendSurveyResponse): SurveyDraft => {
                const survey = (raw as { data?: IBackendSurveyResponse }).data ?? raw as IBackendSurveyResponse;

                return {
                    _id: survey._id,
                    title: survey.title,
                    description: survey.description,
                    schedule: {
                        startDate: survey.startTime?.split('T')[0] ?? null,
                        endDate: survey.endTime?.split('T')[0] ?? null,
                        startTime: survey.startTime?.split('T')[1]?.substring(0, 5) ?? null,
                        endTime: survey.endTime?.split('T')[1]?.substring(0, 5) ?? null,
                    },
                    assignment: transformBackendAssigneeToFrontend(survey.assignee),
                    questions: survey.questions.map((q, i) => transformBackendQuestionToFrontend(q, i)),
                    sourceTemplateId: null,
                    createdAt: survey.createdAt,
                    updatedAt: survey.createdAt,
                };
            },
            invalidatesTags: ["Draft", "Statistics"],
        }),

        /** Delete draft (V2 backend doesn't support delete yet) */
        deleteDraft: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/v1/survey/drafts/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Draft", "Statistics"],
        }),
        /** 
         * GET /v2/surveys/stats/management
         */
        getSurveyStatistics: builder.query<ISurveyStatistics, void>({
            query: () => ({ url: "/v2/surveys/stats/management" }),
            transformResponse: (raw: { data?: IBackendStatsResponse } & Partial<IBackendStatsResponse>): ISurveyStatistics => {
                const stats = raw.data ?? raw;
                return {
                    total: stats.totalSurveys ?? 0,
                    published: stats.published ?? 0,
                    drafts: stats.drafts ?? 0,
                    templates: stats.templates ?? 0,
                    active: stats.published ?? 0,
                };
            },
            providesTags: ["Statistics"],
        }),

        /** 
         * GET /v2/surveys with status=published filter
         */
        getPublishedSurveys: builder.query<IApiPaginatedResponse<IPublishedSurvey>, ISurveyListParams | void>({
            query: (params = {}) => ({
                url: `/v2/surveys${buildQueryString({ ...params as Record<string, unknown>, status: params?.status || undefined })}`,
            }),
            transformResponse: (raw: { data?: IBackendSurveyListResponse } & IBackendSurveyListResponse): IApiPaginatedResponse<IPublishedSurvey> => {
                const response = raw.data ?? raw;
                const surveys = response.data ?? [];
                const total = response.total ?? 0;
                const page = response.page ?? 1;
                const limit = response.limit ?? 10;
                const filteredSurveys = surveys.filter(survey =>
                    survey.status === 'published' || survey.status === 'inactive'
                );

                return {
                    success: true,
                    data: filteredSurveys.map(transformBackendSurveyToPublished),
                    pagination: {
                        page,
                        limit,
                        total: total,
                        totalPages: Math.ceil(filteredSurveys.length / limit),
                    },
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: "Survey" as const, id: _id })),
                        { type: "Survey", id: "LIST" },
                    ]
                    : [{ type: "Survey", id: "LIST" }],
        }),

        /** 
         * DELETE /v2/surveys/:id
         */
        deleteSurvey: builder.mutation<IBackendDeleteSurveyResponse, string>({
            query: (id) => ({
                url: `/v2/surveys/${id}`,
                method: "DELETE",
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    surveyApi.util.updateQueryData("getPublishedSurveys", undefined, (draft) => {
                        const idx = draft.data.findIndex((s) => s._id === id);
                        if (idx !== -1) draft.data.splice(idx, 1);
                    })
                );
                const patchResult2 = dispatch(
                    surveyApi.util.updateQueryData("getSurveys", undefined, (draft) => {
                        const idx = draft.data.findIndex((s) => s._id === id);
                        if (idx !== -1) draft.data.splice(idx, 1);
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                    patchResult2.undo();
                }
            },
            invalidatesTags: ["Survey", "Statistics", "Template", "Draft"],
        }),

        /** 
         * Publish a survey (V2 Backend - uses upsert with published status)
         */
        publishSurvey: builder.mutation<{ _id: string; assignedCount: number }, PublishSurveyPayload>({
            query: (body) => {
                const startTime = body.schedule.startDate && body.schedule.startTime
                    ? `${body.schedule.startDate}T${body.schedule.startTime}:00.000Z`
                    : new Date().toISOString();
                const endTime = body.schedule.endDate && body.schedule.endTime
                    ? `${body.schedule.endDate}T${body.schedule.endTime}:00.000Z`
                    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Default: 7 days from now

                const backendPayload: IBackendUpsertSurveyRequest = {
                    title: body.title,
                    description: body.description,
                    questions: body.questions.map((q, i) => transformFrontendQuestionToBackend(q as ISurveyQuestion, i)),
                    assignee: {
                        type: body.assignment?.entityType ?? 'individual',
                        value: body.assignment?.entityIds ?? [],
                    },
                    startTime,
                    endTime,
                    status: 'published',
                };
                return {
                    url: "/v2/surveys/upsert",
                    method: "POST",
                    body: backendPayload,
                };
            },
            transformResponse: (raw: { data?: IBackendSurveyResponse; assignedCount?: number } | IBackendSurveyResponse) => {
                const survey = (raw as { data?: IBackendSurveyResponse }).data ?? raw as IBackendSurveyResponse;
                const assignedCount = (raw as { assignedCount?: number }).assignedCount ?? 0;
                return { _id: survey._id, assignedCount };
            },
            invalidatesTags: ["Survey", "Draft", "Statistics"],
        }),
        /** 
         * GET /v2/surveys/my-surveys/stats
         */
        getMySurveysStats: builder.query<MySurveysStats, void>({
            query: () => ({ url: "/v2/surveys/my-surveys/stats" }),
            transformResponse: (raw: { data?: MySurveysStats } & Partial<MySurveysStats>): MySurveysStats => {
                const stats = raw.data ?? raw;
                return {
                    totalAssigned: stats.totalAssigned ?? 0,
                    completed: stats.completed ?? 0,
                    inProgress: stats.inProgress ?? 0,
                    pending: stats.pending ?? 0,
                };
            },
            providesTags: ["MySurvey"],
        }),

        /** 
         * GET /v2/surveys/my-surveys
         */
        getMySurveys: builder.query<MySurvey[], { status?: string } | void>({
            query: (params = {}) => ({
                url: `/v2/surveys/my-surveys${buildQueryString(params as Record<string, unknown>)}`,
            }),
            transformResponse: (raw: IBackendMySurveyItem[] | { data?: IBackendMySurveyItem[] }): MySurvey[] => {
                const surveys = Array.isArray(raw) ? raw : (raw.data ?? []);

                return surveys.map((item): MySurvey => {
                    let frontendStatus: 'pending' | 'inProgress' | 'completed' | 'overdue' = 'pending';
                    const statusLower = item.status?.toLowerCase() ?? '';
                    if (statusLower.includes('completed')) {
                        frontendStatus = 'completed';
                    } else if (statusLower.includes('progress') || statusLower.includes('in-progress')) {
                        frontendStatus = 'inProgress';
                    } else if (statusLower.includes('pending')) {
                        frontendStatus = 'pending';
                    }

                    const estimatedMinutes = (item.totalQuestionNo ?? 0) * 3;
                    const estimatedTime = estimatedMinutes >= 60
                        ? `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`
                        : `${estimatedMinutes} min`;

                    return {
                        _id: item.survey_id,
                        title: item.title,
                        description: item.description ?? '',
                        status: frontendStatus,
                        questionCount: item.totalQuestionNo ?? 0,
                        estimatedTime,
                        dueDate: item.endTime,
                        responseId: item.response_id || undefined,
                    };
                });
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: "MySurvey" as const, id: _id })),
                        { type: "MySurvey", id: "LIST" },
                    ]
                    : [{ type: "MySurvey", id: "LIST" }],
        }),

        /**
         * Uses GET /v2/surveys/:id/for-submission as the data source
         */
        getSurveyInfo: builder.query<SurveyInfo, string>({
            query: (id) => ({ url: `/v2/surveys/${id}/for-submission` }),
            transformResponse: (raw: { data?: IBackendSurveyForSubmission } | IBackendSurveyForSubmission): SurveyInfo => {
                const data = (raw as { data?: IBackendSurveyForSubmission }).data ?? (raw as IBackendSurveyForSubmission);
                const questions = data.questions ?? [];
                const answeredCount = data.answers?.length ?? 0;
                const totalQuestions = questions.length;
                let progressStatus: 'notStarted' | 'inProgress' | 'completed' = 'notStarted';
                if (data.submittedAt) {
                    progressStatus = 'completed';
                } else if (answeredCount > 0) {
                    progressStatus = 'inProgress';
                }
                const now = new Date();
                const start = data.startTime ? new Date(data.startTime) : null;
                const end = data.endTime ? new Date(data.endTime) : null;
                let surveyStatus: 'active' | 'upcoming' | 'closed' = 'active';
                if (start && now < start) surveyStatus = 'upcoming';
                else if (end && now > end) surveyStatus = 'closed';
                const uniqueTypes = [...new Set(questions.map(q => q.type))];
                const instructions: string[] = [];
                const typeLabels: Record<string, string> = {
                    short_text: 'Text', long_text: 'Text', mcq: 'Multiple Choice',
                    checkbox: 'Checkbox', rating: 'Rating', date: 'Date', number: 'Number', boolean: 'Yes/No',
                };
                const friendlyTypes = uniqueTypes.map(t => typeLabels[t] || t).join(', ');
                instructions.push(
                    `This survey contains ${totalQuestions} question${totalQuestions !== 1 ? 's' : ''} covering: ${friendlyTypes}.`
                );

                const requiredCount = questions.filter(q => q.isRequired).length;
                if (requiredCount > 0) {
                    instructions.push(
                        `${requiredCount} question${requiredCount !== 1 ? 's are' : ' is'} required and must be answered before submission.`
                    );
                }
                instructions.push('Your progress is automatically saved as you answer each question.');
                if (data.endTime) {
                    const dueDate = new Date(data.endTime);
                    const formatted = dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    instructions.push(`Please complete this survey before ${formatted}.`);
                }
                instructions.push('You can navigate between questions using the Previous / Next buttons or the question navigator panel.');

                return {
                    _id: data.surveyId,
                    title: data.title,
                    status: surveyStatus,
                    aboutText: data.description ?? '',
                    instructions,
                    totalQuestions,
                    questionTypes: uniqueTypes.join(', '),
                    dueDate: data.endTime ?? '',
                    endTime: data.endTime ?? '',
                    userProgress: {
                        status: progressStatus,
                        answeredCount,
                        totalQuestions,
                    },
                    isConfidential: false,
                };
            },
            providesTags: (_, __, id) => [{ type: "MySurvey", id }],
        }),

        /**
         * GET /v2/surveys/:id/for-submission
         */
        getSurveyDetails: builder.query<TakeSurveyData, string>({
            query: (id) => ({ url: `/v2/surveys/${id}/for-submission` }),
            transformResponse: (raw: { data?: IBackendSurveyForSubmission } | IBackendSurveyForSubmission): TakeSurveyData => {
                const data = (raw as { data?: IBackendSurveyForSubmission }).data ?? (raw as IBackendSurveyForSubmission);
                const questions = data.questions.map((q, index) => {
                    const mapped = transformBackendQuestionToFrontend(q, index);
                    return {
                        _id: mapped._id!,
                        order: mapped.order,
                        type: mapped.type,
                        text: mapped.text,
                        isRequired: mapped.isRequired,
                        options: mapped.options,
                        maxRating: mapped.maxRating,
                    };
                });
                const savedAnswers: Record<string, string | string[] | number | null> = {};
                data.answers?.forEach((ans) => {
                    const key = ans.questionId;
                    let value: string | string[] | number | null = null;
                    if (ans.value !== undefined && ans.value !== null) {
                        value = ans.value;
                    } else if (ans.numericValue !== undefined && ans.numericValue !== null) {
                        value = ans.numericValue;
                    } else if (ans.BooleanValue !== undefined && ans.BooleanValue !== null) {
                        value = ans.BooleanValue ? "true" : "false";
                    } else if (ans.dateValue) {
                        value = ans.dateValue;
                    } else if (ans.selectedOptionLabel) {
                        value = ans.selectedOptionLabel;
                    }
                    if (key && value !== null) {
                        savedAnswers[key] = value;
                    }
                });
                let lastQuestionIndex = 0;
                questions.forEach((q, index) => {
                    if (savedAnswers[q._id] !== undefined) {
                        lastQuestionIndex = index;
                    }
                });

                return {
                    _id: data.surveyId,
                    title: data.title,
                    totalQuestions: questions.length,
                    questions,
                    savedAnswers: Object.keys(savedAnswers).length > 0 ? savedAnswers : undefined,
                    lastQuestionIndex,
                };
            },
            providesTags: (_, __, id) => [{ type: "MySurvey", id }],
        }),

        /**
         * Uses GET /v2/surveys/:id/for-submission (initialization is implicit)
         */
        startSurvey: builder.mutation<{ responseId: string }, string>({
            query: (id) => ({
                url: `/v2/surveys/${id}/for-submission`,
                method: "GET",
            }),
            transformResponse: () => ({ responseId: '' }),
            invalidatesTags: (_, __, id) => [{ type: "MySurvey", id }],
        }),

        /**
         * Delegates to progress endpoint. Kept for backward compatibility.
         */
        saveAnswer: builder.mutation<void, { surveyId: string; questionId: string; value: unknown }>({
            query: ({ surveyId, questionId, value }) => ({
                url: `/v2/surveys/${surveyId}/progress`,
                method: "POST",
                body: {
                    answers: [{ questionId, value: value as string }],
                },
            }),
        }),

        // Backend resolves in_progress status from MasterConfig automatically
        saveSurveyProgress: builder.mutation<{ message: string; status: string }, { surveyId: string; answers: UserAnswer[] }>({
            query: ({ surveyId, answers }) => ({
                url: `/v2/surveys/${surveyId}/progress`,
                method: "POST",
                body: {
                    answers: answers.map((a) => ({
                        questionId: a.questionId,
                        value: a.value as unknown as string,
                    })),
                },
            }),
            // invalidatesTags: (_, __, { surveyId }) => [{ type: "MySurvey", id: surveyId }],
        }),
        // Backend resolves in_progress status from MasterConfig automatically
        saveAnswers: builder.mutation<{ message: string; status: string }, { surveyId: string; answers: UserAnswer[] }>({
            query: ({ surveyId, answers }) => ({
                url: `/v2/surveys/${surveyId}/save-exit`,
                method: "POST",
                body: {
                    answers: answers.map((a) => ({
                        questionId: a.questionId,
                        value: a.value as unknown as string,
                    })),
                },
            }),
            invalidatesTags: (_, __, { surveyId }) => [{ type: "MySurvey", id: surveyId }],
        }),

        submitSurvey: builder.mutation<{ success: boolean; message: string }, SubmitSurveyPayload>({
            query: ({ surveyId, answers }) => ({
                url: `/v2/surveys/${surveyId}/submit`,
                method: "POST",
                body: {
                    answers: answers.map((a) => ({
                        questionId: a.questionId,
                        value: a.value as unknown as string,
                    })),
                },
            }),
            transformResponse: () => ({ success: true, message: "Survey submitted successfully" }),
            invalidatesTags: [
                { type: "MySurvey", id: "LIST" }
            ]

        }),

        /**
         * Uses GET /v2/surveys/responses/:responseId
         */
        getMyResponse: builder.query<UserSurveyResponse, string>({
            query: (surveyId) => ({ url: `/v2/surveys/responses/${surveyId}` }),
            transformResponse: (raw: IBackendResponseDetail | { data?: IBackendResponseDetail }): UserSurveyResponse => {
                const response = (raw as { data?: IBackendResponseDetail }).data ?? (raw as IBackendResponseDetail);
                const nameParts = (response.employeeName ?? '').split(' ');
                const initials = nameParts.map(p => p[0] ?? '').join('').toUpperCase();

                const resolveOptionLabel = (
                    value: string | string[] | undefined | null,
                    options: Array<{ label: string; value: string }> | undefined,
                    type: string
                ): string => {
                    if (!value) return '';

                    if (Array.isArray(value)) {
                      return value
                        .map(v => resolveOptionLabel(v, options, type))
                        .filter(label => label)
                        .join(', ');
                    }

                    if ((type === 'mcq' || type === 'checkbox') && options?.length) {
                        const exactMatch = options.find(opt => opt.value === value);
                        if (exactMatch) return exactMatch.label;
                        const indexMatch = String(value).match(/^opt-(\d+)$/);
                        if (indexMatch) {
                            const idx = parseInt(indexMatch[1], 10);
                            if (idx >= 0 && idx < options.length) {
                                return options[idx].label;
                            }
                        }
                    }
                    return value;
                };

                return {
                    _id: response._id ?? '',
                    surveyId: response._id ?? '',
                    surveyTitle: response.surveyTitle ?? '',
                    employeeName: response.employeeName ?? '',
                    employeeEmail: '',
                    employeeDepartment: '',
                    employeeInitials: initials,
                    submittedAt: response.submittedAt ?? '',
                    totalQuestions: response.answers?.length ?? 0,
                    answers: response.answers?.map((ans, idx) => {
                        const type = ans.questionDetails?.type ?? 'short_text';
                        const options = ans.questionDetails?.options;
                        return {
                            questionId: ans.questionId,
                            questionNumber: idx + 1,
                            questionText: ans.questionDetails?.questionText ?? '',
                            questionType: type as any,
                            answer: resolveOptionLabel(ans.value ?? '', options, type),
                            maxRating: ans.questionDetails?.maxRating,
                        };
                    }) ?? [],
                };
            },
        }),

        /** 
         * GET /v2/surveys/stats/responses
         */
        getResponsesOverviewStats: builder.query<IResponsesOverviewStats, void>({
            query: () => ({ url: "/v2/surveys/stats/responses" }),
            transformResponse: (raw: { data?: IBackendResponsesStatsResponse } & Partial<IBackendResponsesStatsResponse>): IResponsesOverviewStats => {
                const stats = raw.data ?? raw;
                return {
                    surveysCreated: stats.totalSurveys ?? 0,
                    activeSurveys: stats.activeSurveys ?? 0,
                    completedSurveys: stats.completedSurveys ?? 0,
                };
            },
            providesTags: ["Response"],
        }),
        getResponsesOverview: builder.query<IPaginatedResponse<IResponseOverviewItem>, IResponseOverviewParams | void>({
            query: (rawParams) => {
                const params = rawParams ?? {} as IResponseOverviewParams;
                return {
                    url: `/v2/surveys/responses/all${buildQueryString({
                        search: params.search,
                        status: params.status,
                        fromDate: params.startDate,
                        toDate: params.endDate,
                        page: params.page,
                        limit: params.pageSize,
                    } as Record<string, unknown>)}`,
                };
            },
            transformResponse: (
                raw: any
            ): IPaginatedResponse<IResponseOverviewItem> => {
                const paginatedWrapper = raw?.data ?? raw;
                const isPaginated = !Array.isArray(paginatedWrapper) && 'data' in paginatedWrapper;
                const rawItems: IBackendResponsesOverviewItem[] = isPaginated
                    ? (paginatedWrapper.data ?? [])
                    : (Array.isArray(paginatedWrapper) ? paginatedWrapper : []);

                const now = new Date();

                const items: IResponseOverviewItem[] = rawItems.map((item) => {
                    const completed = item.responsesProgress?.completed ?? 0;
                    const inProgress = item.responsesProgress?.inProgress ?? 0;
                    const pending = item.responsesProgress?.pending ?? 0;
                    const totalFromCounts = completed + inProgress + pending;
                    const assignedToNames = Array.isArray(item.assignedTo) ? item.assignedTo : [];
                    const start = new Date(item.startTime);
                    const end = new Date(item.endTime);
                    let status: 'active' | 'completed' = 'completed';
                    if (item.surveyLifeCycleStatus?.toLowerCase() === 'active' || item.surveyLifeCycleStatus?.toLowerCase() === 'published') {
                        status = (now >= start && now <= end) ? 'active' : 'completed';
                    }

                    return {
                        id: item.surveyId,
                        title: item.title,
                        startDate: item.startTime,
                        endDate: item.endTime,
                        completed,
                        pending: inProgress,
                        notStarted: pending,
                        total: totalFromCounts,
                        status,
                        assignedTo: {
                            type: 'individual' as const,
                            entities: assignedToNames.map((name) => ({ id: '', name: name?.trim() || 'N/A' })),
                            totalCount: assignedToNames.length,
                        },
                    };
                });

                const paginationInfo = isPaginated
                    ? {
                        page: paginatedWrapper.page ?? 1,
                        limit: paginatedWrapper.limit ?? (items.length || 10),
                        total: paginatedWrapper.total ?? items.length,
                        totalPages: paginatedWrapper.totalPages ?? 1,
                    }
                    : {
                        page: 1,
                        limit: items.length || 10,
                        total: items.length,
                        totalPages: 1,
                    };

                return {
                    success: true,
                    data: items,
                    pagination: paginationInfo,
                };
            },
            providesTags: ["Response"],
        }),

        /** 
         * GET /v2/surveys/stats/insights/:id
         */
        getSurveyInsights: builder.query<ISurveyInsights, string>({
            query: (surveyId) => ({ url: `/v2/surveys/stats/insights/${surveyId}` }),
            transformResponse: (raw: { data?: IBackendInsightsStatsResponse } & Partial<IBackendInsightsStatsResponse>): ISurveyInsights => {
                const stats = raw.data ?? raw;
                const totalAssigned = stats.totalAssigned ?? 0;
                const completed = stats.completed ?? 0;
                const completionRate = totalAssigned > 0
                    ? Math.round((completed / totalAssigned) * 100)
                    : 0;

                return {
                    totalAssigned,
                    completed,
                    pending: stats.pending ?? 0,
                    notStarted: stats.notStarted ?? 0,
                    completionRate,
                    surveyTitle: '',
                    startDate: '',
                    endDate: '',
                };
            },
            providesTags: (_, __, id) => [{ type: "Response", id }],
        }),

        /**
         * GET /v2/surveys/:id/responses?status=completed
         */
        getCompletedResponses: builder.query<IPaginatedResponse<ICompletedResponse>, ICompletedResponsesParams>({
            query: ({ surveyId, search, page = 1, pageSize = 10 }) => ({
                url: `/v2/surveys/${surveyId}/responses${buildQueryString({
                    status: 'completed',
                    search,
                    page,
                    limit: pageSize,
                } as Record<string, unknown>)}`,
            }),
            transformResponse: (
                raw: any
            ): IPaginatedResponse<ICompletedResponse> => {
                const paginatedWrapper = raw?.data ?? raw;
                const aggregationResult = paginatedWrapper?.data?.[0];
                const rows: IBackendSurveyReportRow[] = aggregationResult?.paginatedData ?? paginatedWrapper?.data ?? [];

                const items: ICompletedResponse[] = rows.map((row) => ({
                    id: row.responseId ?? row.userId,
                    surveyId: row.surveyId,
                    employee: {
                        id: row.userId,
                        name: row.employeeName || 'N/A',
                        email: '',
                        employeeCode: row.employeeId || '',
                    },
                    reportingManager: row.reportingManager || 'N/A',
                    functionalManager: row.functionalManager || 'N/A',
                    createdAt: row.startTime ?? '',
                    submittedDate: row.submittedAt ?? '',
                    submittedTime: row.submittedAt
                        ? new Date(row.submittedAt).toLocaleTimeString()
                        : '',
                    responseId: row.responseId ?? '',
                }));

                return {
                    success: true,
                    data: items,
                    pagination: {
                        page: paginatedWrapper?.page ?? 1,
                        limit: paginatedWrapper?.limit ?? 10,
                        total: paginatedWrapper?.total ?? 0,
                        totalPages: paginatedWrapper?.totalPages ?? 1,
                    },
                };
            },
            providesTags: (_, __, { surveyId }) => [{ type: "Response", id: surveyId }],
        }),

        /** 
         * GET /v2/surveys/responses/:responseId
         */
        getResponseDetail: builder.query<IResponseDetail, { responseId: string }>({
            query: ({ responseId }) => ({
                url: `/v2/surveys/responses/${responseId}`,
            }),
            transformResponse: (raw: IBackendResponseDetail | { data?: IBackendResponseDetail }): IResponseDetail => {
                const response = (raw as { data?: IBackendResponseDetail }).data ?? raw as IBackendResponseDetail;
                const resolveOptionLabel = (
                    value: string | string[] | undefined | null,
                    options: Array<{ label: string; value: string }> | undefined,
                    type: string
                ): string => {
                    if (!value) return '';

                    if (Array.isArray(value)) {
                      return value
                        .map(v => resolveOptionLabel(v, options, type))
                        .filter(label => label)
                        .join(', ');
                    }

                    if ((type === 'mcq' || type === 'checkbox') && options?.length) {
                        const exactMatch = options.find(opt => opt.value === value);
                        if (exactMatch) return exactMatch.label;
                        const indexMatch = String(value).match(/^opt-(\d+)$/);
                        if (indexMatch) {
                            const idx = parseInt(indexMatch[1], 10);
                            if (idx >= 0 && idx < options.length) {
                                return options[idx].label;
                            }
                        }
                    }
                    return value;
                };

                return {
                    id: response._id,
                    surveyId: response._id,
                    surveyTitle: response.surveyTitle ?? '',
                    employee: {
                        id: '',
                        name: response.employeeName ?? '',
                        email: '',
                        employeeCode: '',
                    },
                    submittedAt: response.submittedAt ?? '',
                    answers: response.answers?.map((ans, idx) => {
                        const type = ans.questionDetails?.type ?? 'short_text';
                        const options = ans.questionDetails?.options;
                        return {
                            questionId: ans.questionId,
                            questionNumber: idx + 1,
                            questionText: ans.questionDetails?.questionText ?? '',
                            questionType: type as any,
                            answer: resolveOptionLabel(ans.value ?? '', options, type),
                            maxRating: ans.questionDetails?.maxRating,
                        };
                    }) ?? [],
                };
            },
        }),

        /**
         * GET /v2/surveys/:id/responses?status=<mapped_status>
         * 
         * Tab mapping:
         *   Frontend 'pending'     → Backend 'in-progress' (users who started but haven't submitted)
         *   Frontend 'not_started' → Backend 'pending'     (users who haven't opened the survey)
         */
        getPendingResponses: builder.query<IPaginatedResponse<IPendingResponse>, IPendingResponsesParams>({
            query: ({ surveyId, tab, search, page = 1, pageSize = 10 }) => {
                // Map frontend tab names to backend currentStatus values
                const backendStatus = tab === 'not_started' ? 'pending' : 'in-progress';
                return {
                    url: `/v2/surveys/${surveyId}/responses${buildQueryString({
                        status: backendStatus,
                        search,
                        page,
                        limit: pageSize,
                    } as Record<string, unknown>)}`,
                };
            },
            transformResponse: (
                raw: any
            ): IPaginatedResponse<IPendingResponse> => {
                const paginatedWrapper = raw?.data ?? raw;
                const aggregationResult = paginatedWrapper?.data?.[0];
                const rows: IBackendSurveyReportRow[] = aggregationResult?.paginatedData ?? paginatedWrapper?.data ?? [];

                const items: IPendingResponse[] = rows.map((row) => ({
                    id: row.responseId ?? row.userId,
                    surveyId: row.surveyId,
                    employee: {
                        id: row.userId,
                        name: row.employeeName || 'N/A',
                        email: '',
                        employeeCode: row.employeeId || '',
                    },
                    reportingManager: row.reportingManager || 'N/A',
                    functionalManager: row.functionalManager || 'N/A',
                    status: row.currentStatus === 'pending' ? 'not_started' : 'pending',
                    assignedDate: row.startTime ?? '',
                    startTime: row.startTime,
                }));

                return {
                    success: true,
                    data: items,
                    pagination: {
                        page: paginatedWrapper?.page ?? 1,
                        limit: paginatedWrapper?.limit ?? 10,
                        total: paginatedWrapper?.total ?? 0,
                        totalPages: paginatedWrapper?.totalPages ?? 1,
                    },
                };
            },
            providesTags: (_, __, { surveyId }) => [{ type: "Response", id: surveyId }],
        }),

        // sendReminder: builder.mutation<void, { surveyId: string; employeeIds: string[] }>({
        //     query: ({ surveyId, employeeIds }) => ({
        //         url: `/api/v1/surveys/${surveyId}/send-reminder`,
        //         method: "POST",
        //         body: { employeeIds },
        //     }),
        //     invalidatesTags: (_, __, { surveyId }) => [{ type: "Response", id: surveyId }],
        // }),

        /** Export survey responses */
        // exportResponses: builder.query<Blob, { surveyId: string; format?: "csv" | "excel" }>({
        //     query: ({ surveyId, format = "excel" }) => ({
        //         url: `/api/v1/surveys/${surveyId}/export?format=${format}`,
        //         responseHandler: (response) => response.blob(),
        //     }),
        // }),
    }),
});
export const {
    useGetSurveysQuery,
    useLazyGetSurveysQuery,
    useGetSurveyByIdQuery,
    useLazyGetSurveyByIdQuery,
    useUpsertSurveyMutation,
    useToggleSurveyStatusMutation,
    useDuplicateSurveyMutation,

    useGetTemplatesQuery,
    useLazyGetTemplatesQuery,
    useGetTemplatesDropdownQuery,
    useLazyGetTemplatesDropdownQuery,
    useGetTemplateByIdQuery,
    useLazyGetTemplateByIdQuery,
    useCreateTemplateMutation,
    useUpdateTemplateMutation,
    useDeleteTemplateMutation,
    useDuplicateTemplateMutation,

    useGetDraftsQuery,
    useLazyGetDraftsQuery,
    useCreateDraftMutation,
    useUpdateDraftMutation,
    useDeleteDraftMutation,

    // Survey Management
    useGetSurveyStatisticsQuery,
    useGetPublishedSurveysQuery,
    useLazyGetPublishedSurveysQuery,
    useDeleteSurveyMutation,
    usePublishSurveyMutation,

    // My Surveys
    useGetMySurveysStatsQuery,
    useGetMySurveysQuery,
    useLazyGetMySurveysQuery,
    useGetSurveyInfoQuery,
    useLazyGetSurveyInfoQuery,
    useGetSurveyDetailsQuery,
    useLazyGetSurveyDetailsQuery,
    useStartSurveyMutation,
    useSaveAnswerMutation,
    useSaveAnswersMutation,
    useSubmitSurveyMutation,
    useSaveSurveyProgressMutation,
    useGetMyResponseQuery,
    useLazyGetMyResponseQuery,

    // Responses
    useGetResponsesOverviewStatsQuery,
    useGetResponsesOverviewQuery,
    useLazyGetResponsesOverviewQuery,
    useGetSurveyInsightsQuery,
    useLazyGetSurveyInsightsQuery,
    useGetCompletedResponsesQuery,
    useLazyGetCompletedResponsesQuery,
    useGetResponseDetailQuery,
    useLazyGetResponseDetailQuery,
    useGetPendingResponsesQuery,
    useLazyGetPendingResponsesQuery,
    // useSendReminderMutation,
    // useLazyExportResponsesQuery,
} = surveyApi;
