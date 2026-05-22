import React from 'react';
import { Calendar } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import AccordionWrapper from '../components/AccordionWrapper';
import DatePicker from '../../../common/DatePicker';
import { SurveySchedule } from '../../types';

dayjs.extend(utc);
dayjs.extend(timezone);

interface ScheduleAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  schedule: SurveySchedule;
  onScheduleChange: (schedule: Partial<SurveySchedule>) => void;
  scheduleError?: string;
  readOnly?: boolean;
}

const parseScheduleToLocal = (dateStr: string | null, timeStr: string | null): Dayjs | null => {
  if (!dateStr) return null;

  try {
    const timeValue = timeStr || '00:00';
    const isoString = `${dateStr}T${timeValue}:00.000Z`;
    const parsed = dayjs.utc(isoString);

    if (!parsed.isValid()) return null;

    return parsed.local();
  } catch {
    return null;
  }
};

const localToUTCComponents = (value: Dayjs | null): { date: string | null; time: string | null } => {
  if (!value || !value.isValid()) return { date: null, time: null };

  const utcValue = value.utc();
  return {
    date: utcValue.format('YYYY-MM-DD'),
    time: utcValue.format('HH:mm'),
  };
};

const ScheduleAccordion: React.FC<ScheduleAccordionProps> = ({
  isOpen,
  onToggle,
  schedule,
  onScheduleChange,
  scheduleError,
  readOnly = false,
}) => {
  // Convert stored UTC values to local Dayjs for display
  const startDateTime = parseScheduleToLocal(schedule.startDate, schedule.startTime);
  const endDateTime = parseScheduleToLocal(schedule.endDate, schedule.endTime);

  // Handle start date/time change - convert to UTC before storing
  const handleStartChange = (value: Dayjs | null) => {
    const { date, time } = localToUTCComponents(value);
    onScheduleChange({ startDate: date, startTime: time });
  };

  // Handle end date/time change - convert to UTC before storing
  const handleEndChange = (value: Dayjs | null) => {
    const { date, time } = localToUTCComponents(value);
    onScheduleChange({ endDate: date, endTime: time });
  };

  return (
    <AccordionWrapper
      title="Schedule & Duration"
      subtitle="Set the start and end date/time for the survey"
      icon={<Calendar className="w-4 h-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
      error={scheduleError}
    >
      <div className="space-y-4">
        {/* Start Date/Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {/* Your Custom DatePicker handles the Calendar */}
              <div className="flex-1">
                <DatePicker
                  value={startDateTime}
                  onChange={(newDate) => {
                    if (!newDate) {
                      handleStartChange(null);
                      return;
                    }
                    // Merge: If a time was already selected, preserve it
                    if (startDateTime) {
                      handleStartChange(
                        newDate.hour(startDateTime.hour()).minute(startDateTime.minute()).second(0)
                      );
                    } else {
                      handleStartChange(newDate);
                    }
                  }}
                  placeholder="Select date"
                  format="DD/MM/YYYY"
                  minDate={dayjs().startOf("day")}
                  disabled={readOnly}
                />
              </div>
              {/* Native Time Input strictly matching DatePicker styles */}
              <div className="w-[140px]">
                <input
                  type="time"
                  value={startDateTime ? startDateTime.format("HH:mm") : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const [hours, minutes] = val.split(":");
                    // Merge: If no date is selected yet, default to today
                    const baseDate = startDateTime || dayjs();
                    handleStartChange(baseDate.hour(Number(hours)).minute(Number(minutes)).second(0));
                  }}
                  disabled={readOnly}
                  className="w-full h-[40px] px-3 border border-[#d9d9d9] rounded-[8px] focus:outline-none focus:border-[#40a9ff] focus:ring-[2px] focus:ring-[#1890ff]/20 disabled:bg-[#f5f5f5] disabled:text-[#00000040] transition-colors bg-white text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* End Date/Time */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DatePicker
                  value={endDateTime}
                  onChange={(newDate) => {
                    if (!newDate) {
                      handleEndChange(null);
                      return;
                    }
                    if (endDateTime) {
                      handleEndChange(
                        newDate.hour(endDateTime.hour()).minute(endDateTime.minute()).second(0)
                      );
                    } else {
                      handleEndChange(newDate);
                    }
                  }}
                  placeholder="Select date"
                  format="DD/MM/YYYY"
                  minDate={startDateTime || dayjs().startOf("day")}
                  disabled={readOnly}
                />
              </div>
              <div className="w-[140px]">
                <input
                  type="time"
                  value={endDateTime ? endDateTime.format("HH:mm") : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const [hours, minutes] = val.split(":");
                    const baseDate = endDateTime || startDateTime || dayjs();
                    handleEndChange(baseDate.hour(Number(hours)).minute(Number(minutes)).second(0));
                  }}
                  disabled={readOnly}
                  className="w-full h-[40px] px-3 border border-[#d9d9d9] rounded-[8px] focus:outline-none focus:border-[#40a9ff] focus:ring-[2px] focus:ring-[#1890ff]/20 disabled:bg-[#f5f5f5] disabled:text-[#00000040] transition-colors bg-white text-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Both Start and End times are required.
        </p>
      </div>
    </AccordionWrapper>
  );
};

export default ScheduleAccordion;
