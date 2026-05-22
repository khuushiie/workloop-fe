import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { kpiApi } from "../services/kpi";
import { FEATURE_FLAGS } from "../utils/constants";

type FeatureFlags = Record<string, boolean>;

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  isEnabled: (key: string) => boolean;
  reload: () => Promise<void>;
  isDowntime: boolean;
  setServerError: (hasError: boolean) => void;
  isLoading: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(
  undefined
);

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [serverError, setServerError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadFlags = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await kpiApi.getAllFlags();
      const list = Array.isArray(response) ? response : response?.data || [];
      const map: FeatureFlags = {};
      for (const f of list) map[f.key] = !!f.enabled;
      setFlags(map);
      setServerError(false);
      localStorage.setItem("hrms_feature_flags", JSON.stringify(map));
    } catch (e: any) {
      // Check if it's a server error (500+)
      const status = e?.response?.status || e?.status;
      if (status && status >= 500) {
        setServerError(true);
      }
      // fallback to cached flags if API fails
      const cached = localStorage.getItem("hrms_feature_flags");
      if (cached) setFlags(JSON.parse(cached));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // Listen for server errors from API interceptor
  useEffect(() => {
    const handleServerError = () => {
      setServerError(true);
    };

    window.addEventListener("api:server-error", handleServerError);
    return () => {
      window.removeEventListener("api:server-error", handleServerError);
    };
  }, []);

  // Check if downtime should be shown (either via flag or server error)
  const isDowntime = !!flags[FEATURE_FLAGS.SHOW_DOWNTIME] || serverError;

  return (
    <FeatureFlagsContext.Provider
      value={{
        flags,
        isEnabled: (key: string) => !!flags[key],
        reload: loadFlags,
        isDowntime,
        setServerError,
        isLoading,
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx)
    throw new Error("useFeatureFlags must be used within FeatureFlagsProvider");
  return ctx;
};
