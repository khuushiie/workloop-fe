import React, { useState, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import toast from "react-hot-toast";
import { ApiError } from "../../../store/utils/apiError";
import { CheckCircle, ChevronDown, ChevronUp, Eye, X } from "lucide-react";
import {
  useGetBookingListQuery,
  usePerformBookingActionMutation,
} from "../../../store/apis/gameBooking.api";
import type { GameBookingItem } from "../../../store/apis/gameBooking.api";
import {
  Modal,
  SimpleTooltip,
  ConfigurableTable,
  Pagination,
  Select,
  DatePicker,
  SearchInput,
} from "../../common";
import type { TableColumn } from "../../common/Table";
import Badge from "../../common/Badge";
import FilterWrapper from "../../common/FilterWrapper";
import { getWorkflowStatusVariant } from "../../../utils/badgeVariants";
import {
  getWorkflowStatusFallbackLabel,
  WorkflowQueryStatus,
  isPendingWorkflowStatus,
} from "../../../utils/constants";
import { MasterConfigCategory } from "../../../constants";
import { capitalizeWords } from "../../../utils/nameUtils";
import RejectionModal from "../../leave/modals/RejectionModal";
import { useGetMasterConfigByCategoryQuery } from "../../../store/apis/masterConfig.api";
import { isGameBookingPeriod } from "../../../utils/gameBookingPeriod";
import { TimesheetManagementSkeleton } from "../../timesheet/Skeleton";

dayjs.extend(utc);
dayjs.extend(timezone);

interface AdminTabProps {
  hideHistory?: boolean;
  hideFilters?: boolean;
}

const GameBookingAdminTab: React.FC<AdminTabProps> = ({ hideHistory, hideFilters }) => {
  const userTimezone = dayjs.tz.guess();

  const [activeAccordion, setActiveAccordion] = useState<"pending" | "history">(
    "pending",
  );

  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLimit, setPendingLimit] = useState(10);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);

  const [processing, setProcessing] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<GameBookingItem | null>(null);

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGameId, setFilterGameId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState<string | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<string | undefined>();

  const { data: games = [] } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.GAME_TYPE,
  );
  const gameOptions = [
    { value: "", label: "All Games" },
    ...games
      .filter((g) => g.isActive)
      .map((g) => ({ value: g.id, label: g.displayName })),
  ];

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPendingPage(1);
    setHistoryPage(1);
  }, []);

  const commonFilters = {
    ...(searchTerm ? { search: searchTerm } : {}),
    ...(filterGameId ? { gameId: filterGameId } : {}),
    ...(filterStartDate ? { startDate: filterStartDate } : {}),
    ...(filterEndDate ? { endDate: filterEndDate } : {}),
  };

  const { data: pendingResponse, isLoading: pendingLoading } =
    useGetBookingListQuery({
      status: WorkflowQueryStatus.PENDING,
      page: pendingPage,
      limit: pendingLimit,
      ...commonFilters,
    });

  const { data: historyResponse, isLoading: historyLoading } =
    useGetBookingListQuery({
      status: WorkflowQueryStatus.HISTORY,
      page: historyPage,
      limit: historyLimit,
      ...commonFilters,
    });

  const [performAction] = usePerformBookingActionMutation();

  const pendingBookings = pendingResponse?.data ?? [];
  const pendingTotal = pendingResponse?.total ?? 0;
  const historyBookings = historyResponse?.data ?? [];
  const historyTotal = historyResponse?.total ?? 0;

  const formatDateTime = (dateStr: string) =>
    dayjs(dateStr).tz(userTimezone).format("DD/MM/YYYY hh:mm A");

  const formatTime = (dateStr: string) =>
    dayjs(dateStr).tz(userTimezone).format("hh:mm A");

  const handleApprove = async (bookingId: string) => {
    try {
      setProcessing(bookingId);
      await performAction({ id: bookingId, decision: "approved" }).unwrap();
      toast.success("Booking approved successfully.");
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage = err?.data?.message || "Failed to approve booking.";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      toast.error(errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (bookingId: string) => {
    setRejectTarget(bookingId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) return;
    try {
      setProcessing(rejectTarget);
      await performAction({
        id: rejectTarget,
        decision: "rejected",
        remarks: rejectionReason,
      }).unwrap();
      toast.success("Booking rejected successfully.");
      setShowRejectModal(false);
      setRejectTarget(null);
      setRejectionReason("");
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage = err?.data?.message || "Failed to reject booking.";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      toast.error(errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDetails = (booking: GameBookingItem) => {
    setSelectedBooking(booking);
    setDetailsModalOpen(true);
  };

  const buildColumns = (
    showActions: boolean,
  ): TableColumn<GameBookingItem>[] => [
    {
      key: "gameName",
      title: "Game",
      label: "Game",
      required: true,
      render: (_, r) => (
        <span className="text-sm font-medium text-slate-900">{r.gameName}</span>
      ),
    },
    {
      key: "date",
      title: "Date & Time",
      label: "Date & Time",
      render: (_, r) => (
        <span className="text-sm text-slate-900">
          {dayjs(r.startTime).tz(userTimezone).format("DD/MM/YYYY")}{" "}
          {formatTime(r.startTime)} - {formatTime(r.endTime)}
        </span>
      ),
    },
    {
      key: "creatorName",
      title: "Booked By",
      label: "Booked By",
      render: (_, r) => (
        <span className="text-sm text-slate-900 capitalize">
          {r.creatorName || "—"}
        </span>
      ),
    },
    {
      key: "participants",
      title: "Participants",
      label: "Participants",
      render: (_, r) => (
        <span className="text-sm text-slate-900">
          {(r.participantNames ?? []).length}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      render: (_, r) => (
        <Badge variant={getWorkflowStatusVariant(r.status)} size="middle">
          {r.statusLabel ??
            capitalizeWords(
              getWorkflowStatusFallbackLabel(r.status, r.currentActorName) ?? r.status,
            )}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <SimpleTooltip label="View" side="top" className="inline-block">
            <button
              onClick={() => handleViewDetails(r)}
              disabled={!!processing}
              aria-label="View"
              className={`text-primary-600 hover:text-primary-900 transition-colors ${!!processing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </SimpleTooltip>
          {showActions &&
            isPendingWorkflowStatus(r.status) &&
            isGameBookingPeriod(r) && (
              <>
                <SimpleTooltip
                  label="Approve"
                  side="top"
                  className="inline-block"
                >
                  <button
                    onClick={() => handleApprove(r.id)}
                    disabled={!!processing}
                    aria-label="Approve"
                    className={`text-green-600 hover:text-green-800 transition-colors ${!!processing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </SimpleTooltip>
                <SimpleTooltip
                  label="Reject"
                  side="top"
                  className="inline-block"
                >
                  <button
                    onClick={() => handleRejectClick(r.id)}
                    disabled={!!processing}
                    aria-label="Reject"
                    className={`text-red-600 hover:text-red-800 transition-colors ${!!processing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </SimpleTooltip>
              </>
            )}
        </div>
      ),
    },
  ];

  return (
    <div className="mt-4">
      {!hideFilters && (
        <FilterWrapper>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchInput
              label="Search"
              debounceDelay={600}
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by game or user name"
            />
            <Select
              label="Game"
              value={filterGameId}
              onChange={(val) => {
                setFilterGameId(val ? String(val) : "");
                setPendingPage(1);
                setHistoryPage(1);
              }}
              options={gameOptions}
              searchable
            />
            <DatePicker
              label="From Date"
              value={filterStartDate ? dayjs(filterStartDate) : undefined}
              onChange={(d: Dayjs | null) => {
                setFilterStartDate(d ? d.toISOString() : undefined);
                setPendingPage(1);
                setHistoryPage(1);
              }}
              maxDate={filterEndDate ? dayjs(filterEndDate) : undefined}
              format="DD/MM/YYYY"
            />
            <DatePicker
              label="To Date"
              value={filterEndDate ? dayjs(filterEndDate) : undefined}
              onChange={(d: Dayjs | null) => {
                setFilterEndDate(d ? d.toISOString() : undefined);
                setPendingPage(1);
                setHistoryPage(1);
              }}
              minDate={filterStartDate ? dayjs(filterStartDate) : undefined}
              format="DD/MM/YYYY"
            />
          </div>
        </FilterWrapper>
      )}

      {/* Pending Booking Approvals Accordion */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200">
        {activeAccordion !== "pending" ? (
          <button
            className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
            onClick={() => setActiveAccordion("pending")}
          >
            <span className="text-xl font-bold text-slate-900">
              Pending Booking Approvals ({pendingTotal})
            </span>
            <ChevronDown className="w-5 h-5" />
          </button>
        ) : (
          <div className="p-0">
            {pendingLoading ? (
              <div className="p-6">
                <TimesheetManagementSkeleton rows={6} />
              </div>
            ) : (
              <ConfigurableTable
                columns={buildColumns(true)}
                data={pendingBookings}
                loading={pendingLoading}
                emptyMessage="No pending booking approvals"
                rowKey={(b) => b.id}
                configOptions={{
                  persistenceKey: "game-booking-pending-table",
                }}
                spacing={0}
                renderColumnSelector={(selector) => (
                  <div
                    className="w-full text-left px-4 py-3 border-b flex items-center justify-between gap-3 cursor-pointer"
                    onClick={() => setActiveAccordion("history")}
                  >
                    <span className="text-xl font-bold text-slate-900">
                      Pending Booking Approvals ({pendingTotal})
                    </span>
                    <div className="flex items-center gap-4">
                      <div onClick={(e) => e.stopPropagation()}>{selector}</div>
                      <ChevronUp className="w-5 h-5" />
                    </div>
                  </div>
                )}
              />
            )}

            {activeAccordion === "pending" && (
              <div className="p-6 pt-0 mt-4">
                <Pagination
                  currentPage={pendingPage}
                  totalItems={pendingTotal}
                  itemsPerPage={pendingLimit}
                  onPageChange={setPendingPage}
                  onItemsPerPageChange={(l) => {
                    setPendingLimit(l);
                    setPendingPage(1);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking History Accordion */}
      {!hideHistory && (
        <div className="bg-white rounded-xl shadow-soft border border-slate-200 mt-6">
          {activeAccordion !== "history" ? (
            <button
              className="w-full text-left p-4 flex items-center justify-between"
              onClick={() => setActiveAccordion("history")}
            >
              <span className="text-xl font-bold text-slate-900">
                Booking History ({historyTotal})
              </span>
              <ChevronDown className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-0">
              {historyLoading ? (
                <div className="p-6">
                  <TimesheetManagementSkeleton rows={6} />
                </div>
              ) : (
                <ConfigurableTable
                  columns={buildColumns(false)}
                  data={historyBookings}
                  loading={historyLoading}
                  emptyMessage="No booking history"
                  rowKey={(b) => b.id}
                  configOptions={{ persistenceKey: "game-booking-history-table" }}
                  spacing={0}
                  renderColumnSelector={(selector) => (
                    <div
                      className="w-full text-left p-4 border-b flex items-center justify-between cursor-pointer"
                      onClick={() => setActiveAccordion("pending")}
                    >
                      <span className="text-xl font-bold text-slate-900">
                        Booking History ({historyTotal})
                      </span>
                      <div className="flex items-center gap-4">
                        <div onClick={(e) => e.stopPropagation()}>{selector}</div>
                        <ChevronUp className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                />
              )}

              {activeAccordion === "history" && (
                <div className="p-6 pt-0 mt-4">
                  <Pagination
                    currentPage={historyPage}
                    totalItems={historyTotal}
                    itemsPerPage={historyLimit}
                    onPageChange={setHistoryPage}
                    onItemsPerPageChange={(l) => {
                      setHistoryLimit(l);
                      setHistoryPage(1);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showRejectModal && (
        <RejectionModal
          rejectionReason={rejectionReason}
          selectedLeave={rejectTarget}
          confirmReject={confirmReject}
          processing={processing}
          setRejectionReason={setRejectionReason}
          setSelectedLeave={setRejectTarget}
          setShowRejectModal={setShowRejectModal}
          title="Reject Game Booking"
          description="Please provide a reason for rejecting this booking."
        />
      )}

      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Booking Details"
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-900">
              <div>
                <p className="font-medium text-slate-600">Game</p>
                <p>{selectedBooking.gameName}</p>
              </div>
              <div>
                <p className="font-medium text-slate-600">Booked By</p>
                <p className="capitalize">{selectedBooking.creatorName}</p>
              </div>
              <div>
                <p className="font-medium text-slate-600">Date & Time</p>
                <p>{formatDateTime(selectedBooking.startTime)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-600">Duration</p>
                <p>{selectedBooking.duration} min</p>
              </div>
              <div>
                <p className="font-medium text-slate-600">Status</p>
                <Badge
                  variant={getWorkflowStatusVariant(selectedBooking.status)}
                  size="middle"
                >
                  {selectedBooking.statusLabel ??
                    capitalizeWords(
                      getWorkflowStatusFallbackLabel(selectedBooking.status, selectedBooking.currentActorName) ??
                      selectedBooking.status,
                    )}
                </Badge>
              </div>
              <div>
                <p className="font-medium text-slate-600">Participants</p>
                <p className="capitalize">
                  {(selectedBooking.participantNames ?? []).join(", ") || "—"}
                </p>
              </div>
            </div>
            {selectedBooking.notes && (
              <div>
                <p className="font-medium text-slate-600">Notes</p>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">
                  {selectedBooking.notes}
                </p>
              </div>
            )}
            {selectedBooking.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-medium text-red-700 text-sm">
                  Rejection Reason
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {selectedBooking.rejectionReason}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GameBookingAdminTab;
