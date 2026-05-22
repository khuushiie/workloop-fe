import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Modal from "../common/Modal";
import SimpleTooltip from "../common/SimpleTooltip";
import Table, { TableColumn } from "../common/Table";
import { TimesheetEntry, TimesheetTask } from "../../types/timesheet";
import {
  TIMESHEET_STATUS_COLORS,
  getWorkflowStatusFallbackLabel,
  isPendingWorkflowStatus,
  isApprovedWorkflowStatus,
  isRejectedWorkflowStatus,
} from "../../utils/constants";
import { convertToHourMinute } from "../../utils/convertToHourMinute";
dayjs.extend(utc);
dayjs.extend(timezone);

interface TimesheetViewModalProps {
  timesheet: TimesheetEntry | null;
  onClose: () => void;
}

const TimesheetViewModal: React.FC<TimesheetViewModalProps> = ({
  timesheet,
  onClose,
}) => {
  const userTimezone = dayjs.tz.guess();
  const taskColumns: TableColumn<TimesheetTask>[] = [
    {
      key: "index",
      title: "No.",
      width: "50px",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      key: "project",
      title: "Project",
      dataIndex: "project",
      width: "100px",
      render: (value: unknown) => (
        <span
          className="text-start font-bold text-slate-900 whitespace-normal line-clamp-3 break-words block"
          title={value}
        >
          {value as string}
        </span>
      ),
    },

    {
      key: "name",
      title: "Task",
      dataIndex: "name",
      width: "120px",
      render: (value: unknown) => (
        <span
          className="text-start font-bold text-slate-900 whitespace-normal !line-clamp-3 break-words block"
          title={value}
        >
          {value as string}
        </span>
      ),
    },

    {
      key: "time",
      title: "Time",
      width: "150px",
      align: "center",
      render: (_: unknown, record: TimesheetTask) => (
        <span className="inline-flex items-center gap-1 text-slate-600">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {dayjs(record.startTime).tz(userTimezone).format("HH:mm")}
          </span>
          <span>-</span>
          <span>{dayjs(record.endTime).tz(userTimezone).format("HH:mm")}</span>
        </span>
      ),
    },

    {
      key: "hours",
      title: "Hours",
      width: "100px",
      align: "center",
      dataIndex: "hours",
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-sm font-bold">
          {convertToHourMinute(value)}hr
        </span>
      ),
    },

    {
      key: "description",
      title: "Description",
      dataIndex: "description",
      width: "250px",
      render: (text?: string) => (
        <SimpleTooltip label={text || "No description"} side="top" delay={600}>
          <div className="text-start whitespace-normal line-clamp-3 break-words text-slate-600">
            {text || (
              <span className="text-slate-400 italic">No description</span>
            )}
          </div>
        </SimpleTooltip>
      ),
    },
  ];

  return (
    <Modal
      isOpen={!!timesheet}
      onClose={onClose}
      title="Timesheet Details"
      size="7xl"
    >
      {timesheet && (
        <div className="space-y-6 w-full">
          <div className="rounded-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-900 font-medium mb-0">
                        Name
                      </p>
                      <p className="text-sm text-slate-500 font-semibold ">
                        {timesheet.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-900 font-medium mb-0 ">
                        Email
                      </p>
                      <p className="text-sm text-slate-500">
                        {timesheet.workEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timesheet Info */}
              <div className="space-y-4">
                {/* <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Timesheet Details</h3> */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-900 font-medium mb-0">
                        Date
                      </p>
                      <p className="text-sm text-slate-500 font-semibold">
                        {dayjs(timesheet.date)
                          .tz(userTimezone)
                          .format("DD/MM/YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-900 font-medium mb-0">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center px-1 py-0.5 rounded-full text-[11px] font-semibold border ${
                          timesheet.status === "draft"
                            ? "bg-slate-50 text-slate-700 border-slate-200"
                            : isPendingWorkflowStatus(timesheet.status)
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : isApprovedWorkflowStatus(timesheet.status)
                                ? "bg-green-50 text-green-700 border-green-200"
                                : isRejectedWorkflowStatus(timesheet.status)
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : TIMESHEET_STATUS_COLORS[
                                      timesheet.status as keyof typeof TIMESHEET_STATUS_COLORS
                                    ] ||
                                    "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {timesheet.statusLabel ||
                          getWorkflowStatusFallbackLabel(
                            timesheet.status,
                            timesheet.currentApproverName,
                          )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Table */}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">
                Task Breakdown
              </h3>
            </div>

            <div className="w-full overflow-x-auto">
              <div className="min-w-[740px] md:min-w-full">
                <Table
                  columns={taskColumns}
                  data={timesheet.tasks}
                  striped
                  hoverable={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TimesheetViewModal;
