import React from "react";
import {
  DatePicker as AntDatePicker,
  DatePickerProps as AntDatePickerProps,
} from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import type { Dayjs } from "dayjs";
import { Calendar, Clock, X } from "lucide-react";

const { RangePicker: AntRangePicker } = AntDatePicker;

export interface CustomDatePickerProps
  extends Omit<AntDatePickerProps, "suffixIcon" | "clearIcon" | "variant"> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  variant?: "default" | "outlined" | "filled";
  customSuffixIcon?: React.ReactNode;
  customClearIcon?: React.ReactNode;
  showTime?: boolean;
  showToday?: boolean;
  disabledDates?: (date: Dayjs) => boolean;
  highlightDates?: string[]; // Array of dates to highlight
  maxDate?: Dayjs;
  minDate?: Dayjs;
}

export interface CustomRangePickerProps
  extends Omit<RangePickerProps, "suffixIcon" | "clearIcon" | "variant"> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  variant?: "default" | "outlined" | "filled";
  customSuffixIcon?: React.ReactNode;
  customClearIcon?: React.ReactNode;
  maxRange?: number; // Maximum number of days that can be selected
  minRange?: number; // Minimum number of days that must be selected
  disabledDates?: (date: Dayjs) => boolean;
  highlightDates?: string[];
  maxDate?: Dayjs;
  minDate?: Dayjs;
}

const handleDateKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(e.key)) return;

  if (e.ctrlKey || e.metaKey) return;

  if (/^[0-9\/\-:]$/.test(e.key)) return;

  e.preventDefault();
};

// Single DatePicker Component
const DatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  error,
  required,
  helperText,
  variant = "default",
  customSuffixIcon,
  customClearIcon,
  showTime = false,
  showToday = true,
  disabledDates,
  highlightDates = [],
  maxDate,
  minDate,
  className = "",
  style = {},
  ...antdProps
}) => {
  const getVariantStyles = () => {
    const variants = {
      default: {
        borderRadius: "8px",
        border: "1px solid var(--color-border-input)",
      },
      outlined: {
        borderRadius: "12px",
        border: "2px solid var(--color-border-input-hover)",
        backgroundColor: "var(--color-bg-hover)",
      },
      filled: {
        borderRadius: "8px",
        backgroundColor: "var(--color-bg-disabled)",
        border: "1px solid transparent",
      },
    };
    return variants[variant];
  };

  const handleDisabledDate = (date: Dayjs) => {
    // Custom disabled dates logic
    if (disabledDates && disabledDates(date)) return true;

    // Max date check
    if (maxDate && date.isAfter(maxDate)) return true;

    // Min date check
    if (minDate && date.isBefore(minDate)) return true;

    return false;
  };

  const variantStyles = getVariantStyles();

  return (
    <div className="custom-date-picker-wrapper">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <AntDatePicker
        showTime={showTime}
        format={antdProps.format || "DD/MM/YYYY"}
        showToday={showToday}
        disabledDate={handleDisabledDate}
        suffixIcon={
          customSuffixIcon ||
          (showTime ? <Clock size={16} /> : <Calendar size={16} />)
        }
        clearIcon={customClearIcon || <X size={14} />}
        placeholder={
          antdProps.placeholder || `Select ${showTime ? "date & time" : "date"}`
        }
        onKeyDown={handleDateKeyDown}
        {...antdProps}
        className={`
          custom-date-picker
          ${error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : ""
          }
          ${className}
        `}
        style={{
          width: "100%",
          height: "40px",
          ...variantStyles,
          ...style,
        }}
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
    </div>
  );
};

// Range DatePicker Component
const RangePicker: React.FC<CustomRangePickerProps> = ({
  label,
  error,
  required,
  helperText,
  variant = "default",
  customSuffixIcon,
  customClearIcon,
  maxRange,
  minRange,
  disabledDates,
  highlightDates = [],
  maxDate,
  minDate,
  className = "",
  style = {},
  ...antdProps
}) => {
  const getVariantStyles = () => {
    const variants = {
      default: {
        borderRadius: "8px",
        border: "1px solid #d9d9d9",
      },
      outlined: {
        borderRadius: "12px",
        border: "2px solid #e8e8e8",
        backgroundColor: "#fafafa",
      },
      filled: {
        borderRadius: "8px",
        backgroundColor: "#f5f5f5",
        border: "1px solid transparent",
      },
    };
    return variants[variant];
  };

  const handleDisabledDate = (date: Dayjs) => {
    // Custom disabled dates logic
    if (disabledDates && disabledDates(date)) return true;

    // Max date check
    if (maxDate && date.isAfter(maxDate)) return true;

    // Min date check
    if (minDate && date.isBefore(minDate)) return true;

    return false;
  };

  const handleCalendarChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) return;

    const [start, end] = dates;
    const diffDays = end.diff(start, "day") + 1;

    // Validate range constraints
    if (maxRange && diffDays > maxRange) {
      // Could show a warning or prevent selection
      console.warn(
        `Selected range (${diffDays} days) exceeds maximum allowed (${maxRange} days)`
      );
    }

    if (minRange && diffDays < minRange) {
      // Could show a warning or prevent selection
      console.warn(
        `Selected range (${diffDays} days) is less than minimum required (${minRange} days)`
      );
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div className="custom-range-picker-wrapper">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <AntRangePicker
        {...antdProps}
        format="DD/MM/YYYY"
        disabledDate={handleDisabledDate}
        onCalendarChange={handleCalendarChange}
        onKeyDown={handleDateKeyDown}
        suffixIcon={customSuffixIcon || <Calendar size={16} />}
        clearIcon={customClearIcon || <X size={14} />}
        className={`
          custom-range-picker
          ${error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : ""
          }
          ${className}
        `}
        style={{
          width: "100%",
          height: "40px",
          ...variantStyles,
          ...style,
        }}
      />

      {/* Range info */}
      {(maxRange || minRange) && (
        <div className="mt-1 text-xs text-slate-500">
          {minRange && maxRange && (
            <span>
              Select between {minRange} and {maxRange} days
            </span>
          )}
          {minRange && !maxRange && (
            <span>Select at least {minRange} days</span>
          )}
          {!minRange && maxRange && <span>Select up to {maxRange} days</span>}
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
    </div>
  );
};

// Export both components
export { DatePicker, RangePicker };
export default DatePicker;
