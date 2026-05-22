import React from 'react';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';

interface FeatureFlagRouteProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FeatureFlagRoute: React.FC<FeatureFlagRouteProps> = ({ 
  featureKey, 
  children, 
  fallback = null 
}) => {
  const { isEnabled } = useFeatureFlags();
  
  if (!isEnabled(featureKey)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default FeatureFlagRoute;
