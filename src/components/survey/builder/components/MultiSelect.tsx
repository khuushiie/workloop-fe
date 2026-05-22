import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { SelectOption } from '../../../common/Select';
import { Select } from '../../../common';

interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  filterLocally?: boolean;
  maxTagCount?: number;
  className?: string;
  error?: string;
  chipsOutside?: boolean;
  selectMaxWidth?: string;
  alwaysShowPlaceholder?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  loading = false,
  disabled = false,
  searchValue: controlledSearchValue,
  onSearchChange,
  showSearch = true,
  filterLocally = true,
  className,
  error,
  chipsOutside = false,
  selectMaxWidth = '280px',
  alwaysShowPlaceholder = true,
}) => {
  const [internalSearchValue, setInternalSearchValue] = useState('');

  const searchValue = controlledSearchValue ?? internalSearchValue;
  //A simple dictionary to remember labels
  const labelCache = useRef<Record<string, string>>({});

  // Update the dictionary every time options change
  useEffect(() => {
    options.forEach(opt => {
      labelCache.current[String(opt.value)] = opt.label;
    });
  }, [options]);

  const handleSearchChange = useCallback((term: string) => {
    if (controlledSearchValue === undefined) {
      setInternalSearchValue(term);
    }
    onSearchChange?.(term);
  }, [controlledSearchValue, onSearchChange]);
  const filteredOptions = useMemo(() => {
    if (!filterLocally || !searchValue.trim()) {
      return options;
    }
    const lowerSearch = searchValue.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(lowerSearch)
    );
  }, [options, searchValue, filterLocally,value]);

  const getLabelForValue = (val: string) => {
    return labelCache.current[val] || options.find(opt => String(opt.value) === val)?.label || val;
  };
  const handleRemoveChip = (valueToRemove: string) => {
    if (disabled) return;
    onChange(value.filter(v => v !== valueToRemove));
  };

  // Handle selection change from common Select
  const handleChange = (
    newValue: string | number | (string | number)[]
  ) => {
    // Common Select returns array for multiple mode
    const values = Array.isArray(newValue)
      ? newValue.map(v => String(v))
      : [];
    onChange(values);

    // Clear the search input
    if (controlledSearchValue === undefined) {
      setInternalSearchValue(''); // Clears uncontrolled search
    }
    onSearchChange?.(''); // Tells the parent to clear controlled search
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(chipsOutside && 'flex flex-col gap-3')}>
        {/* Select Component using common Select */}
        <div style={{ maxWidth: chipsOutside ? selectMaxWidth : undefined }}>
          <Select
            options={filteredOptions}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            loading={loading}
            searchable={showSearch}
            multiple={true}
            clearable={!chipsOutside}
            onSearch={handleSearchChange}
            error={error && !chipsOutside ? error : undefined}
          />
        </div>

        {/* Chips rendered outside (below select) */}
        {chipsOutside && value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((val) => (
              <span
                key={val}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1',
                  'bg-primary-50 text-primary-700 rounded-lg text-sm font-medium',
                  'border border-primary-200 transition-colors',
                  'hover:bg-primary-100',
                  disabled && 'opacity-60 cursor-not-allowed'
                )}
              >
                <span className="max-w-[200px] truncate">{getLabelForValue(val)}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveChip(val)}
                    className="p-0.5 rounded-full hover:bg-primary-200 focus:outline-none transition-colors"
                    aria-label={`Remove ${getLabelForValue(val)}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {chipsOutside && error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default MultiSelect;
