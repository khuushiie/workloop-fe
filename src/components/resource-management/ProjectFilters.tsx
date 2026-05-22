import React from "react";
import DatePicker from "../common/DatePicker";
import FilterWrapper from "../common/FilterWrapper";
import dayjs from "dayjs";
import Select from "../common/Select";
import SearchInput from "../common/SearchInput";

interface ProjectFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;

  domains: Array<{ label: string; value: string }>;
  selectedDomain: string;
  onDomainChange: (value: string) => void;

  statuses: Array<{ label: string; value: string }>
  selectedStatus: string;
  onStatusChange: (value: string) => void;

  fromDate: string;
  onFromDateChange: (value: string) => void;

  toDate: string;
  onToDateChange: (value: string) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  searchTerm,
  onSearchChange,

  domains,
  selectedDomain,
  onDomainChange,

  statuses,
  selectedStatus,
  onStatusChange,

  fromDate,
  onFromDateChange,

  toDate,
  onToDateChange,
}) => {
  return (
    <FilterWrapper>
      <div className="flex flex-wrap items-end gap-4 w-full">

        {/* SEARCH */}
        <div className="flex-1 min-w-[250px]">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Search Project / Client
          </label>
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search by project or client"
          />
        </div>

        {/* DOMAIN */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Domain
          </label>
          <Select
            value={selectedDomain}
            onChange={(v) => onDomainChange(String(v))}
            options={[
              { label: "All Domains", value: "" },
              ...domains,
            ]}
            searchable
            clearable
          />
        </div>

        {/* STATUS */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Status
          </label>
          <Select
            value={selectedStatus}
            onChange={(v) => onStatusChange(String(v))}
            options={[
              { label: "All Status", value: "" },
              ...statuses,
            ]}
            clearable
          />
        </div>

        {/* FROM DATE */}
        <div className="flex flex-col flex-1 min-w-[180px]">
          <label className="text-sm font-semibold text-slate-700 mb-1">
            From Date
          </label>
          <DatePicker
            value={fromDate ? dayjs(fromDate) : null}
            onChange={(d) => onFromDateChange(d ? d.format('YYYY-MM-DD') : "")}
            format="DD/MM/YYYY"
          />
        </div>

        {/* TO DATE */}
        <div className="flex flex-col flex-1 min-w-[180px]">
          <label className="text-sm font-semibold text-slate-700 mb-1">
            To Date
          </label>
          <DatePicker
            value={toDate ? dayjs(toDate) : null}
            onChange={(d) => onToDateChange(d ? d.format('YYYY-MM-DD') : "")}
            format="DD/MM/YYYY"
          />
        </div>

      </div>
    </FilterWrapper>
  );
};


export default ProjectFilters;
