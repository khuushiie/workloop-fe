import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

/** Response from POST /v2/files/upload (profile image) */
export interface IUploadProfileImageResult {
  message: string;
  /** Permanent storage URL (store in DB) */
  fileUrl: string;
  /** Temporary signed URL for immediate display (expires in 1 hour) */
  signedUrl: string;
}

/** Response from GET /v2/files/documents (quick links / document list) */
export interface IGetDocumentsResult {
  success: boolean;
  count: number;
  data: string[];
}

export const uploadsApi = createApi({
  reducerPath: "uploadsApi",
  baseQuery,
  tagTypes: ["Documents"],
  endpoints: (builder) => ({
    /** Upload organization logo for onboarding. Returns fileUrl to save in organization record. */
    uploadOrganizationLogo: builder.mutation<
      IUploadProfileImageResult,
      { file: File }
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("logo", file);
        return {
          url: "/v2/files/upload/organization-logo",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (raw: unknown): IUploadProfileImageResult => {
        const res = raw as { data?: IUploadProfileImageResult };
        return (res?.data?.fileUrl != null ? res.data : res) as IUploadProfileImageResult;
      },
    }),

    /** Upload profile image. Returns public URL. Pass userId so key is profile_images/{userId}.{ext} (re-upload overwrites). */
    uploadProfileImage: builder.mutation<
      IUploadProfileImageResult,
      { file: File; userId?: string }
    >({
      query: ({ file, userId }) => {
        const formData = new FormData();
        formData.append("profilePic", file);
        const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
        return {
          url: `/v2/files/upload${qs}`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (raw: unknown): IUploadProfileImageResult => {
        const res = raw as { data?: IUploadProfileImageResult };
        return (res?.data?.fileUrl != null ? res.data : res) as IUploadProfileImageResult;
      },
    }),

    /** Get document list for quick links from backend (S3/GCS per STORAGE_PROVIDER). Optional prefix (default "Documents"). */
    getDocuments: builder.query<IGetDocumentsResult, { prefix?: string } | void>({
      query: (params) => {
        const prefix = params?.prefix ?? "Documents";
        return { url: `/v2/files/documents?prefix=${encodeURIComponent(prefix)}` };
      },
      transformResponse: (raw: unknown): IGetDocumentsResult => {
        const body = raw as Record<string, unknown> | null | undefined;
        if (!body || typeof body !== "object") return { success: true, count: 0, data: [] };
        const inner = Array.isArray(body.data) ? body : (body.data as Record<string, unknown>);
        const list = Array.isArray(inner?.data) ? inner.data as string[] : [];
        return {
          success: inner?.success !== false,
          count: typeof inner?.count === "number" ? inner.count : list.length,
          data: list,
        };
      },
      providesTags: (_, __, arg) => [
        { type: "Documents", id: arg?.prefix ?? "list" },
      ],
    }),

    /** Get a pre-signed URL for a private storage object. Pass the stored URL (e.g. profilePic). */
    getSignedUrl: builder.query<string, { url?: string; key?: string }>({
      query: (params) => {
        const qs = params.key
          ? `key=${encodeURIComponent(params.key)}`
          : `url=${encodeURIComponent(params.url ?? "")}`;
        return { url: `/v2/files/signed-url?${qs}` };
      },
      transformResponse: (raw: unknown): string => {
        const res = raw as { url?: string; data?: { url?: string } };
        return res?.data?.url ?? res?.url ?? "";
      },
    }),

    /** Upload image for email template builder. Returns fileUrl/signedUrl. */
    uploadEmailTemplateImage: builder.mutation<
      IUploadProfileImageResult,
      { file: File }
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("image", file);
        return {
          url: "/v2/files/upload/email-template-image",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (raw: unknown): IUploadProfileImageResult => {
        const res = raw as { data?: IUploadProfileImageResult };
        return (res?.data?.fileUrl != null
          ? res.data
          : res) as IUploadProfileImageResult;
      },
    }),

    /** Download a file by storage key (e.g. "Documents/policy.pdf"). Returns blob for saving. */
    downloadDocument: builder.mutation<Blob, string>({
      query: (fileName) => ({
        url: "/v2/files/download",
        method: "POST",
        body: { fileName },
        responseHandler: async (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useUploadOrganizationLogoMutation,
  useUploadProfileImageMutation,
  useUploadEmailTemplateImageMutation,
  useGetSignedUrlQuery,
  useGetDocumentsQuery,
  useLazyGetDocumentsQuery,
  useDownloadDocumentMutation,
} = uploadsApi;
