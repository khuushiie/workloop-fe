import React from 'react';
import { TimePicker as AntTimePicker, TimePickerProps as AntTimePickerProps, TimeRangePickerProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Clock, X } from 'lucide-react';

const { RangePicker: AntTimeRangePicker } = AntTimePicker;

export interface CustomTimePickerProps extends Omit<AntTimePickerProps, 'suffixIcon' | 'clearIcon' | 'variant'> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  variant?: 'default' | 'outlined' | 'filled';
  customSuffixIcon?: React.ReactNode;
  customClearIcon?: React.ReactNode;
  showSecond?: boolean;
  use12Hours?: boolean;
  minuteStep?: AntTimePickerProps['minuteStep'];
  hourStep?: AntTimePickerProps['hourStep'];
  secondStep?: AntTimePickerProps['secondStep'];
  disabledHours?: () => number[];
  disabledMinutes?: (selectedHour: number) => number[];
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[];
}

export interface CustomTimeRangePickerProps extends Omit<TimeRangePickerProps, 'suffixIcon' | 'clearIcon' | 'variant'> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  variant?: 'default' | 'outlined' | 'filled';
  customSuffixIcon?: React.ReactNode;
  customClearIcon?: React.ReactNode;
  showSecond?: boolean;
  use12Hours?: boolean;
  minuteStep?: TimeRangePickerProps['minuteStep'];
  hourStep?: TimeRangePickerProps['hourStep'];
  secondStep?: TimeRangePickerProps['secondStep'];
  maxDuration?: number; // Maximum duration in minutes
  minDuration?: number; // Minimum duration in minutes
}

// Single TimePicker Component
const TimePicker: React.FC<CustomTimePickerProps> = ({
  label,
  error,
  required,
  helperText,
  variant = 'default',
  customSuffixIcon,
  customClearIcon,
  showSecond = false,
  use12Hours = false,
  minuteStep = 1,
  hourStep = 1,
  secondStep = 1,
  disabledHours,
  disabledMinutes,
  disabledSeconds,
  className = '',
  style = {},
  ...antdProps
}) => {
  const getVariantStyles = () => {
    const variants = {
      default: {
        borderRadius: '8px',
        border: '1px solid #d9d9d9',
      },
      outlined: {
        borderRadius: '12px',
        border: '2px solid #e8e8e8',
        backgroundColor: '#fafafa',
      },
      filled: {
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
        border: '1px solid transparent',
      },
    };
    return variants[variant];
  };

  const formatTime = use12Hours ? 'h:mm A' : 'HH:mm';
  const formatWithSeconds = use12Hours ? 'h:mm:ss A' : 'HH:mm:ss';

  const variantStyles = getVariantStyles();

  return (
    <div className="custom-time-picker-wrapper">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <AntTimePicker
        {...antdProps}
        showSecond={showSecond}
        use12Hours={use12Hours}
        minuteStep={minuteStep}
        hourStep={hourStep}
        secondStep={secondStep}
        disabledHours={disabledHours}
        disabledMinutes={disabledMinutes}
        disabledSeconds={disabledSeconds}
        format={showSecond ? formatWithSeconds : formatTime}
        suffixIcon={customSuffixIcon || <Clock size={16} />}
        clearIcon={customClearIcon || <X size={14} />}
        className={`
          custom-time-picker
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        style={{
          width: '100%',
          height: '40px',
          ...variantStyles,
          ...style,
        }}
        placeholder={antdProps.placeholder || 'Select time'}
      />

      {/* Helper text or error message */}
      {(error || helperText) && (
        <div className="mt-1">
          {error ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <X size={14} />
              {error}
            </p>
          ) : (
            <p className="text-sm text-slate-500">{helperText}</p>
          )}
        </div>
      )}

      {/* Custom styles */}
      <style>{`
        .custom-time-picker:hover {
          border-color: #40a9ff;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.1);
        }

        .custom-time-picker:focus,
        .custom-time-picker.ant-picker-focused {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          outline: none;
        }

        .custom-time-picker.border-red-500:focus {
          border-color: #f5222d;
          box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
        }
      `}</style>
    </div>
  );
};

// Time Range Picker Component
const TimeRangePicker: React.FC<CustomTimeRangePickerProps> = ({
  label,
  error,
  required,
  helperText,
  variant = 'default',
  customSuffixIcon,
  customClearIcon,
  showSecond = false,
  use12Hours = false,
  minuteStep = 1,
  hourStep = 1,
  secondStep = 1,
  maxDuration,
  minDuration,
  className = '',
  style = {},
  onChange,
  ...antdProps
}) => {
  const getVariantStyles = () => {
    const variants = {
      default: {
        borderRadius: '8px',
        border: '1px solid #d9d9d9',
      },
      outlined: {
        borderRadius: '12px',
        border: '2px solid #e8e8e8',
        backgroundColor: '#fafafa',
      },
      filled: {
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
        border: '1px solid transparent',
      },
    };
    return variants[variant];
  };

  const handleTimeChange = (times: [Dayjs | null, Dayjs | null] | null, timeStrings: [string, string]) => {
    if (times && times[0] && times[1]) {
      const [start, end] = times;
      const durationMinutes = end.diff(start, 'minute');
      
      // Validate duration constraints
      if (maxDuration && durationMinutes > maxDuration) {
        console.warn(`Selected duration (${durationMinutes} minutes) exceeds maximum allowed (${maxDuration} minutes)`);
      }
      
      if (minDuration && durationMinutes < minDuration) {
        console.warn(`Selected duration (${durationMinutes} minutes) is less than minimum required (${minDuration} minutes)`);
      }
    }
    
    onChange?.(times, timeStrings);
  };

  const formatTime = use12Hours ? 'h:mm A' : 'HH:mm';
  const formatWithSeconds = use12Hours ? 'h:mm:ss A' : 'HH:mm:ss';

  const variantStyles = getVariantStyles();

  return (
    <div className="custom-time-range-picker-wrapper">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <AntTimeRangePicker
        {...antdProps}
        showSecond={showSecond}
        use12Hours={use12Hours}
        minuteStep={minuteStep}
        hourStep={hourStep}
        secondStep={secondStep}
        format={showSecond ? formatWithSeconds : formatTime}
        suffixIcon={customSuffixIcon || <Clock size={16} />}
        clearIcon={customClearIcon || <X size={14} />}
        onChange={handleTimeChange}
        className={`
          custom-time-range-picker
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        style={{
          width: '100%',
          height: '40px',
          ...variantStyles,
          ...style,
        }}
      />

      {/* Duration info */}
      {(maxDuration || minDuration) && (
        <div className="mt-1 text-xs text-slate-500">
          {minDuration && maxDuration && (
            <span>Duration: {minDuration} - {maxDuration} minutes</span>
          )}
          {minDuration && !maxDuration && (
            <span>Minimum duration: {minDuration} minutes</span>
          )}
          {!minDuration && maxDuration && (
            <span>Maximum duration: {maxDuration} minutes</span>
          )}
        </div>
      )}

      {/* Helper text or error message */}
      {(error || helperText) && (
        <div className="mt-1">
          {error ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <X size={14} />
              {error}
            </p>
          ) : (
            <p className="text-sm text-slate-500">{helperText}</p>
          )}
        </div>
      )}

      {/* Custom styles */}
      <style>{`
        .custom-time-range-picker:hover {
          border-color: #40a9ff;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.1);
        }

        .custom-time-range-picker:focus,
        .custom-time-range-picker.ant-picker-focused {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          outline: none;
        }

        .custom-time-range-picker.border-red-500:focus {
          border-color: #f5222d;
          box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
        }
      `}</style>
    </div>
  );
};

// Export both components
export { TimePicker, TimeRangePicker };
export default TimePicker;
