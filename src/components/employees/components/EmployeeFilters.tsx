import React, { useMemo } from "react";
import SearchInput from "../../common/SearchInput";
import Select, { SelectOption } from "../../common/Select";

interface EmployeeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  departmentOptions: SelectOption[];
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  employmentTypeOptions: SelectOption[];
  selectedEmploymentType: string;
  onEmploymentTypeChange: (value: string) => void;
  statusOptions: SelectOption[];
  selectedStatus: string;
  onStatusChange: (value: string) => void;
}

const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  searchTerm,
  onSearchChange,
  departmentOptions: departmentOptionsProp,
  selectedDepartment,
  onDepartmentChange,
  employmentTypeOptions: employmentTypeOptionsProp,
  selectedEmploymentType,
  onEmploymentTypeChange,
  statusOptions: statusOptionsProp,
  selectedStatus,
  onStatusChange,
}) => {


  return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          label="Search Employees"
          placeholder="Search by name "
        />

        <Select
          label="Department"
          placeholder="Select Department"
          options={departmentOptionsProp}
          value={selectedDepartment ?? ""}
          onChange={(value) => onDepartmentChange(String(value ?? ""))}
          clearable
          searchable
        />

        <Select
          label="Employment Type"
          placeholder="Select Employment Type"
          options={employmentTypeOptionsProp}
          value={selectedEmploymentType ?? ""}
          onChange={(value) => onEmploymentTypeChange(String(value ?? ""))}
          clearable
          searchable
        />

        <Select
          label="Status"
          placeholder="Select Status"
          options={statusOptionsProp}
          value={selectedStatus ?? ""}
          onChange={(value) => onStatusChange(String(value ?? ""))}
          clearable
        />
      </div>
  );
};

export default EmployeeFilters;

