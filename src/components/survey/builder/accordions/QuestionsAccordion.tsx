import React from 'react';
import { ListChecks, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AccordionWrapper, AddQuestionTooltip } from '../components';
import QuestionCard from '../QuestionCard';
import { SurveyQuestion, QuestionType } from '../../types';
import Badge from '../../../common/Badge';

interface QuestionsAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  questions: SurveyQuestion[];
  onAddQuestion: (type: QuestionType) => void;
  onUpdateQuestion: (tempId: string, updates: Partial<SurveyQuestion>) => void;
  onDeleteQuestion: (tempId: string) => void;
  onReorderQuestions: (questions: SurveyQuestion[]) => void;
  questionsError?: string;
  readOnly?: boolean;
}

const QuestionsAccordion: React.FC<QuestionsAccordionProps> = ({
  isOpen,
  onToggle,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  questionsError,
  readOnly = false,
}) => {
  // DnD sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.tempId === active.id);
      const newIndex = questions.findIndex((q) => q.tempId === over.id);
      
      const reordered = arrayMove(questions, oldIndex, newIndex);
      onReorderQuestions(reordered);
    }
  };

  return (
    <AccordionWrapper
      title="Questions"
      subtitle="Add and manage survey questions"
      icon={<ListChecks className="w-4 h-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
      error={questionsError}
      badge={
        questions.length > 0 && (
          <Badge variant="gray" size="small">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </Badge>
        )
      }
    >
      <div className="space-y-4">
        {/* Questions List with DnD */}
        {questions.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={readOnly ? undefined : handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.tempId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <QuestionCard
                    key={question.tempId}
                    question={question}
                    index={index}
                    onUpdate={(updates: Partial<SurveyQuestion>) => onUpdateQuestion(question.tempId, updates)}
                    onDelete={() => onDeleteQuestion(question.tempId)}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : null}

        {/* Add Question Tooltip - hidden in read-only mode */}
        {!readOnly && (
          <AddQuestionTooltip
            onSelect={onAddQuestion}
            isEmpty={questions.length === 0}
          />
        )}

        {/* Drag hint - hidden in read-only mode */}
        {!readOnly && questions.length > 1 && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <GripVertical className="w-3 h-3" />
            <span>Drag questions to reorder</span>
          </div>
        )}
      </div>
    </AccordionWrapper>
  );
};

export default QuestionsAccordion;
