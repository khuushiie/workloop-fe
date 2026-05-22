
import React from "react";
import DatePicker from "../common/DatePicker";
import FilterWrapper from "../common/FilterWrapper";
import dayjs from "dayjs";
import Select from "../common/Select";
import SearchInput from "../common/SearchInput";

interface ResourceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;

  resourceIds: string[];
  onResourceChange: (ids: string[]) => void;

  isAllocated: string;
  onAllocatedChange: (value: string) => void;

  resourcesList: Array<{ label: string; value: string }>;

  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  search,
  onSearchChange,

  resourceIds,
  onResourceChange,
  resourcesList,

  isAllocated, 
  onAllocatedChange,

  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {

  const ALLOCATED_OPTIONS = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' }
  ];


  return (
    <FilterWrapper>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full items-end">

        {/* SEARCH BY PROJECT NAME OR CLIENT NAME */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Search Project / Client
          </label>
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search by project or client"
          />
        </div>

        {/* MULTI-SELECT RESOURCE DROPDOWN */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Select Resources
          </label>
          <Select
            value={resourceIds}
            onChange={(val: any) => onResourceChange(val)}
            options={resourcesList}
            multiple
            searchable
            placeholder="Select resources"
            clearable
          />
        </div>

        {/* IS ALLOCATED - Now with Yes/No options */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Allocated
          </label>
          <Select
            value={isAllocated}
            onChange={(val: any) => onAllocatedChange(val)}
            options={ALLOCATED_OPTIONS}
            placeholder="Select allocation"
            clearable
          />
        </div>

        {/* START DATE PICKER */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-700 mb-1">
            Start Date
          </label>
          <DatePicker
            className="w-full"
            value={startDate ? dayjs(startDate) : null}
            onChange={(d) => onStartDateChange(d ? d.format('YYYY-MM-DD') : "")}
            format="DD/MM/YYYY"
          />
        </div>

        {/* END DATE PICKER */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-700 mb-1">
            End Date
          </label>
          <DatePicker
            className="w-full"
            value={endDate ? dayjs(endDate) : null}
            onChange={(d) => onEndDateChange(d ? d.format('YYYY-MM-DD') : "")}
            format="DD/MM/YYYY"
          />
        </div>
      </div>
    </FilterWrapper>
  );
};

export default ResourceFilters;
