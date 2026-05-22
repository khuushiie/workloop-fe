import React from "react";
import { Calendar, Clock, Eye, X } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ConfigurableTable, Pagination, SimpleTooltip } from "../../common";
import type { TableColumn } from "../../common/Table";
import Badge from "../../common/Badge";
import { getWorkflowStatusVariant } from "../../../utils/badgeVariants";
import { getWorkflowStatusFallbackLabel } from "../../../utils/constants";
import type { GameBookingItem } from "../../../store/apis/gameBooking.api";
import { capitalizeWords } from "../../../utils/nameUtils";
import { TimesheetManagementSkeleton } from "../../timesheet/Skeleton";

dayjs.extend(utc);
dayjs.extend(timezone);

interface GameBookingTableProps {
  title: string;
  bookings: GameBookingItem[];
  loading: boolean;
  onViewDetails: (booking: GameBookingItem) => void;
  onCancel?: (booking: GameBookingItem) => void;
  canCancel?: (booking: GameBookingItem) => boolean;
  pagination?: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (size: number) => void;
  };
}

const GameBookingTable: React.FC<GameBookingTableProps> = ({
  title,
  bookings,
  loading,
  onViewDetails,
  onCancel,
  canCancel,
  pagination,
}) => {
  const userTimezone = dayjs.tz.guess();

  const formatDateTime = (dateStr: string) =>
    dayjs(dateStr).tz(userTimezone).format("DD/MM/YYYY hh:mm A");

  const formatTime = (dateStr: string) =>
    dayjs(dateStr).tz(userTimezone).format("hh:mm A");

  const columns: TableColumn<GameBookingItem>[] = [
    {
      key: "gameName",
      title: "Game",
      label: "Game",
      required: true,
      render: (_, record) => (
        <span className="text-sm font-medium text-slate-900">
          {record.gameName}
        </span>
      ),
    },
    {
      key: "date",
      title: "Date",
      label: "Date",
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-900">
            {dayjs(record.startTime).tz(userTimezone).format("DD/MM/YYYY")}
          </span>
        </div>
      ),
    },
    {
      key: "timeSlot",
      title: "Time Slot",
      label: "Time Slot",
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-900">
            {formatTime(record.startTime)} - {formatTime(record.endTime)}
          </span>
        </div>
      ),
    },
    {
      key: "duration",
      title: "Duration",
      label: "Duration",
      render: (_, record) => (
        <span className="text-sm text-slate-900">{record.duration} min</span>
      ),
    },
    {
      key: "creatorName",
      title: "Created By",
      label: "Created By",
      render: (_, record) => (
        <span className="text-sm text-slate-900 capitalize">
          {record.creatorName || "—"}
        </span>
      ),
    },
    {
      key: "participants",
      title: "Participants",
      label: "Participants",
      render: (_, record) => (
        <SimpleTooltip
          label={(record.participantNames ?? []).join(", ") || "—"}
          side="top"
        >
          <span className="text-sm text-slate-900">
            {(record.participantNames ?? []).length} participant(s)
          </span>
        </SimpleTooltip>
      ),
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      render: (_, record) => (
        <Badge variant={getWorkflowStatusVariant(record.status)} size="middle">
          {record.statusLabel ??
            capitalizeWords(
              getWorkflowStatusFallbackLabel(record.status, record.currentActorName) ?? record.status,
            )}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <SimpleTooltip label="View" side="top" className="inline-block">
            <button
              onClick={() => onViewDetails(record)}
              aria-label="View"
              className="text-primary-600 hover:text-primary-900 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </SimpleTooltip>
          {onCancel && canCancel?.(record) && (
            <SimpleTooltip label="Cancel" side="top" className="inline-block">
              <button
                onClick={() => onCancel(record)}
                aria-label="Cancel"
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </SimpleTooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 mt-4">
      <ConfigurableTable<GameBookingItem>
        columns={columns}
        data={bookings}
        loading={loading}
        skeleton={<TimesheetManagementSkeleton rows={5} />}
        emptyMessage="No bookings found"
        rowKey={(b) => b.id}
        spacing={0}
        configOptions={{ persistenceKey: `game-booking-table-${title.toLowerCase().replace(/\s+/g, '-')}` }}
        renderColumnSelector={(selector) => (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {selector}
          </div>
        )}
      />
      
      {pagination && (
        <div className="p-6 pt-0 mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.onPageChange}
            onItemsPerPageChange={pagination.onItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default GameBookingTable;
