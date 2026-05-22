
import React, { useMemo } from "react";
import { ConfigurableTable } from "../common";
import { TableColumn } from "../common/Table";
import Pagination from "../common/Pagination";
import {
  PlusCircle,
  Send,
} from "lucide-react";
import { SimpleTooltip } from "../common";
import ExcelIcon from "../../icons/ExcelIcon";
import { capitalizeWords } from "../../utils/nameUtils";

export interface ResourceRecord {
  _id: string;
  firstName: string;
  lastName: string;
  designation?: string;
  allocatedPercentage?: number;
  availablePercentage?: number;

  projects?: Array<{
    projectId: string;
    projectName: string;
    allocationPercentage: number;
  }>;
}

export interface ResourceTableSectionProps {
  resources: ResourceRecord[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onView?: (resource: ResourceRecord) => void;
  onAssign?: (resource: ResourceRecord) => void;
  onDownload?: () => void;
}


const ResourceTableSection: React.FC<ResourceTableSectionProps> = ({
  resources,
  loading,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onView,
  onAssign,
  onDownload, 
}) => {
  const columns = useMemo<TableColumn<ResourceRecord>[]>(() => {
    const baseCell = "text-sm text-slate-900";
    const subtle = "text-sm text-slate-600";

    return [
      {
        key: "name",
        title: "Resource",
        label: "Resource",
        required: true,
        render: (_: unknown, r: ResourceRecord) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {(r.firstName?.charAt(0) || "?").toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-0">
                {`${capitalizeWords(r.firstName)} ${capitalizeWords(r.lastName )|| ""}`.trim()}
              </p>
            </div>
          </div>
        ),
      },

      {
        key: "designation",
        title: "Designation",
        label: "Designation",
        dataIndex: "designation",
        render: (value: any) => (
          <span className={value ? baseCell : subtle}>{value || "N/A"}</span>
        ),
      },

      {
        key: "allocated",
        title: "Allocated %",
        label: "Allocated %",
        render: (_: unknown, r: ResourceRecord) => (
          <span className={baseCell}>{r?.allocatedPercentage? r?.allocatedPercentage>100 ?<SimpleTooltip tooltipClassName="-ml-10" delay={150} side="top" label={<span className="text-red-500">This resource is over-allocated</span>}><span className="text-red-500">{r?.allocatedPercentage}%</span></SimpleTooltip> : `${r?.allocatedPercentage}%` : "0%"}</span>
        ),
      },

      {
        key: "available",
        title: "Available %",
        label: "Available %",
        render: (_: unknown, r: ResourceRecord) => (
          <span className={baseCell}>{r.availablePercentage ?? 0}%</span>
        ),
      },

      {
        key: "projects",
        title: "Projects",
        label: "Projects",
        render: (_: unknown, r: ResourceRecord) => {
          const projects = r.projects || [];

          // CASE 1 — NO PROJECTS
          if (projects.length === 0) {
            return (
              <span className="text-zinc-900  text-[13px]  py-1 px-3 inline-block text-center">
                No projects
              </span>
            );
          }

          // Tooltip content for ALL projects
          const tooltipContent = (
            <div className="p-2">
              <div className="mb-2 pb-2 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-700">
                  Project & Allocation%
                </span>
              </div>

              <ul className="space-y-1">
                {projects.map((p: {projectName: string, allocationPercentage: number}, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-primary-500 rounded-full" />
                    <span className="text-slate-700">{p.projectName}</span>
                    <span className="ml-auto text-slate-500">
                      {p.allocationPercentage}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );

          // CASE 2 — SINGLE PROJECT (must be gray badge)
          if (projects.length === 1) {
            const p = projects[0];
            return (
              <SimpleTooltip side="top" label={tooltipContent}>
                <div>
                  <span className="bg-slate-100 text-slate-900 text-[12px] rounded-full py-1 px-3 cursor-pointer inline-block">
                    {p.projectName}
                  </span>
                </div>
              </SimpleTooltip>
            );
          }

          // CASE 3 — MULTIPLE PROJECTS
          const firstProject = projects[0];
          const remainingCount = projects.length - 1;

          return (
            <div className="space-y-1">
              {/* First project badge (gray) */}
              <SimpleTooltip side="top" label={tooltipContent}>
                <div>
                  <span className="bg-slate-100 text-slate-900 text-[12px] font-medium rounded-full py-1 px-3 cursor-pointer inline-block">
                    {firstProject.projectName}
                  </span>
                </div>
              </SimpleTooltip>

              {/* View more badge (blue) */}
              <SimpleTooltip side="top" label={tooltipContent}>
                <div>
                  <span className="text-primary-900 bg-primary-500/10 text-[12px] rounded-full py-1 px-3 cursor-pointer inline-block">
                    View {remainingCount} more
                  </span>
                </div>
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
  render: (_: unknown, r: ResourceRecord) => (
    <div className="flex items-center gap-3">

      {/* VIEW BUTTON - only rendered if onView exists */}
      {onView && (
         <SimpleTooltip label="View " side="top" delay={300}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(r);
          }}
          className="text-slate-600 hover:text-slate-800 relative group"
        >
          <Send className="w-4 h-4" />
         
        </button>
        </SimpleTooltip>
      )}

      {/* ASSIGN BUTTON - only rendered if onAssign exists */}
      {onAssign && (
         <SimpleTooltip label="Assign " side="top" delay={300}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssign(r);
          }}
          className="text-green-600 hover:text-green-800 relative group"
        >
          <PlusCircle className="w-4 h-4" />
        
        </button>
        </SimpleTooltip>
      )}

    </div>
  ),
}
,
    ];
  }, [onView, onAssign]);

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-hidden">
     
      <ConfigurableTable
        columns={columns}
        data={resources}
        loading={loading}
        emptyMessage="No resources found"
        rowKey="_id"
        configOptions={{ persistenceKey: "resource-management-table" }}
        renderColumnSelector={(selector) => (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Resources ({totalItems})
            </h3>
            <div className="flex items-center gap-4">
              <SimpleTooltip label="Resources Report" side="top">
                <button onClick={onDownload}>
                  <ExcelIcon />
                </button>
              </SimpleTooltip>
              {selector}
            </div>
          </div>
        )}
      />

      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          itemsPerPageOptions={[5, 10, 20, 50, 100]}
        />
      )}
    </div>
  );
};

export default ResourceTableSection;
