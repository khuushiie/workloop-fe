import React, { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import toast from "react-hot-toast";
import { ApiError } from "../../../store/utils/apiError";
import { useAuth } from "../../../store/hooks/useAuth";
import { useGetAllOrgUsersForFilterQuery } from "../../../store/apis/user.api";
import {
  useGetMyBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} from "../../../store/apis/gameBooking.api";
import type { GameBookingItem } from "../../../store/apis/gameBooking.api";
import { Modal, ConfirmationModal } from "../../common";
import Badge from "../../common/Badge";
import { getWorkflowStatusVariant } from "../../../utils/badgeVariants";
import {
  getWorkflowStatusFallbackLabel,
  isPendingWorkflowStatus,
} from "../../../utils/constants";
import { capitalizeWords } from "../../../utils/nameUtils";
import GameBookingForm from "./GameBookingForm";
import GameBookingTable from "./GameBookingTable";
import type { EmployeeOption } from "../EmployeeSelfService";
import { isGameBookingPeriod } from "../../../utils/gameBookingPeriod";

dayjs.extend(utc);
dayjs.extend(timezone);

const GameBookingTab: React.FC = () => {
  const { user } = useAuth();
  const userTimezone = dayjs.tz.guess();

  const { data: usersForFilter } = useGetAllOrgUsersForFilterQuery();
  const users: EmployeeOption[] = (usersForFilter ?? []).map((u) => ({
    label: u.fullName || u.id,
    value: u.id,
  }));

  const { data: myBookings, isLoading: bookingsLoading } =
    useGetMyBookingsQuery(undefined, { skip: !user?.id });
  const [createBooking, { isLoading: submitting }] = useCreateBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<GameBookingItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<GameBookingItem | null>(
    null,
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleSubmit = async (data: {
    gameId: string;
    startTime: string;
    duration: number;
    participants: string[];
    notes: string;
  }) => {
    try {
      await createBooking(data).unwrap();
      toast.success("Booking created successfully!");
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage =
        err?.data?.message || "Failed to create booking. Please try again.";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleViewDetails = (booking: GameBookingItem) => {
    setSelectedBooking(booking);
    setDetailsModalOpen(true);
  };

  const canCancelBooking = (booking: GameBookingItem): boolean =>
    isPendingWorkflowStatus(booking.status) &&
    booking.createdBy === user?.id &&
    isGameBookingPeriod(booking);

  const handleCancelClick = (booking: GameBookingItem) => {
    setConfirmTarget(booking);
    setConfirmOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (!confirmTarget) return;
    try {
      setConfirmLoading(true);
      await cancelBooking(confirmTarget.id).unwrap();
      toast.success("Booking cancelled successfully.");
      setConfirmOpen(false);
      setConfirmTarget(null);
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage = err?.data?.message || "Failed to cancel booking.";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      toast.error(errorMessage);
    } finally {
      setConfirmLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) =>
    dayjs(dateStr).tz(userTimezone).format("DD/MM/YYYY hh:mm A");

  return (
    <div>
      <GameBookingForm
        users={users}
        currentUserId={user?.id ?? ""}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <GameBookingTable
        title="My Bookings"
        bookings={myBookings?.createdByMe ?? []}
        loading={bookingsLoading}
        onViewDetails={handleViewDetails}
        onCancel={handleCancelClick}
        canCancel={canCancelBooking}
      />

      {(myBookings?.participatingIn?.length ?? 0) > 0 && (
        <GameBookingTable
          title="Participating In"
          bookings={myBookings?.participatingIn ?? []}
          loading={bookingsLoading}
          onViewDetails={handleViewDetails}
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
                <p className="font-medium text-slate-600">Created By</p>
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

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmCancelBooking}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking?"
        type="warning"
        confirmText={confirmLoading ? "Cancelling..." : "Cancel Booking"}
        isLoading={confirmLoading}
      />
    </div>
  );
};

export default GameBookingTab;
