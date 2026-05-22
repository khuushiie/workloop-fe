import React, { useState, useEffect } from "react";
import { X, Plus, Save, RotateCcw, Copy } from "lucide-react";
import {
  useCreateTimesheetMutation,
  useUpdateTimesheetMutation,
} from "../../store/apis/timesheet.api";

import {
  CreateTimesheetDto,
  TimesheetTask,
  TimesheetEntry,
} from "../../types/timesheet";
import toast from "react-hot-toast";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DatePicker } from "../common";
import Button from "../common/Button";
import Input from "../common/Input";
import { TextArea } from "../common/TextArea";
import { convertToHourMinute } from "../../utils/convertToHourMinute";
import {
  ICreateTimesheetBody,
  IUpdateTimesheetBody,
} from "../../types/timesheet.api.types";

dayjs.extend(utc);
dayjs.extend(timezone);

interface AddTimesheetModalProps {
  editingTimesheet?: TimesheetEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTimesheetModal: React.FC<AddTimesheetModalProps> = ({
  editingTimesheet,
  onClose,
  onSuccess,
}) => {
  const userTimezone = dayjs.tz.guess();

  const [formData, setFormData] = useState<CreateTimesheetDto>({
    date: dayjs().tz(userTimezone).format("YYYY-MM-DD"),
    tasks: [
      {
        name: "",
        startTime: "",
        endTime: "",
        hours: 0,
        description: "",
        project: "",
      },
    ],
    totalHours: 0,
  });

  const [
    createTimesheet,
    {
      isLoading: creating,
      isSuccess: createSuccess,
      error: createErrorData,
    },
  ] = useCreateTimesheetMutation();
  const [
    updateTimesheet,
    {
      isLoading: updating,
      isSuccess: updateSuccess,
      error: updateErrorData,
    },
  ] = useUpdateTimesheetMutation();

  const loading = creating || updating;

  useEffect(() => {
    if (createSuccess || updateSuccess) {
      toast.success(
        editingTimesheet
          ? "Timesheet updated successfully"
          : "Timesheet created successfully",
      );
      onSuccess();
    }
  }, [createSuccess, updateSuccess, editingTimesheet, onSuccess]);
  useEffect(() => {
  const err = createErrorData || updateErrorData;

  if (!err) return;

  const message =
    (err as { data?: { message?: string; error?: string } })?.data?.message ||
    (err as { data?: { message?: string; error?: string } })?.data?.error ||
    "Failed to save timesheet";

  toast.error(message);
}, [createErrorData, updateErrorData]);

  // Populate form data when editing
  useEffect(() => {
    if (editingTimesheet) {
      const localDate = dayjs(editingTimesheet.date)
        .tz(userTimezone)
        .format("YYYY-MM-DD");

      setFormData({
        date: localDate,
        totalHours: editingTimesheet.totalHours,
        tasks: editingTimesheet.tasks.map((task) => ({
          name: task.name,
          startTime: dayjs(task.startTime).tz(userTimezone).format("HH:mm"),
          endTime: dayjs(task.endTime).tz(userTimezone).format("HH:mm"),
          hours: task.hours,
          description: task.description || "",
          project: task.project || "",
        })),
      });
    }
  }, [editingTimesheet, userTimezone]);

  const addTask = () => {
    setFormData((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          name: "",
          startTime: "",
          endTime: "",
          hours: 0,
          description: "",
          project: "",
        },
      ],
    }));
  };

  const duplicateLastTask = () => {
    setFormData((prev) => {
      if (prev.tasks.length === 0) {
        toast.error("No task to duplicate");
        return prev;
      }

      // Get the last task and create a copy
      const lastTask = prev.tasks[prev.tasks.length - 1];
      const duplicatedTask = {
        name: lastTask.name,
        startTime: lastTask.startTime,
        endTime: lastTask.endTime,
        hours: lastTask.hours,
        description: lastTask.description,
        project: lastTask.project,
      };

      return {
        ...prev,
        tasks: [...prev.tasks, duplicatedTask],
      };
    });
  };

  const removeTask = (index: number) => {
    setFormData((prev) => {
      if (prev.tasks.length <= 1) {
        toast.error("At least one task is required");
        return prev;
      }
      return {
        ...prev,
        tasks: prev.tasks.filter((_, i) => i !== index),
      };
    });
  };

  const handleReset = () => {
    // Reset form to initial state
    setFormData({
      date: dayjs().tz(userTimezone).format("YYYY-MM-DD"),
      totalHours: 0,
      tasks: [
        {
          name: "",
          startTime: "",
          endTime: "",
          hours: 0,
          description: "",
          project: "",
        },
      ],
    });
    toast.success("Form reset successfully");
  };

  const updateTask = (
    index: number,
    field: keyof TimesheetTask,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task, i) =>
        i === index ? { ...task, [field]: value } : task,
      ),
    }));
  };

  const calculateHours = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const totalHours = Math.max(0, diffMs / (1000 * 60 * 60));

    // Return exact hours without any break time calculation
    return totalHours;
  };

  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    updateTask(index, field, value);
    const task = formData.tasks[index];
    const startTime = field === "startTime" ? value : task.startTime;
    const endTime = field === "endTime" ? value : task.endTime;
    // Calculate hours without any break time
    if (startTime && endTime) {
      if (endTime > startTime) {
        const hours = calculateHours(startTime, endTime);
        updateTask(index, "hours", hours);
      } else {
        toast.error("End time must be greater than start time!");
        updateTask(index, "hours", 0);
      }
    } else {
      updateTask(index, "hours", 0);
    }
  };

  const prepareSubmitData = (): {
    create: ICreateTimesheetBody;
    update: IUpdateTimesheetBody;
  } => {
    const cleanTasks = formData.tasks.map((task) => {
      const start = dayjs(`${formData.date} ${task.startTime}`)
        .tz(userTimezone)
        .utc()
        .toISOString();

      const end = dayjs(`${formData.date} ${task.endTime}`)
        .tz(userTimezone)
        .utc()
        .toISOString();

      return {
        name: task.name,
        startTime: start,
        endTime: end,
        hours: task.hours,
        description: task.description || "",
        project: task.project || "",
      };
    });

    const totalHours = cleanTasks.reduce((sum, t) => sum + t.hours, 0);

    const plainDate = formData.date;

    return {
      create: {
        date: plainDate,
        tasks: cleanTasks,
        totalHours,
      },
      update: {
        date: plainDate,
        tasks: cleanTasks,
      },
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.tasks.length === 0) {
      toast.error("Add at least one task");
      return;
    }

    const today = dayjs().tz(userTimezone).startOf("day");
    const selectedDate = dayjs(formData.date).tz(userTimezone);

    if (selectedDate.isAfter(today)) {
      toast.error("Please fill the proper date");
      return;
    }

    const hasEmptyTasks = formData?.tasks?.some((task) => !task.name.trim());
    if (hasEmptyTasks) {
      toast.error("Please fill all required fields");
      return;
    }

    const hasEmptyTaskHours =
      formData?.tasks?.some((task) => task.hours === 0) ?? false;
    if (hasEmptyTaskHours) {
      toast.error("Please fill all required fields");
      return;
    }

    const hasEmptyProjects = formData?.tasks?.some(
      (task) => !task.project?.trim(),
    );
    if (hasEmptyProjects) {
      toast.error("Please fill all required fields");
      return;
    }

    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    function hasOverlapSorted(tasks: { startTime: string; endTime: string }[]) {
      const sorted = [...tasks].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
      );
      for (let i = 1; i < sorted.length; i++) {
        if (
          timeToMinutes(sorted[i].startTime) <
          timeToMinutes(sorted[i - 1].endTime)
        ) {
          return true;
        }
      }
      return false;
    }

    const hasOverlap = hasOverlapSorted(formData.tasks);

    if (hasOverlap) {
      toast.error("Task timings overlap. Please fill correct timings.");
      return;
    }

    const { create, update } = prepareSubmitData();

    if (editingTimesheet) {
      updateTimesheet({
        id: editingTimesheet.id,
        body: update,
      });
    } else {
      createTimesheet(create);
    }
  };

  const totalHours = formData.tasks.reduce((sum, task) => sum + task.hours, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-space">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-0 p-1">
              {editingTimesheet ? "Edit Timesheet" : "Add New Timesheet"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date<span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formData.date ? dayjs(formData.date) : undefined}
                onChange={(date: Dayjs | null) => {
                  if (date) {
                    const today = dayjs().tz(userTimezone).startOf("day");
                    if (date.isAfter(today)) {
                      toast.error("Cannot select future dates");
                      return;
                    }
                    setFormData((prev) => ({
                      ...prev,
                      date: date.format("YYYY-MM-DD"),
                    }));
                  }
                }}
                format="DD/MM/YYYY"
                maxDate={dayjs().tz(userTimezone)}
                placeholder="Select date"
              />
            </div>

            {/* Daily Tasks Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-900">
                  Daily Tasks
                </h3>
                <div className="text-sm font-medium text-slate-600 mb-2">
                  Total Day Hours:{" "}
                  <span className="text-primary-600 font-bold">
                    {convertToHourMinute(totalHours)}hr
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {formData.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="relative border border-slate-200 rounded-lg flex flex-col items-end"
                  >
                    {formData.tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="absolute top-2 right-2 z-10 p-1  rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                        aria-label={`Remove task ${index + 1}`}
                        title="Remove task"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="w-full px-4 pb-2 pt-6 md:px-6 md:pb-6 md:pt-4 space-y-4">
                      {/* Row 1: Project Name and Task Name */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Input
                            label="Project Name"
                            required
                            value={task.project || ""}
                            placeholder="Enter project name..."
                            onChange={(value) =>
                              updateTask(index, "project", value as string)
                            }
                          />
                        </div>
                        <div>
                          <Input
                            label="Task Name"
                            required
                            value={task.name}
                            onChange={(value) =>
                              updateTask(index, "name", value as string)
                            }
                            placeholder="Enter task name..."
                          />
                        </div>
                      </div>

                      {/* Row 2: Start Time, End Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Start Time<span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              id={`task-${index}-start`}
                              type="time"
                              value={task.startTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  index,
                                  "startTime",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 task-start-time"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            End Time<span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              id={`task-${index}-end`}
                              type="time"
                              value={task.endTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  index,
                                  "endTime",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 task-end-time"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Task Description */}
                      <div>
                        <TextArea
                          label="Task Description"
                          value={task.description || ""}
                          onChange={(val) =>
                            updateTask(index, "description", val)
                          }
                          placeholder="Describe the work performed for this task..."
                          minRows={3}
                          maxLength={500}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another Task Button */}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={addTask}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Task
                </button>
                <button
                  type="button"
                  onClick={duplicateLastTask}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-green-400 hover:text-green-600 transition-colors"
                >
                  <Copy className="w-5 h-5" />
                  Duplicate Last Task
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <Button
            htmlType="button"
            onClick={handleReset}
            appearance="secondary"
            size="large"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            htmlType="submit"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            appearance="primary"
            size="large"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Timsheet"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTimesheetModal;
