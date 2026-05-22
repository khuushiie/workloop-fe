import React from "react";

export interface RadioOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface RadioButtonProps {
  name: string;
  options: RadioOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean; // ✅ added
  direction?: "row" | "column";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  error,
  disabled = false,
  required = false, // ✅ added
  direction = "row",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const gapClasses = {
    sm: "gap-2 text-sm",
    md: "gap-3 text-sm",
    lg: "gap-3 text-base",
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-4">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Radio Group */}
      <div
        className={`flex ${
          direction === "row"
            ? "flex-wrap items-center gap-4"
            : "flex-col gap-2"
        }`}
      >
        {options.map((option) => {
          const isDisabled = disabled || option.disabled;
          const checked =
            value !== undefined
              ? value === option.value
              : defaultValue === option.value;

          return (
            <label
              key={option.value}
              className={`flex items-center cursor-pointer ${
                gapClasses[size]
              } ${
                isDisabled
                  ? "cursor-not-allowed text-slate-400"
                  : "text-slate-700"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={isDisabled}
                required={required} // ✅ logic
                onChange={() => onChange?.(option.value)}
                className="sr-only"
              />

              {/* Custom Radio */}
              <span
                className={`
                  flex items-center justify-center rounded-full border transition-all
                  ${sizeClasses[size]}
                  ${
                    checked
                      ? "border-primary bg-primary"
                      : "border-slate-400 bg-white"
                  }
                  ${isDisabled ? "opacity-50" : ""}
                `}
              >
                {checked && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </span>

              {/* Option Label */}
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-1 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default RadioButton;
