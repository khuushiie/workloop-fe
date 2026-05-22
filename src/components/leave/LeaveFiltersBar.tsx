import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { Select, DatePicker, SearchInput } from "../common";
import { SelectOption } from "../common/Select";

interface FiltersValue {
  search?: string;
  userId?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}

interface LeaveFiltersBarProps {
  value: FiltersValue;
  users: Array<{
    id?: string;
    _id?: string;
    firstName?: string;
    lastName?: string;
    workEmail?: string;
    department?: string;
  }>;
  departments: SelectOption[];
  onChange: (key: keyof FiltersValue, value?: string) => void;
}

const LeaveFiltersBar: React.FC<LeaveFiltersBarProps> = ({
  value,
  users,
  departments,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="md:col-span-2">
        <SearchInput
          label="Search"
          debounceDelay={600}
          value={value.search || ""}
          onChange={(v) => onChange("search", v)}
          placeholder="Search Employee"
        />
      </div>
      <Select
        label="Department"
        value={value.department ?? ""}
        onChange={(val) =>
          onChange("department", val ? String(val) : undefined)
        }
        options={[{ value: "", label: "All Departments" }, ...departments]}
        searchable
      />

      <div>
        <DatePicker
          label="From Date"
          value={value.startDate ? dayjs(value.startDate) : undefined}
          onChange={(d: Dayjs | null) =>
           onChange("startDate", d ? d.toISOString() : undefined)
          }
          maxDate={value.endDate ? dayjs(value.endDate) : undefined}
          format="DD/MM/YYYY"
        />
      </div>

      <div>
        <DatePicker
          label="To Date"
          value={value.endDate ? dayjs(value.endDate) : undefined}
          onChange={(d: Dayjs | null) =>
            onChange("endDate", d ? d.toISOString() : undefined)
          }
          minDate={value.startDate ? dayjs(value.startDate) : undefined}
          format="DD/MM/YYYY"
        />
      </div>
    </div>
  );
};

export default LeaveFiltersBar;
