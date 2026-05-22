interface TextAreaProps {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  className?: string;
  value?: string;
  minRows?: number;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  onChange: (value: string) => void;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  placeholder,
  onChange,
  required,
  disabled,
  readOnly,
  error,
  minRows = 3,
  maxLength,
  minLength,
  className = "",
}) => (
  <div className={className}>
    {
      label && 
      <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
      {required && <span className="text-red-500"> *</span>}
      </label>
    }
    <textarea
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      minLength={minLength}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full px-3 py-2 text-sm border border-slate-300 rounded-lg transition-all duration-200${
        disabled
          ? "bg-slate-100 text-slate-500 cursor-not-allowed"
          : "bg-white text-slate-900 hover:border-slate-400 focus:ring-primary-500 focus:border-primary-500"
      }`}
      rows={minRows}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);
