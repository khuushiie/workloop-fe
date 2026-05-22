import { useGetSignedUrlQuery } from "../apis/uploads.api";

/**
 * Returns a pre-signed URL for a private storage object.
 * Falls back to the original raw URL while the signed URL is loading,
 * or if the raw URL is empty / not from our storage.
 */
export function useSignedUrl(rawUrl: string | null | undefined): string {
  const skip = !rawUrl;
  const { data: signedUrl } = useGetSignedUrlQuery(
    { url: rawUrl ?? "" },
    { skip },
  );
  if (!rawUrl) return "";
  return signedUrl || rawUrl;
}
