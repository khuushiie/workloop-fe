
import { useCallback } from 'react';
import { SurveyInfo } from '../../types';

import { useGetSurveyInfoQuery } from '../../../../store/apis/survey.api';

interface UseSurveyInfoReturn {
  surveyInfo: SurveyInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSurveyInfo = (surveyId: string): UseSurveyInfoReturn => {
  const { data, isLoading, error, refetch: rtqRefetch } = useGetSurveyInfoQuery(
    surveyId,
    { skip: !surveyId }
  );

  const refetch = useCallback(async () => {
    await rtqRefetch();
  }, [rtqRefetch]);

  return {
    surveyInfo: data ?? null,
    isLoading,
    error: error ? 'Failed to load survey information' : null,
    refetch,
  };
};

export default useSurveyInfo;
