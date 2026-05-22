import React from "react";
import { TextField, SelectField } from "./FormFields";
import { EducationDetail } from "./formDefaults";
import { ModalButton } from "../../../common/Modal";
import { X } from "lucide-react";
import { SelectOption } from "../../../common/Select";
import { DatePicker } from "../../../common";
import dayjs, { Dayjs } from "dayjs";
import { TextArea } from "../../../common/TextArea";

interface EducationSectionProps {
  educationDetails: EducationDetail[];
  disciplines: SelectOption[];
  isViewMode: boolean;
  selfEditMode?: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof EducationDetail,
    value: EducationDetail[keyof EducationDetail]
  ) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  educationDetails,
  disciplines,
  isViewMode,
  selfEditMode,
  onAdd,
  onRemove,
  onChange,
}) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="text-lg font-medium text-slate-900">Education Details </h4>
      {!isViewMode && (
        <ModalButton
          className="border-2 border-slate-300"
          variant="ghost"
          size="sm"
          onClick={onAdd}
        >
          Add Education
        </ModalButton>
      )}
    </div>

    {educationDetails.map((education, index) => (
      <div
        key={`education-${index}`}
        className="rounded-xl shadow-soft border border-slate-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative"
      >
        {!isViewMode && educationDetails.length > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 bg-white border border-red-200 rounded-full p-1 shadow-sm"
            aria-label="Remove education"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <TextField
          label="Institution Name"
          placeholder="Enter your institution name here..."
          value={education.institutionName}
          onChange={(value) => onChange(index, "institutionName", value)}
          disabled={isViewMode}
        />
        <SelectField
          label="Discipline"
          value={education?.discipline?.id}
          options={disciplines}
          onChange={(value) => onChange(index, "discipline", value)}
          disabled={isViewMode}
          searchable
          clearable
        />

        <DatePicker
          label="Start Date"
          value={education.startDate ? dayjs(education.startDate) : null}
          onChange={(date) =>
            onChange(index, "startDate", date ? date.format("YYYY-MM-DD") : "")
          }
            
          placeholder="Select start date"
          disabled={isViewMode}
          format="DD/MM/YYYY"
          allowClear={false}
        />

        <DatePicker
          label="End Date"
          value={education.endDate ? dayjs(education.endDate) : null}
          onChange={(date) =>
            onChange(index, "endDate", date ? date.format("YYYY-MM-DD") : "")
          }
          placeholder="Select end date"
          disabled={isViewMode}
          format="DD/MM/YYYY"
          allowClear={false}
        />

        <TextField
          label="GPA / Grade"
          placeholder="E.g. 8.2 CGPA"
          value={education.grade}
          onChange={(value) => onChange(index, "grade", value)}
          disabled={isViewMode}
        />
        <TextArea
          label="Explain Breaks"
          placeholder="Enter your reason for breaks here..."
          value={education.explainBreaks ?? ""}
          onChange={(value) => onChange(index, "explainBreaks", value)}
          disabled={isViewMode}
          className="md:col-span-2"
          minRows={3}
        />
      </div>
    ))}
  </section>
);

export default EducationSection;
