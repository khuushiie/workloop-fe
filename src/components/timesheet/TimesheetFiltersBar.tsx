import dayjs, { Dayjs } from "dayjs";
import { Select, DatePicker, Button } from "../common";
import SearchInput from "../common/SearchInput";
import { TimesheetFilters } from "../../types/timesheet";
import { FILTER_ALL } from "../../utils/constants";
import { useGetMasterConfigByCategoryQuery } from "../../store/apis/masterConfig.api";
import { MasterConfigCategory } from "../../constants";
import { useMemo } from "react";
import { DEBOUNCE_DELAYS } from "../../utils/debounce";

interface TimesheetFiltersBarProps {
  setFilters: React.Dispatch<React.SetStateAction<TimesheetFilters>>;
  value: TimesheetFilters;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  users: Array<{ id: string; fullName: string }>;
  onChange: (key: keyof TimesheetFilters, value: string) => void;
  showStatus?: boolean;
  showUser?: boolean;
  showDepartment?: boolean;
  showDateRange?: boolean;
  showSearch?: boolean;
  departments?: { label: string; value: string }[];
}

const TimesheetFiltersBar: React.FC<TimesheetFiltersBarProps> = ({
  setFilters,
  setCurrentPage,
  value,
  users,
  onChange,
  showStatus = true,
  showUser = true,
  showDepartment = true,
  showDateRange = true,
  showSearch = true,
  departments = [],
}) => {
  const { data: statusList = [], isLoading: statusLoading } =
    useGetMasterConfigByCategoryQuery(MasterConfigCategory.TIMESHEET_STATUS);

  const statusOptions = useMemo(() => {
    if (!Array.isArray(statusList)) return [];

    return [
      { value: "", label: FILTER_ALL.STATUS },
      ...statusList
        .filter((s) => s?.id && s?.displayName)
        .map((s) => ({
          label: s.displayName,
          value: s.filterCode,
        })),
    ];
  }, [statusList]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {showStatus && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Status
          </label>
          <Select
            value={value.status || ""}
            onChange={(val) => onChange("status", String(val))}
            options={statusOptions}
            loading={statusLoading}
            searchable
          />
        </div>
      )}

        {showSearch && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Search
          </label>
          <SearchInput
            value={value.search || ""}
            onChange={(v) => onChange("search", v)}
            placeholder="Search tasks "
            debounceDelay={DEBOUNCE_DELAYS.SEARCH}
          />
        </div>
      )}

      {showUser && (
        <div>
          <Select
            label="Employees"
            placeholder="Select Employee"
            value={value.userId || FILTER_ALL.EMPLOYEES}
            onChange={(val) => onChange("userId", String(val))}
            options={[
              { value: "", label: FILTER_ALL.EMPLOYEES },
              ...users.map((u) => ({
                value: u.id,
                label: `${u.fullName}`,
              })),
            ]}
            searchable
          />
        </div>
      )}

      {showDepartment && (
        <div>
          <Select
          label="Department"
            placeholder="Select Department"
            value={value.department || FILTER_ALL.DEPARTMENTS}
            onChange={(val) => onChange("department", String(val))}
            options={[{ value: "", label: "All Departments" }, ...departments]}
            searchable
          />
        </div>
      )}

    

      {showDateRange && (
        <>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              From Date
            </label>
            <DatePicker
              value={value.fromDate ? dayjs(value.fromDate) : undefined}
              onChange={(d: Dayjs | null) =>
                onChange("fromDate", d ? d.format("YYYY-MM-DD") : "")
              }
              maxDate={value.toDate ? dayjs(value.toDate) : undefined}
              format="DD/MM/YYYY"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              To Date
            </label>
            <DatePicker
              value={value.toDate ? dayjs(value.toDate) : undefined}
              onChange={(d: Dayjs | null) =>
                onChange("toDate", d ? d.format("YYYY-MM-DD") : "")
              }
              minDate={value.fromDate ? dayjs(value.fromDate) : undefined}
              format="DD/MM/YYYY"
            />
          </div>
          <div className="flex items-end p-1">
            </div>
        </>
      )}
    </div>
  );
};

export default TimesheetFiltersBar;


