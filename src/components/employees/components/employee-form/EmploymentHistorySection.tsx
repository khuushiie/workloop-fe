import React from "react";
import { IUserDetail } from "../../../../types/user.api.types";
import { TextField, SelectField } from "./FormFields";
import { ModalButton } from "../../../common/Modal";
import { EmploymentDetail } from "./formDefaults";
import { X } from "lucide-react";
import { SelectOption } from "../../../common/Select";
import { DatePicker } from "../../../common";
import dayjs from "dayjs";
import { TextArea } from "../../../common/TextArea";
interface EmploymentHistorySectionProps {
  employments: EmploymentDetail[];
  positionOptions: SelectOption[];
  isViewMode: boolean;
  joiningDate?: string | Date;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof EmploymentDetail,
    value: EmploymentDetail[keyof EmploymentDetail]
  ) => void;
}

const EmploymentHistorySection: React.FC<EmploymentHistorySectionProps> = ({
  employments,
  positionOptions,
  isViewMode,
  joiningDate,
  onAdd,
  onRemove,
  onChange,
}) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="text-lg font-semibold text-slate-900">
        Previous Employment Details
      </h4>
      {!isViewMode && (
        <ModalButton
          className="border-2 border-slate-300"
          variant="ghost"
          size="sm"
          onClick={onAdd}
        >
          Add Employment
        </ModalButton>
      )}
    </div>

    {employments.map((employment, index) => (
      <div
        key={`employment-${index}`}
        className="rounded-xl shadow-soft border border-slate-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative"
      >
        {!isViewMode && employments.length > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 bg-white border border-red-200 rounded-full p-1 shadow-sm"
            aria-label="Remove employment"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <TextField
          label="Employer Name"
          placeholder="Enter your employer name here..."
          value={employment.employerName}
          onChange={(value) => onChange(index, "employerName", value)}
          disabled={isViewMode}
        />
        <SelectField
          label="Designation"
          value={employment?.designation?.id}
          options={positionOptions}
          onChange={(value) => onChange(index, "designation", value)}
          disabled={isViewMode}
          searchable
          clearable
        />

        <DatePicker
          label="Start Date"
          value={employment.startDate ? dayjs(employment.startDate) : null}
          onChange={(date) =>
            onChange(index, "startDate", date ? date.format("YYYY-MM-DD") : "")
          }
          maxDate={joiningDate ? dayjs(joiningDate).subtract(1, "day") : dayjs()}
          placeholder="Select start date"
          disabled={isViewMode}
          format="DD/MM/YYYY"
          allowClear={false}
        />

        <DatePicker
          label="End Date"
          maxDate={joiningDate ? dayjs(joiningDate).subtract(1, "day") : dayjs()}
          value={employment.endDate ? dayjs(employment.endDate) : null}
          onChange={(date) =>
            onChange(index, "endDate", date ? date.format("YYYY-MM-DD") : "")
          }
          placeholder="Select end date"
          disabled={isViewMode}
          format="DD/MM/YYYY"
          allowClear={false}
        />

        <TextField
          label="Annual CTC"
          placeholder="E.g. 4-5 LPA"
          type="number"
          value={
            employment.annualCTC !== undefined
              ? String(employment.annualCTC)
              : ""
          }
          onChange={(value) => onChange(index, "annualCTC", Number(value) || 0)}
          min={0}
          disabled={isViewMode}
        />
        <TextArea
          label="Reason for Leaving"
          placeholder="Enter your reason for leaving here..."
          value={employment.breakReason}
          onChange={(value) => onChange(index, "breakReason", value)}
          disabled={isViewMode}
          className="md:col-span-2"
        />
      </div>
    ))}
  </section>
);

export default EmploymentHistorySection;
