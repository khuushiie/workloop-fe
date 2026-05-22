import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import { IResourceStats, useGetResourceAllocationsQuery, useGetResourceStatsQuery, useLazyDownloadResourceReportQuery } from "../../store/apis/resource-allocation/resource-allocation.api";
import { useGetUsersForFilterQuery } from "../../store/apis/user.api";
import { useHasPermission } from "../../store/hooks/useRbac";
import { DEBOUNCE_DELAYS, useDebounce } from "../../utils/debounce";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import ResourceAllocationModal from "./ResourceAllocationModal";
import {
  ManagementTableSkeleton,
  StatsCardSkeleton,
} from "./ResourceAllocationSkeleton";
import ResourceFilters from "./ResourceFilters";
import ResourceStatsCards from "./ResourceStatsCards";
import ResourceTableSection, { ResourceRecord } from "./ResourceTableSection";

const ResourceManagement = () => {

  const navigate = useNavigate();
  const canViewResource = useHasPermission(PERMISSIONS.RESOURCE_MANAGEMENT_VIEW);
  const canManageResource = useHasPermission(PERMISSIONS.RESOURCE_MANAGEMENT_MANAGE);

  const { data: stats, isLoading: isStatsLoading, error: statsError } = useGetResourceStatsQuery();
  const { data: rawEmployees, isFetching } = useGetUsersForFilterQuery({ includeInactive: false });
 
  const [filters, setFilters] = useState({
    search: "",
    resourceIds: [] as string[],
    startDate: "",
    endDate: "",
    isAllocated: "" as string,
  });

  const debouncedSearch = useDebounce(filters.search, DEBOUNCE_DELAYS.SEARCH);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  


  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // modal
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const employeeOptions = useMemo(() => {
      const list = Array.isArray(rawEmployees) ? rawEmployees : [];
      return list.map((u: any) => ({
        label: u.fullName,
        value: u.id,
      }));
    }, [rawEmployees]);
  
  useEffect(() => {
    if (statsError) {
      toast.error("Failed to load resource stats.");
    }
  }, [statsError]);

  const queryParams = useMemo(() => {
    let isAllocatedParam: boolean | undefined = undefined;
    if (filters.isAllocated === "true") isAllocatedParam = true;
    if (filters.isAllocated === "false") isAllocatedParam = false;

    return {
      page,
      limit,
      search: debouncedSearch || undefined,
      userIds: filters.resourceIds.length > 0 ? filters.resourceIds : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      isAllocated: isAllocatedParam,
    };
  }, [page, limit, debouncedSearch, filters]);
  
  const { 
    data, 
    isFetching: isFetchingResource
  } = useGetResourceAllocationsQuery(queryParams);

  const resources = data?.data || [];
  const total = data?.total || 0;

  const [triggerDownload, { isFetching: isDownloading }] = useLazyDownloadResourceReportQuery();

  const handleDownload = async () => {
    try {
      const params = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: filters.search?.trim() || "",
        userIds: filters.resourceIds.length > 0 ? filters.resourceIds : undefined,
      };
    
      const blob = await triggerDownload(params).unwrap();
    
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Resource_Allocation_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error("Download Error:", err);
      toast.error("Failed to download report");
    }
  };


  const handleAssign = (resource: ResourceRecord) => {
    setSelectedUser(resource._id);
    setOpenAssignModal(true);
  };

  const handleView = (resource: ResourceRecord) => {
    navigate(
      `/resource-allocation/resource-management/resource-details/${resource._id}`,
    );
  };

  const handleAssignmentSaved = () => {
    setOpenAssignModal(false);
    // loadResources();
  };

  const defaultStats: IResourceStats = {
    totalProjects: 0,
    totalEmployees: 0,
    allocatedResources: 0,
    avgAllocation: 0,
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <h2 className="text-3xl font-semibold text-slate-900 mb-8">
        Resource Management
      </h2>

      {isStatsLoading  ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <ResourceStatsCards stats={stats || defaultStats} />
      )}
            <div className="mt-8"></div>

            <ResourceFilters
              search={filters.search}
              onSearchChange={(v) => handleFilterChange("search", v)}
              resourceIds={filters.resourceIds}
              onResourceChange={(v) => handleFilterChange("resourceIds", v)}
              resourcesList={employeeOptions}
              startDate={filters.startDate}
              endDate={filters.endDate}
              isAllocated={filters.isAllocated}
              onAllocatedChange={(v) => handleFilterChange("isAllocated", v)}
              onStartDateChange={(v) => handleFilterChange("startDate", v)}
              onEndDateChange={(v) => handleFilterChange("endDate", v)}
            />
      {isFetchingResource ? (
        <ManagementTableSkeleton rows={6} columns={6} />
      )  : (
            <ResourceTableSection
              resources={resources}
              loading={isFetchingResource}
              currentPage={page}
              itemsPerPage={limit}
              totalItems={total}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              onView={canViewResource ? handleView : undefined}
              onAssign={canManageResource ? handleAssign : undefined}
              onDownload={canManageResource?handleDownload: undefined} 
            />
      )}
      {openAssignModal && selectedUser && (
        <ResourceAllocationModal
          mode="userToProject"
          userId={selectedUser}
          onClose={() => setOpenAssignModal(false)}
          onSave={handleAssignmentSaved}
        />
      )}
    </div>
  );
};

export default ResourceManagement;
