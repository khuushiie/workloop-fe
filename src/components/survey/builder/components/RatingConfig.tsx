import React from 'react';
import { Star } from 'lucide-react';
import Button from '../../../common/Button';
import { cn } from '../../../../utils/cn';

interface RatingConfigProps {
  maxRating: number;
  onChange: (maxRating: number) => void;
  readOnly?: boolean;
}

const ratingOptions = [3, 4, 5, 6, 7, 8, 9, 10];

const RatingConfig: React.FC<RatingConfigProps> = ({ maxRating, onChange, readOnly = false }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        Rating Scale
      </label>

      {/* Scale Options */}
      <div className="flex flex-wrap gap-2">
        {ratingOptions.map((num) => (
          <Button
            key={num}
            appearance={maxRating === num ? 'primary' : 'secondary'}
            size="small"
            onClick={() => onChange(num)}
            disabled={readOnly}
            className={cn(
              '!px-3 !py-1.5 !rounded-lg !text-sm !font-medium',
              maxRating !== num && '!bg-slate-100 !text-slate-700 hover:!bg-slate-200 !border-slate-100'
            )}
          >
            1-{num}
          </Button>
        ))}
      </div>

      {/* Preview */}
      <div className="pt-2">
        <p className="text-xs text-slate-500 mb-2">Preview:</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: maxRating }, (_, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center justify-center transition-colors',
                'w-8 h-8 rounded-lg',
                i < 3 ? 'text-yellow-400' : 'text-slate-300'
              )}
            >
              <Star
                className="w-5 h-5"
                fill={i < 3 ? 'currentColor' : 'none'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingConfig;
