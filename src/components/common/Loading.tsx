import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
  centered?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  message = 'Loading...',
  className = '',
  centered = true
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClasses = centered 
    ? 'flex items-center justify-center py-12' 
    : 'flex items-center space-x-3';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex items-center space-x-3">
        <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
        <span className={`text-slate-600 ${textSizeClasses[size]}`}>
          {message}
        </span>
      </div>
    </div>
  );
};

export default Loading;
