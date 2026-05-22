import React from "react";
import { Button, DatePicker, SearchInput, Select } from "../../common";
import FilterWrapper from "../../common/FilterWrapper";
import dayjs, { Dayjs } from "dayjs";
import { IRegularizationFilters } from "../../../store/apis/attendanceRegularization.api";

interface FiltersBarProps {
  filters: IRegularizationFilters;
  regularizationTypeOptions: { value: string; label: string }[];
  departments: { value: string; label: string }[];

  searchTerm: string;
  onSearchChange: (value: string) => void;

  onFilterChange: (key: keyof IRegularizationFilters, value: string) => void;
  onClear?: () => void;
  setFilters: React.Dispatch<React.SetStateAction<IRegularizationFilters>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}


const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  regularizationTypeOptions,
  departments,
  searchTerm,
  onSearchChange,
  onFilterChange,
  setFilters,
  setPage,
  onClear,
}) => (
  <FilterWrapper>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">

      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        label="Search Employees"
        placeholder="Search by name"
      />

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Type
        </label>
        <Select
          className="w-full"
          value={filters?.regularizationType || ""}
          onChange={(value) =>
            onFilterChange("regularizationType", String(value))
          }
          options={[
            { value: "", label: "All Types" },
            ...regularizationTypeOptions,
          ]}
          searchable
        />
      </div>

      {/* Department Filter */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Department
        </label>
        <Select
          className="w-full"
          value={filters?.department || ""}
          onChange={(val) =>
            onFilterChange("department", String(val))
          }
          options={[
            { value: "", label: "All Departments" },
            ...departments,
          ]}
          searchable
        />
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Start Date
        </label>
        <DatePicker
          className="w-full"
          value={filters?.fromDate ? dayjs(filters.fromDate) : undefined}
          onChange={(d: Dayjs | null) =>
            onFilterChange(
              "fromDate",
              d ? d.format("YYYY-MM-DD") : ""
            )
          }
        />
      </div>

      {/* End Date */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          End Date
        </label>
        <DatePicker
          className="w-full"
          value={filters?.toDate ? dayjs(filters.toDate) : undefined}
          onChange={(d: Dayjs | null) =>
            onFilterChange(
              "toDate",
              d ? d.format("YYYY-MM-DD") : ""
            )
          }
        />
      </div>
            <div className="flex items-end">
        <Button
          htmlType="button"
          appearance="secondary" 
          onClick={() => {
            setFilters({
              search: "",
              regularizationType: undefined,
              department: "",
              userId: "",
            });
            setPage(1);
          }}
        >
          Clear Filters
        </Button>

      </div>

    </div>
  </FilterWrapper>
);


export default FiltersBar;