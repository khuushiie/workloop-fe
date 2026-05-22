import React from 'react';
import { FileText } from 'lucide-react';
import AccordionWrapper from '../components/AccordionWrapper';
import Input from '../../../common/Input';
import { TextArea } from '../../../common/TextArea';

interface SurveyDetailsAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  titleError?: string;
  readOnly?: boolean;
}

const SurveyDetailsAccordion: React.FC<SurveyDetailsAccordionProps> = ({
  isOpen,
  onToggle,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  titleError,
  readOnly = false,
}) => {
  return (
    <AccordionWrapper
      title="Survey Details"
      subtitle="Set the title and description for your survey"
      icon={<FileText className="w-4 h-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
      error={titleError}
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="survey-title"
            className="block text-sm font-semibold text-slate-700 mb-1"
          >
            Survey Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(value) => onTitleChange(String(value))}
            placeholder="Enter survey title"
            maxLength={200}
            error={titleError}
            disabled={readOnly}
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-slate-400">{title.length}/200</span>
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <TextArea
            value={description}
            onChange={(value: string) => onDescriptionChange(value)}
            placeholder="Enter survey description"
            minRows={3}
            maxLength={500}
            disabled={readOnly}
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-slate-400">{description.length}/500</span>
          </div>
        </div>
      </div>
    </AccordionWrapper>
  );
};

export default SurveyDetailsAccordion;
