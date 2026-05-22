import React, { useMemo } from "react";
import Select, { type SelectOption } from "./Select";
import { useGetMasterConfigByCategoryQuery } from "../../store/apis/masterConfig.api";
import { MasterConfigCategory } from "../../constants";

export interface DepartmentFilterProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  clearable?: boolean;
  searchable?: boolean;
  placeholder?: string;
}

/**
 * Reusable department filter dropdown. Fetches departments from master config
 * and renders a Select with "All Departments" + options. Use everywhere a
 * department filter is needed (leave overview, reports, etc.).
 */
const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  value,
  onChange,
  label = "Department",
  className = "",
  clearable = true,
  searchable = true,
  placeholder = "All Departments",
}) => {
  const { data: departmentList = [] } =
    useGetMasterConfigByCategoryQuery(MasterConfigCategory.DEPARTMENT);

  const options = useMemo<SelectOption[]>(
    () => [
      { value: "", label: "All Departments" },
      ...departmentList.map((d) => ({
        value: d.id,
        label: d.displayName,
      })),
    ],
    [departmentList]
  );

  return (
    <Select
      label={label}
      options={options}
      value={value ?? ""}
      onChange={(val) => onChange(String(val ?? ""))}
      placeholder={placeholder}
      clearable={clearable}
      searchable={searchable}
      className={className}
    />
  );
};

export default DepartmentFilter;
