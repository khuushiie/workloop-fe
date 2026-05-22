import React, { useMemo, useCallback, useEffect, useState } from "react";
import ProjectStatsCards from "./ProjectStatsCards";
import { ProjectStats } from "../../services/api";
import toast from "react-hot-toast";
import { ConfirmationModal, Pagination, SimpleTooltip, ConfigurableTable, Button } from "../common";
import { TableColumn } from "../common/Table";
import {
  SquarePen,
  Trash2,
  Plus,
  Eye,
  CheckCircle,
  XCircle,

} from "lucide-react";
import AddProjectModel from "./AddProjectModel";
import EditProjectModel from "./EditProjectModel";
import Badge from "../common/Badge";
import ViewProjectModal, { CategoryOption } from "./ViewProjectModal";
import ProjectFilters from "./ProjectFilters";
import { useDebounce, DEBOUNCE_DELAYS } from "../../utils/debounce";
import { capitalizeWords } from "../../utils/nameUtils";
import ExcelIcon from "../../icons/ExcelIcon";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { ManagementTableSkeleton, StatsCardSkeleton } from "./ResourceAllocationSkeleton";
import { ProjectViewRecord, useDeleteProjectMutation, useGetProjectByIdQuery, useGetProjectsQuery, useGetProjectStatsQuery, useLazyDownloadProjectReportQuery, useLazyGetProjectByIdQuery } from "../../store/apis/resource-allocation/project-management.api";
import { useGetConfigsByCategoryCodeQuery } from "../../store/apis/masterConfig.api";

type ProjectResource = {
  firstName: string;
  lastName: string;
  role: string;
  allocationPercentage: number;
};

interface ProjectFilters {
  search?: string;
  priority?: string;
  domain?: string;
  fromDate?: string;
  toDate?: string;
}

const mapUserRowToProjectView = (row: ProjectViewRecord): ProjectViewRecord => ({
  id: row.id,
  name: row.name,
  description: row.description,
  clientName: row.clientName,
  capacity: row.capacity,
  startDate: row.startDate,
  endDate: row.endDate,
  domain: row.domain,
  status: row.status,
  poc: row.poc ?? undefined,
  priority: row.priority,
  billable: row.billable ?? false,
  category: row.category,
  inActiveReason: row.inActiveReason || "",
  allocatedResources: row.allocatedResources,
  createdBy: row.createdBy ?? "", 
});

const ProjectManagement = () => {

  const canViewProject = useHasPermission(PERMISSIONS.PROJECT_MANAGEMENT_VIEW);
  const canManageProject = useHasPermission(PERMISSIONS.PROJECT_MANAGEMENT_MANAGE);
  const [openCreateModel, setopenCreateModel] = useState(false);
  const [openEditModel, setopenEditModel] = useState(false);
  const [openDeleteConfirmation, setopenDeleteConfirmation] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);


  const [selectedProject, setSelectedProject] =
    useState<ProjectViewRecord | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    domain: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const debouncedSearch = useDebounce(filters.search, DEBOUNCE_DELAYS.SEARCH);
  //pagination states -
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

 const [triggerDownload, { isFetching: isDownloading }] = useLazyDownloadProjectReportQuery();
 const { data: stats, isLoading: isLoadingStats } = useGetProjectStatsQuery();
 const [triggerFetchProject, { isFetching: isLoadingDetails }] = useLazyGetProjectByIdQuery();
 const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const { 
    data: projectData, 
    isLoading: isLoadingProjects, 
    isFetching,
    error: projectsError, 
  } = useGetProjectsQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch,
    domain: filters.domain,
    status: filters.status,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });


  useEffect(() => {
    if (projectsError) toast.error("Failed to load projects");
  }, [projectsError]);


  useEffect(() => {
    if(projectData) {
      setPagination(projectData?.pagination)
    }
  }, [projectData]);

  const handleViewDetails = async (projectId: string) => {
    try {
      setOpenViewModal(true);
      const project = await triggerFetchProject(projectId).unwrap();
      setSelectedProject(project);
    } catch (err) {
      toast.error("Failed to fetch project details");
      console.error(err);
    }
  }

  const { data: rawDomains } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_domain" });
  const { data: rawStatuses } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_status" });
  const { data: rawCategories } = useGetConfigsByCategoryCodeQuery({ categoryCode: "project_category" });

  const getCategoryDisplayName = (categoryCode: string) => {
    const option = categoryOptions.find((opt: any) => opt.value === categoryCode);
    return option ? option.label : categoryCode;
  };
  
  const domainOptions = useMemo(() => {
    const list = rawDomains?.data || [];
    return list.map((item: any) => ({
      label: item.displayName || item.filterCode,
      value: item.id ?? item._id,
    }));
  }, [rawDomains]);

  // 3. Transform Statuses
  const statusOptions = useMemo(() => {
    const list = rawStatuses?.data || [];
    return list.map((item: any) => ({
      label: item.displayName || item.filterCode,
      value: item.id ?? item._id,
    }));
  }, [rawStatuses]);

  // 4. Transform Categories
  const categoryOptions = useMemo(() => {
    const list = rawCategories?.data || [];
    return list.map((item: any) => ({
      label: item.displayName || item.filterCode,
      value: item.id ?? item._id,
    }));
  }, [rawCategories]);



  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters]);
  // Table
  const columns: TableColumn<ProjectViewRecord>[] = [
    {
      key: "name",
      title: "Project Name",
      label: "Project Name",
      required: true,
      dataIndex: "name"
    },
    {
      key: "description",
      title: "Description",
      label: "Description",
      dataIndex: "description",
      render: (text: string) => (
        <SimpleTooltip
          label={text || "No Description Found"}
          side="top"
          delay={500}
          tooltipClassName={`transition-none`}
        >
          <div className="max-w-[300px] truncate">
            {text || <div className="max-w-[500px] text-center"> - </div>}{" "}
          </div>
        </SimpleTooltip>
      ),
    },
    {
      key: "poc",
      title: "POC",
      label: "POC",
      dataIndex: "poc",
    },
    {
      key: "clientName",
      title: "Client Name",
      label: "Client Name",
      dataIndex: "clientName",
    },
    {
      key: "category",
      title: "Category",
      label: "Category",
      dataIndex: "category",
      render: (categoryCode: string) => categoryCode || "-",
    },
    {
      key: "domain",
      title: "Domain",
      label: "Domain",
      dataIndex: "domain",
      render: (text) => text || "-",
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      dataIndex: "status",
      render: (value?: string) => {
        const status = value?.toLowerCase() || "inactive";
        const isActive = status === "active" ;

        return (
          <Badge variant={isActive ? "green" : "red"}>
            <span className="flex items-center gap-2">
              {isActive ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              {isActive ? "Active" : "Inactive"}
            </span>
          </Badge>
        );
      },
    },
    {
      key: "allocatedResources",
      title: "Resources",
      label: "Allocated Resources",
      dataIndex: "allocatedResources",
      render: (resources: ProjectResource[]) => {
        if (!resources || resources.length === 0) {
          return (
            <div className="text-zinc-900 text-[12px] py-1 px-3 inline-block text-center">
              No Resources Allocated
            </div>
          );
        }

        const tooltipContent = (
          <div className="p-2">
            <div className="mb-2 pb-2 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-700">
                Team Members & Contribution
              </span>
            </div>

            <ul className="space-y-1">
              {resources.map((member, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span className="text-slate-700">{member?.firstName} {member?.lastName}</span>
                  <span className="ml-auto text-slate-500">
                    {member?.allocationPercentage}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );

        if (resources.length === 1) {
          const m = resources[0];
          return (
            <SimpleTooltip side="top" label={tooltipContent}>
              <div className="bg-slate-100 text-slate-900 text-[12px] rounded-full py-1 px-3 cursor-pointer inline-block">
                {capitalizeWords(`${m?.firstName} ${m?.lastName}`)}
              </div>
            </SimpleTooltip>
          );
        }

        const first = resources[0];
        const remainingCount = resources.length - 1;

        return (
          <div className="space-y-1">
            <SimpleTooltip side="top" label={tooltipContent}>
              <span className="bg-slate-100 text-slate-900 text-[12px] rounded-full py-1 px-3 cursor-pointer inline-block">
                {first.firstName} {first.lastName}
              </span>
            </SimpleTooltip>

            <SimpleTooltip side="top" label={tooltipContent}>
              <span className="text-primary-900 bg-primary-500/10 text-[12px] rounded-full py-1 px-3 cursor-pointer inline-block">
                View {remainingCount} more
              </span>
            </SimpleTooltip>
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_, record: ProjectViewRecord) => (
        <div className="flex items-center space-x-2">
          {canViewProject && (
            <SimpleTooltip label="View " side="top" delay={300}>
              <button
                type="button"
                className="w-5 h-5 cursor-pointer text-primary-600"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleViewDetails(record.id);
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
            </SimpleTooltip>
          )}
          {canManageProject && (
            <SimpleTooltip label="Edit " side="top" delay={300}>
              <button
                type="button"
                className="w-5 h-5 cursor-pointer text-green-600"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleEditClick(record.id);
                }}
              >
                <SquarePen className="w-4 h-4" />
              </button>
            </SimpleTooltip>
          )}
          {canManageProject && (
            <SimpleTooltip label="Delete" side="top" delay={300}>
              <button
                type="button"
                className="w-5 h-5 cursor-pointer text-red-600"
                onClick={(e) => {
                  e.currentTarget.blur();
                  setSelectedProject(mapUserRowToProjectView(record));
                  setopenDeleteConfirmation(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </SimpleTooltip>
          )}
        </div>
      ),
    }
  ];


  //handle filter change
  const handleFilterChange = (
    key: keyof typeof filters,
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));

    setPagination(prev => ({ ...prev, page: 1 }));
  };


  const handleEditClick = async (id: string) => {
    try {
      const project: ProjectViewRecord = await triggerFetchProject(id).unwrap();
      setSelectedProject(project);
      setopenEditModel(true);
    } catch (err) {
      toast.error("Failed to fetch project details");
    }
  };

  const handleDelete = async () => {
    if (!selectedProject?.id) return;

    try {
      await deleteProject(selectedProject.id).unwrap();
      toast.success("Project deleted successfully");
      setopenDeleteConfirmation(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete project");
    }
  };

  // Handle View
  const handleViewProject = (row: any) => {
    const mapped = {
      id: row.id,
      name: row.projectName,
      description: row.projectDescription,
      clientName: row.clientName,
      capacity: row.capacity,
      startDate: row.startDate,
      endDate: row.endDate,
      domain: row.domain,
      status: row.status,
      poc: row.poc,
      priority: row.priority,
      billable: row.billable,
      category: row.category,
      inActiveReason: row.inActiveReason,
      allocatedResources: row.allocatedResources || [],
      createdByName: row.createdByName || "",
    };

    setSelectedProject(mapped);
    setOpenViewModal(true);
  };

  const handleDownloadProject = async () => {
    try {
      const params = {
        startDate: filters.fromDate || undefined,
        endDate: filters.toDate || undefined,
        search: filters.search?.trim() || "",
        domain: filters.domain || "",
        category: "",
        status: filters.status || "",
        role: "",
      };
    
      const blob = await triggerDownload(params).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const date = new Date().toISOString().slice(0, 10);
      link.download = `Project_Report_${date}.xlsx`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Project report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download project report");
    }
  };


  return (
    <>
      <div className="p-6 max-w-full mx-auto">
        <div className="flex max-[830px]:flex-col items-start sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 md:text-3xl">
              Project Management
            </h1>
          </div>
          {canManageProject && (
            <Button
              htmlType="button"
              size="large"
              appearance="primary"
              onClick={() => setopenCreateModel(true)}
              icon={<Plus className="w-3 h-3 md:w-5 md:h-5" />}
            >
              Add Project
            </Button>
          )}
        </div>
        <div className="mb-8">
          {isLoadingStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            stats && <ProjectStatsCards stats={stats?.data} />
          )}
        </div>



        <ProjectFilters
          searchTerm={filters.search}
          onSearchChange={(v) => handleFilterChange("search", v)}

          domains={domainOptions}             
          selectedDomain={filters.domain}
          onDomainChange={(v) => handleFilterChange("domain", v)}

          statuses={statusOptions}            
          selectedStatus={filters.status}
          onStatusChange={(v) => handleFilterChange("status", v)}

          fromDate={filters.fromDate}
          onFromDateChange={(v) => handleFilterChange("fromDate", v)}
          toDate={filters.toDate}
          onToDateChange={(v) => handleFilterChange("toDate", v)}
        />


        {/* Skeleton OR Table */}
        {/* Configurable Table */}
        <div className="bg-white rounded-lg shadow-soft border border-slate-200 overflow-hidden">
          {isLoadingProjects ? (
            <ManagementTableSkeleton rows={5} columns={8} />
          ) : (
            <>
              <ConfigurableTable<ProjectViewRecord>
                columns={columns}
                data={projectData?.data ?? []}
                loading={isFetching}
                striped={true}
                emptyMessage="No projects found. Adjust your search to find projects."
                rowKey="id"
                configOptions={{ persistenceKey: "project-management-table" }}
                renderColumnSelector={(selector) => (
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Projects ({pagination.total})</h3>
                    <div className="flex items-center gap-4">
                      
                      <button onClick={handleDownloadProject}>
                        <SimpleTooltip label="Projects Report" side="top">
                          <ExcelIcon />
                        </SimpleTooltip>
                      </button>
                      {selector}
                    </div>
                  </div>
                )}
              />
              
              <Pagination
                currentPage={pagination.page}
                totalItems={pagination?.total}
                itemsPerPage={pagination.limit}
                onPageChange={(p) =>
                  setPagination((prev) => ({ ...prev, page: p }))
                }
                onItemsPerPageChange={(l) =>
                  setPagination((prev) => ({ ...prev, page: 1, limit: l }))
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Opening Create Project Model */}
      {openCreateModel && (
        <AddProjectModel
          onClose={() => {
            setopenCreateModel(false);
          }}
          onSuccess={() => {
            // loadProjects();
            // loadProjectStats(); //
            setopenCreateModel(false);
          }}
        />
      )}
      {openEditModel && (
        <EditProjectModel
          data={selectedProject}
          onClose={() => setopenEditModel(false)}
          loading={isLoadingDetails}
          onSuccess={() => {
            // loadProjects();
            // loadProjectStats(); 
            setopenEditModel(false);
          }}
        />
      )}
      {openViewModal && selectedProject && (
        <ViewProjectModal
          project={selectedProject}
          loading={isLoadingDetails}
          onClose={() => setOpenViewModal(false)}
        />
      )}

      <ConfirmationModal
        title="Delete Project"
        message="Are you sure you want to delete this project?"
        isOpen={openDeleteConfirmation}
        onClose={() => setopenDeleteConfirmation(false)}
        onConfirm={handleDelete}
        type="danger"
      />
    </>
  );
};

export default ProjectManagement;
