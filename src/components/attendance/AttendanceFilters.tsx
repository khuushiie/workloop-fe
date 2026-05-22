import React, { useMemo } from "react";
import { AttendanceFilters as FiltersType } from "./types";
import SearchInput from "../common/SearchInput";
import { DatePicker, Select } from "../common";
import dayjs, { Dayjs } from "dayjs";
import { SelectOption } from "../common/Select";

/** Master config option: id is ObjectId for API, displayName for label */
export interface MasterConfigOption {
  id: string;
  displayName: string;
}

interface AttendanceFiltersProps {
  filters: FiltersType;
  onFilterChange: (key: string, value: unknown) => void;
  /** Department options from master config (id = ObjectId) */
  departments?: MasterConfigOption[];
  /** Status options from master config (id = ObjectId) */
  statuses?: MasterConfigOption[];
  loading?: boolean;
  isAdmin?: boolean;
  employeeSearch?: string;
  onEmployeeSearchChange?: (value: string) => void;
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  filters,
  onFilterChange,
  departments = [],
  statuses = [],
  loading = false,
  isAdmin = false,
  employeeSearch = "",
  onEmployeeSearchChange = () => {},
}) => {
  const statusOptions = useMemo<SelectOption[]>(
    () => [
      { value: "", label: "All Status" },
      ...statuses.map((s) => ({
        value: s.id,
        label: s.displayName.charAt(0).toUpperCase() + s.displayName.slice(1),
      })),
    ],
    [statuses]
  );

  const departmentOptions = useMemo<SelectOption[]>(
    () => [
      { value: "", label: "All Departments" },
      ...departments.map((d) => ({ value: d.id, label: d.displayName })),
    ],
    [departments]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {/* Month & Year */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Month & Year
        </label>
        <DatePicker
          picker="month"
          value={
            filters.year && filters.month
              ? dayjs(
                  `${filters.year}-${filters.month.toString().padStart(2, "0")}`
                )
              : null
          }
          onChange={(d: Dayjs | null) => {
            if (!d) {
              onFilterChange("year", "");
              onFilterChange("month", "");
              return;
            }
            onFilterChange("year", Number(d.format("YYYY")));
            onFilterChange("month", Number(d.format("MM")));
          }}
          className="w-full"
        />
      </div>

      {isAdmin && (
        <>
          {/* Department */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Department
            </label>
            <Select
              className="w-full"
              clearable
              value={filters?.department ?? ""}
              onChange={(val) => onFilterChange("department", val || "")}
              options={departmentOptions}
              searchable
            />
          </div>

          {/* Search Employees */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <SearchInput
              value={employeeSearch}
              onChange={onEmployeeSearchChange}
              placeholder="Search employees by name, email, department..."
              label="Search Employee"
              debounceDelay={500}
              className="!p-0"
            />
          </div>

          {/* Status */}
          <div>
            <Select
              label="Status"
              options={statusOptions}
              value={filters?.statuses ?? ""}
              onChange={(value) => onFilterChange("statuses", value ?? "")}
              clearable
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceFilters;
