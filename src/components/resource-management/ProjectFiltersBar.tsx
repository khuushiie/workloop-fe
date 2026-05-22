import React from "react";

import { Select, DatePicker } from "../common";
import SearchInput from "../common/SearchInput";
import { PRIORITY_OPTIONS } from "../../utils/constants";

interface ProjectFilters {
  search?: string;
  priority?: string;
  domain?: string;
  fromDate?: string;
  toDate?: string;
}

interface ProjectFiltersBarProps {
  value: ProjectFilters;
  onChange: (key: keyof ProjectFilters, value: string) => void;
  domains: string[];
}

const ProjectFiltersBar: React.FC<ProjectFiltersBarProps> = ({
  value,
  onChange,
  domains = [],
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">
          Search
        </label>
        <SearchInput
          value={value.search || ""}
          onChange={(v) => onChange("search", v)}
          placeholder="Search by project name..."
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">
          Priority
        </label>
        <Select
          value={value.priority || ""}
          onChange={(v) => onChange("priority", String(v))}
          options={PRIORITY_OPTIONS}
        />
      </div>

      {/* Domain */}
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">
          Domain
        </label>
        <Select
          value={value.domain || ""}
          onChange={(v) => onChange("domain", String(v))}
          options={[
            { value: "", label: "All Domains" },
            ...domains.map((d) => ({ value: d, label: d })),
          ]}
          searchable
        />
       
      </div>

     
    </div>
  );
};

export default ProjectFiltersBar;
