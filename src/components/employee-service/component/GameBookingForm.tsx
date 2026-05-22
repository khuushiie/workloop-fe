import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import toast from "react-hot-toast";
import { Select, DatePicker, TimePicker, Button } from "../../common";
import { TextArea } from "../../common/TextArea";
import { useGetMasterConfigByCategoryQuery } from "../../../store/apis/masterConfig.api";
import { MasterConfigCategory } from "../../../constants";
import type { EmployeeOption } from "../EmployeeSelfService";

interface GameBookingFormProps {
  users: EmployeeOption[];
  currentUserId: string;
  onSubmit: (data: {
    gameId: string;
    startTime: string;
    duration: number;
    participants: string[];
    notes: string;
  }) => Promise<void>;
  submitting: boolean;
}

const DURATION_OPTIONS = [
  { label: "15 min", value: "15" },
  { label: "30 min", value: "30" },
  { label: "45 min", value: "45" },
  { label: "60 min", value: "60" },
];

const GameBookingForm: React.FC<GameBookingFormProps> = ({
  users,
  currentUserId,
  onSubmit,
  submitting,
}) => {
  const { data: games = [] } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.GAME_TYPE,
  );

  const [formData, setFormData] = useState({
    gameId: "",
    date: "" as string,
    time: null as Dayjs | null,
    duration: "30",
    participants: [] as string[],
    notes: "",
  });

  const gameOptions = games
    .filter((g) => g.isActive)
    .map((g) => ({ label: g.displayName, value: g.id }));

  const handleReset = () => {
    setFormData({
      gameId: "",
      date: "",
      time: null,
      duration: "30",
      participants: [],
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.gameId) {
      toast.error("Please select a game.");
      return;
    }
    if (!formData.date) {
      toast.error("Please select a date.");
      return;
    }
    if (!formData.time) {
      toast.error("Please select a start time.");
      return;
    }

    const datePart = formData.date;
    const timePart = formData.time.format("HH:mm");
    const startTime = dayjs(`${datePart} ${timePart}`).toISOString();

    try {
      await onSubmit({
        gameId: formData.gameId,
        startTime,
        duration: Number(formData.duration),
        participants: formData.participants.filter((p) => p !== currentUserId),
        notes: formData.notes,
      });
      handleReset();
    } catch {
      // Form keeps its values on failure so the user can retry
    }
  };

  const handleDateChange = (value: Dayjs | null) => {
    setFormData((prev) => ({
      ...prev,
      date: value ? value.format("YYYY-MM-DD") : "",
    }));
  };

  return (
    <div className="p-6 bg-white max-w-full rounded-xl shadow-soft border border-slate-200 mt-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          Create Game Booking
        </h1>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Game <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.gameId}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  gameId: val as string,
                }))
              }
              options={gameOptions}
              placeholder="Select game"
              className="w-full mt-2"
              searchable
            />
          </div>

          <div>
            <DatePicker
              label="Date"
              required
              value={formData.date ? dayjs(formData.date) : null}
              onChange={handleDateChange}
              placeholder="Select date"
              className="w-full"
              format="DD/MM/YYYY"
              allowClear={false}
              minDate={dayjs().startOf("day")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="booking-start-time"
                type="time"
                /* Native input requires HH:mm format */
                value={formData.time ? formData.time.format("HH:mm") : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setFormData((prev) => ({ ...prev, time: null }));
                    return;
                  }
                  // Convert the "HH:mm" string back to a Dayjs object so handleSubmit doesn't break
                  const [hours, minutes] = val.split(":");
                  const newTime = dayjs().hour(Number(hours)).minute(Number(minutes)).second(0);
                  setFormData((prev) => ({ ...prev, time: newTime }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Duration
            </label>
            <Select
              value={formData.duration}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  duration: val as string,
                }))
              }
              options={DURATION_OPTIONS}
              placeholder="Select duration"
              className="w-full mt-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Participants
            </label>
            <Select
              value={formData.participants}
              onChange={(vals) =>
                setFormData((prev) => ({
                  ...prev,
                  participants: vals as string[],
                }))
              }
              options={users}
              placeholder="Select participants"
              className="w-full mt-2"
              searchable
              multiple
            />
          </div>
        </div>

        <div>
          <TextArea
            label="Notes"
            value={formData.notes}
            onChange={(value) => setFormData((prev) => ({ ...prev, notes: value }))}
            placeholder="Optional notes for the booking..."
          />
        </div>

        <div className="flex items-center gap-4 justify-end">
          <Button
            htmlType="button"
            appearance="secondary"
            size="large"
            onClick={handleReset}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>
          <Button
            htmlType="submit"
            appearance="primary"
            size="large"
            loading={submitting}
          >
            {submitting ? "Booking..." : "Book Slot"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GameBookingForm;
