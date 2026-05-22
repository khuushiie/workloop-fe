import React, { useState, memo, useEffect } from "react";
import { Search, AlertCircle } from "lucide-react";
import { useDebounce } from "../../utils/debounce";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  debounceDelay?: number;
}

const validateSearchInput = (
  input: string
): { isValid: boolean; error?: string } => {
  if (!input.trim()) {
    return { isValid: true };
  }

  if (input.length > 100) {
    return {
      isValid: false,
      error: "Search term must be 100 characters or less",
    };
  }

  return { isValid: true };
};

const SearchInput: React.FC<SearchInputProps> = memo(
  ({
    value,
    onChange,
    placeholder = "Search...",
    label,
    className = "",
    debounceDelay,
  }) => {
    const [validationError, setValidationError] = useState<string>("");
    const [internalValue, setInternalValue] = useState<string>(value);

    const debouncedValue = useDebounce(internalValue, debounceDelay || 0);

    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    useEffect(() => {
      if (debounceDelay && debouncedValue !== value) {
        const validation = validateSearchInput(debouncedValue);
        if (validation.isValid) {
          setValidationError("");
          onChange(debouncedValue);
        } else {
          setValidationError(validation.error || "");
        }
      }
    }, [debouncedValue, debounceDelay, onChange, value]);

    const handleInputChange = (newValue: string) => {
      const validation = validateSearchInput(newValue);
      setInternalValue(newValue);

      if (!debounceDelay) {
        if (validation.isValid) {
          setValidationError("");
          onChange(newValue);
        } else {
          setValidationError(validation.error || "");
          onChange(newValue);
        }
      } else {
        if (!validation.isValid) {
          setValidationError(validation.error || "");
        } else {
          setValidationError("");
        }
      }
    };

    return (
      <div className={`bg-white rounded-lg ${className}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={internalValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              className={`w-full pl-8 pr-4 h-10 text-sm border rounded-lg transition-all duration-200 placeholder:text-slate-500 ${
                validationError
                  ? "border-red-300 hover:border-red-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 hover:border-slate-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              }`}
              maxLength={100}
            />
            {validationError && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
            )}
          </div>
        </div>
        {validationError && (
          <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationError}
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
