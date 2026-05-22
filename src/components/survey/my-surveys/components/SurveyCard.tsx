import React from 'react';
import { FileText, Calendar } from 'lucide-react';
import { MySurvey, MySurveyStatus } from '../../types';
import Badge from '../../../common/Badge';
import Button from '../../../common/Button';
import { cn } from '../../../../utils/cn';
import dayjs from 'dayjs';
import { SURVEY_STATUS } from '../../../../utils/constants';

interface SurveyCardProps {
  survey: MySurvey;
  onViewInfo: (surveyId: string) => void;
  onViewResponse?: (responseId: string) => void;
}

const STATUS_CONFIG: Record<MySurveyStatus, { label: string; variant: 'orange' | 'blue' | 'green' | 'red' }> = {
  pending: { label: 'Pending', variant: 'orange' },
  inProgress: { label: 'In Progress', variant: 'blue' },
  completed: { label: 'Completed', variant: 'green' },
  overdue: { label: 'Overdue', variant: 'red' },
};
const getButtonConfig = (status: MySurveyStatus): { label: string; appearance: 'primary' | 'secondary' | 'warning' } => {
  switch (status) {
    case 'pending':
      return { label: 'View Survey', appearance: 'primary' };
    case 'inProgress':
      return { label: 'Continue', appearance: 'primary' };
    case 'completed':
      return { label: 'View Response', appearance: 'primary' };
    case 'overdue':
      return { label: 'Start Now', appearance: 'warning' };
    default:
      return { label: 'Start Survey', appearance: 'primary' };
  }
};

const SurveyCard: React.FC<SurveyCardProps> = ({ survey, onViewInfo, onViewResponse }) => {
  const statusConfig = STATUS_CONFIG[survey.status];
  const buttonConfig = getButtonConfig(survey.status);
  const formattedDueDate = dayjs(survey.dueDate).format('MMM DD, YYYY');
  const progressPercentage = survey.answeredCount && survey.questionCount
    ? Math.round((survey.answeredCount / survey.questionCount) * 100) : 0;

  const handleCardClick = () => {
    if (survey.status === SURVEY_STATUS.COMPLETED && onViewResponse && survey.responseId) {
      onViewResponse(survey.responseId);
    } else {
      onViewInfo(survey._id);
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (survey.status === SURVEY_STATUS.COMPLETED && onViewResponse && survey.responseId) {
      onViewResponse(survey.responseId);
    } else {
      onViewInfo(survey._id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'bg-white rounded-xl border border-slate-200 p-5 sm:p-6',
        'cursor-pointer transition-all duration-200',
        'hover:shadow-soft hover:border-slate-300',
        'flex flex-col h-full'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 flex-1">
          {survey.title}
        </h3>
        <Badge variant={statusConfig.variant} size="small" className="flex-shrink-0">
          {statusConfig.label}
        </Badge>
      </div>

      <p
        className="text-base text-slate-600 line-clamp-2 mb-4 flex-grow overflow-hidden text-ellipsis"
        title={survey.description}
      >
        {survey.description || "No description available."}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>{survey.questionCount} questions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Due: {formattedDueDate}</span>
        </div>
      </div>

      {survey.status !== 'completed' && survey.answeredCount !== undefined && survey.answeredCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{survey.answeredCount}/{survey.questionCount} answered</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <Button
        appearance={buttonConfig.appearance}
        size="middle"
        className="w-full"
        onClick={handleButtonClick}
      >
        {buttonConfig.label}
      </Button>
    </div>
  );
};

export default SurveyCard;
