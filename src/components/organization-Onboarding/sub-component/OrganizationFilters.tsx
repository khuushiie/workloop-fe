import React, { useMemo } from "react";
import SearchInput from "../../common/SearchInput";
import Select, { SelectOption } from "../../common/Select";

interface OrganizationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusOptions: SelectOption[];
  selectedStatus: string;
  onStatusChange: (value: string) => void;
   loading?: boolean;
}

const OrganizationFilters: React.FC<OrganizationFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusOptions: statusOptionsProp,
  selectedStatus,
  onStatusChange,
 
}) => {
  const statusOptions = useMemo<SelectOption[]>(
    () => [{ value: "", label: "All Status" }, ...statusOptionsProp],
    [statusOptionsProp]
  );


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        label="Search Organization"
        placeholder="Search by Organization name"
      />

      <Select
        label="Status"
        options={statusOptions}
        value={selectedStatus ?? ""}
        onChange={(value) => onStatusChange(String(value ?? ""))}
        clearable
      />

    </div>
  );
};

export default OrganizationFilters;
