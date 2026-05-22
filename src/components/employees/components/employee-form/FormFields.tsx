import React from "react";
import Select, { SelectOption } from "../../../common/Select";

interface BaseFieldProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

interface TextFieldProps extends BaseFieldProps {
  value?: string;
  type?: "text" | "email" | "number" | "date";
  placeholder?: string;
  maxLength?: number;
  min?: number;
  onBlur?: () => void;
  onChange: (value: string) => void;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  required,
  disabled,
  error,
  type = "text",
  placeholder,
  maxLength,
  min,
  onBlur,
  className = "",
}) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <input
      type={type}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      min={type === "number" ? min : undefined}
      disabled={disabled}
      required={required}
      onBlur={onBlur}
      className={`w-full h-10 px-3 text-sm border border-slate-300 rounded-lg transition-all duration-200 placeholder:text-slate-500 ${
        disabled
          ? "bg-slate-100 text-slate-500 cursor-not-allowed"
          : "bg-white text-slate-900 hover:border-slate-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
      }`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);
interface SelectFieldProps extends BaseFieldProps {
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  clearable?: boolean;
  onBlur?: () => void;
  searchable?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  required,
  disabled,
  error,
  clearable,
  searchable,
  onBlur,
  className = "",
}) => (
  <div className={className}>
    <Select
      label={label}
      value={value ?? ""}
      options={options}
      onChange={(next) => onChange(String(next ?? ""))}
      disabled={disabled}
      required={required}
      clearable={clearable}
      searchable={searchable}
      onBlur={onBlur}
      error={error}
      className="w-full"
    />
  </div>
);
