import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionOption, QuestionType, generateTempId } from '../../types';
import Input from '../../../common/Input';
import Button from '../../../common/Button';
import { IconButton } from './';
import { cn } from '../../../../utils/cn';

interface OptionsListProps {
  options: QuestionOption[];
  onChange: (options: QuestionOption[]) => void;
  questionType: QuestionType;
  readOnly?: boolean;
}

interface SortableOptionProps {
  option: QuestionOption;
  index: number;
  onTextChange: (text: string) => void;
  onDelete: () => void;
  canDelete: boolean;
  questionType: QuestionType;
  readOnly?: boolean;
}

const SortableOption: React.FC<SortableOptionProps> = ({
  option,
  index,
  onTextChange,
  onDelete,
  canDelete,
  questionType,
  readOnly = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 group',
        isDragging && 'z-50 opacity-90'
      )}
    >
      {/* Drag Handle */}
      {!readOnly && (
        <IconButton
          variant="ghost"
          size="xs"
          className="flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          aria-label="Drag to reorder option"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3 h-3" />
        </IconButton>
      )}

      {/* Option Indicator */}
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {questionType === 'mcq' ? (
          <span className="w-4 h-4 rounded-full border-2 border-slate-300" />
        ) : (
          <span className="w-4 h-4 rounded border-2 border-slate-300" />
        )}
      </span>

      {/* Option Text Input */}
      <Input
        value={option.text}
        onChange={(value) => onTextChange(String(value))}
        placeholder={`Option ${index + 1}`}
        className="flex-1"
        disabled={readOnly}
      />

      {/* Delete Button */}
      {!readOnly && (
        <IconButton
          variant="danger"
          size="sm"
          onClick={onDelete}
          disabled={!canDelete}
          className={cn(
            'flex-shrink-0',
            canDelete ? 'opacity-0 group-hover:opacity-100' : 'opacity-50'
          )}
          aria-label="Delete option"
        >
          <Trash2 className="w-4 h-4" />
        </IconButton>
      )}
    </div>
  );
};

const OptionsList: React.FC<OptionsListProps> = ({
  options,
  onChange,
  questionType,
  readOnly = false,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const minOptions = questionType === 'mcq' ? 2 : 2;
  const canDelete = options.length > minOptions;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = options.findIndex((o) => o.tempId === active.id);
      const newIndex = options.findIndex((o) => o.tempId === over.id);
      
      const reordered = arrayMove(options, oldIndex, newIndex);
      onChange(reordered);
    }
  };

  const handleAddOption = () => {
    const newOption: QuestionOption = {
      tempId: generateTempId(),
      text: '',
    };
    onChange([...options, newOption]);
  };

  const handleTextChange = (tempId: string, text: string) => {
    onChange(
      options.map((o) => (o.tempId === tempId ? { ...o, text } : o))
    );
  };

  const handleDeleteOption = (tempId: string) => {
    if (!canDelete) return;
    const filtered = options.filter((o) => o.tempId !== tempId);
    const reordered = filtered.map((o, idx) => ({ ...o, order: idx + 1 }));
    onChange(reordered);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        Options <span className="text-red-500">*</span>
      </label>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={options.map((o) => o.tempId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {options.map((option, idx) => (
              <SortableOption
                key={option.tempId}
                option={option}
                index={idx}
                onTextChange={(text) => handleTextChange(option.tempId, text)}
                onDelete={() => handleDeleteOption(option.tempId)}
                canDelete={canDelete}
                questionType={questionType}
                readOnly={readOnly}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Option Button - hidden in read-only mode */}
      {!readOnly && (
        <Button
          appearance="link"
          size="small"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAddOption}
          className="!p-0 !h-auto"
        >
          Add Option
        </Button>
      )}
    </div>
  );
};

export default OptionsList;
