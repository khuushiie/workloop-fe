import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Briefcase
} from "lucide-react";

// Assuming these are your common components
import { Pagination, SimpleTooltip, Modal, SearchInput, Select, ConfigurableTable } from "../common";
import { TableColumn } from "../common/Table";
import { useDebounce, DEBOUNCE_DELAYS } from "../../utils/debounce";
import { TimesheetManagementSkeleton } from "../timesheet/Skeleton";
import Badge from "../common/Badge";
import FilterWrapper from "../common/FilterWrapper";
import { useGetMyReferralStatusesQuery, useGetReferralDetailsQuery, useLazyGetReferralDetailsQuery } from "../../store/apis/referral.api";
import ReferralDetails from "./components/ReferralDetails";
import { ReferralStatusEnum } from "../../utils/referralEnum";

// --- Types ---
type ReferralRecord = {
  id: string; // Kept in data for keys/logic, but removed from display
  candidateName: string;
  candidateEmail: string;
  status: string;
  referredAt: string;
  lastActedAt: string;
  totalRounds: number;
};


export const getStatusBadgeConfig = (status: string) => {
  const normalizedStatus = status?.trim() || "";
  
  switch (normalizedStatus) {
    case ReferralStatusEnum.HIRED:
      return { variant: "green", Icon: CheckCircle, label: "Hired" } as const;
    case ReferralStatusEnum.REJECTED:
      return { variant: "red", Icon: XCircle, label: "Rejected" } as const;
    case ReferralStatusEnum.INPROGRESS:
    case ReferralStatusEnum.SCREENING:
    case ReferralStatusEnum.SHORTLISTED:
      return { variant: "blue", Icon: UserCheck, label: normalizedStatus } as const;
    case ReferralStatusEnum.RECEIVED:
      return { variant: "yellow", Icon: Clock, label: "Received" } as const;
    default:
      return { variant: "gray", Icon: Clock, label: normalizedStatus || "-" } as const;
  }
};

// --- Sub-components ---

const ReferralStatsCards = ({ stats }: { stats: any }) => {
  const statItems = [
    { title: "Total Referrals", value: stats?.total || 0, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "In Progress", value: stats?.inProgress || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Successfully Hired", value: stats?.hired || 0, icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
    { title: "Rejected", value: stats?.rejected || 0, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{item.title}</p>
            <h4 className="text-2xl font-bold text-slate-900">{item.value}</h4>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg}`}>
            <item.icon className={`w-6 h-6 ${item.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Main Component ---

const MyReferrals: React.FC = () => {

  // States
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedReferralDetails, setSelectedReferralDetails] = useState<any | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const { data: myReferralStatuses, isLoading: isLoadingMyReferralStatuses } = useGetMyReferralStatusesQuery();
  const [getReferralDetails] = useLazyGetReferralDetailsQuery();

  const debouncedSearch = useDebounce(filters.search, DEBOUNCE_DELAYS.SEARCH);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Calculate dynamic stats from API
  const stats = React.useMemo(() => {
    if (!myReferralStatuses) return { total: 0, inProgress: 0, hired: 0, rejected: 0 };
    return {
      total: myReferralStatuses.length,
      inProgress: myReferralStatuses.filter(ref => 
        ref.status.toLowerCase().includes("progress") || 
        ref.status.toLowerCase().includes("interview") || 
        ref.status.toLowerCase().includes("pending") || 
        ref.status.toLowerCase().includes("received") ||
        ref.status.toLowerCase().includes("shortlisted")).length,
      hired: myReferralStatuses.filter(ref => 
        ref.status.toLowerCase().includes("hired") || 
        ref.status.toLowerCase().includes("success") || 
        ref.status.toLowerCase().includes("selected")).length,
      rejected: myReferralStatuses.filter(ref => 
        ref.status.toLowerCase().includes("reject")).length,
    };
  }, [myReferralStatuses]);

  // Handle local filtering
  const displayedData = React.useMemo(() => {
    let filtered = myReferralStatuses || [];

    if (debouncedSearch) {
      filtered = filtered.filter(ref =>
        ref.candidateName?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(ref => ref.status.toLowerCase().includes(filters.status.toLowerCase()));
    }
    
    return filtered;
  }, [myReferralStatuses, debouncedSearch, filters.status]);

  // Update total in pagination dynamically
  useEffect(() => {
    setPagination(prev => ({ ...prev, total: displayedData.length, page: 1 }));
  }, [displayedData.length]);

  const pagedData = React.useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return displayedData.slice(start, start + pagination.limit);
  }, [displayedData, pagination.page, pagination.limit]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = async (id: string) => {
    setOpenViewModal(true);
    setIsFetchingDetails(true);
    try {
      setSelectedReferralDetails(null);
      const res = await getReferralDetails(id).unwrap();  
      setSelectedReferralDetails(res);
    } catch {
      toast.error("Referral Details Not Found")
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // Table Columns Setup
  const columns = useMemo<TableColumn<ReferralRecord>[]>(() => [
    {
      key: "id",
      title: "Referral ID",
      label: "Referral ID",
      dataIndex: "id",
      width: "12%",
      render: (_: unknown, record: ReferralRecord) => (
        <span className="font-medium text-slate-900">{record.id}</span>
      )
    },
    {
      key: "candidateName",
      title: "Candidate Name",
      label: "Candidate Name",
      required: true,
      dataIndex: "candidateName",
      width: "18%",
      render: (_: unknown, record: ReferralRecord) => (
        <span className="font-medium text-slate-900">{record.candidateName || "N/A"}</span>
      )
    },
    {
      key: "candidateEmail",
      title: "Candidate Email",
      label: "Candidate Email",
      dataIndex: "candidateEmail",
      width: "20%",
      render: (_: unknown, record: ReferralRecord) => (
        <span className="font-medium text-slate-900">{record.candidateEmail || "N/A"}</span>
      )
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      dataIndex: "status",
      width: "12%",
      render: (_: unknown, record: ReferralRecord) => {
        const { variant, Icon, label } = getStatusBadgeConfig(record.status);

        return (
          <Badge variant={variant}>
            <span className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          </Badge>
        );
      }
    },
    {
      key: "referredAt",
      title: "Referred At",
      label: "Referred At",
      dataIndex: "referredAt",
      width: "12%",
      render: (_: unknown, record: ReferralRecord) => {
        const dateStr = record.referredAt ? new Date(record.referredAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }) : "N/A";
        return <span className="font-medium text-slate-900">{dateStr}</span>;
      }
    },
    {
      key: "lastActedAt",
      title: "Last Acted At",
      label: "Last Acted At",
      dataIndex: "lastActedAt",
      width: "12%",
      render: (_: unknown, record: ReferralRecord) => {
        const dateStr = record.lastActedAt ? new Date(record.lastActedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }) : "N/A";
        return <span className="font-medium text-slate-900">{dateStr}</span>;
      }
    },
    {
      key: "totalRounds",
      title: "Total Rounds",
      label: "Total Rounds",
      dataIndex: "totalRounds",
      width: "10%",
      render: (_: unknown, record: ReferralRecord) => (
        <span className="font-medium text-slate-900">{record.totalRounds || 0}</span>
      )
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      align: "right",
      width: "4%",
      render: (_: unknown, record: ReferralRecord) => (
        <div className="flex items-center justify-end">
          <SimpleTooltip label="View Details" side="top" delay={300}>
            <button
              type="button"
              className="p-1 cursor-pointer text-primary-600 hover:text-primary-700 transition-colors"
              onClick={(e) => {
                e.currentTarget.blur();
                handleViewDetails(record.id);
              }}
            >
              <Eye className="w-4 h-4" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    }
  ], []);

  return (
    <div className="p-6 max-w-full mx-auto bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#f8f9fc] px-6 pt-6 pb-4 -mx-6 mb-6">
        <div className="sm:flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 md:text-3xl">
            My Referrals
          </h1>
        </div>
      </div>
    </div>

      {/* Stats Section */}
      <div className="mb-6">
        {isLoadingMyReferralStatuses ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-[104px] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <ReferralStatsCards stats={stats} />
        )}
      </div>

      {/* Filters */}
      <FilterWrapper>
        <div className="flex-1">
          <SearchInput
            value={filters.search}
            onChange={(v) => handleFilterChange("search", v)}
            placeholder="Search by candidate name..."
            debounceDelay={300}
          />
        </div>
      </FilterWrapper>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200 mt-8 overflow-visible">
        <ConfigurableTable
          columns={columns}
          data={pagedData as any}
          loading={isLoadingMyReferralStatuses}
          skeleton={<TimesheetManagementSkeleton rows={5} />}
          emptyMessage="No referrals found"
          maxHeight="70vh"
          configOptions={{ persistenceKey: "my-referrals-table" }}
          renderColumnSelector={(selector) => (
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Submission History ({pagination.total})
              </h3>
              {selector}
            </div>
          )}
        />
        
        {!isLoadingMyReferralStatuses && pagination.total > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
            onItemsPerPageChange={(l) => setPagination((prev) => ({ ...prev, page: 1, limit: l }))}
          />
        )}
      </div>

      <ReferralDetails
        isOpen={openViewModal}
        onClose={() => setOpenViewModal(false)}
        isLoading={isFetchingDetails}
        referralObj={selectedReferralDetails}
      />
    </div>
  );
};

export default MyReferrals;