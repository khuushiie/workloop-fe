import React, { useState } from 'react';
import { Plus, Type, AlignLeft, ListChecks, CheckSquare, Star, Calendar, Hash } from 'lucide-react';
import { Dropdown, Menu } from 'antd';

import { QuestionType, QUESTION_TYPE_CONFIG } from '../../types';
import Button from '../../../common/Button';

interface AddQuestionDropdownProps {
  onSelect: (type: QuestionType) => void;
}

const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
  short_text: <Type className="w-4 h-4" />,
  long_text: <AlignLeft className="w-4 h-4" />,
  mcq: <ListChecks className="w-4 h-4" />,
  checkbox: <CheckSquare className="w-4 h-4" />,
  rating: <Star className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
};

const questionTypes: QuestionType[] = [
  'short_text',
  'long_text',
  'mcq',
  'checkbox',
  'rating',
  'date',
  'number',
];

const AddQuestionDropdown: React.FC<AddQuestionDropdownProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: QuestionType) => {
    onSelect(type);
    setOpen(false);
  };

  const menu = (
    <Menu className="!p-1 !rounded-lg !shadow-soft min-w-[200px]">
      <Menu.ItemGroup title="Choose Question Type" className="!px-2 !py-1">
        {questionTypes.map((type) => (
          <Menu.Item
            key={type}
            onClick={() => handleSelect(type)}
            className="!rounded-md !mx-1 !px-3 !py-2"
          >
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-50 text-primary-600 rounded-lg">
                {questionTypeIcons[type]}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {QUESTION_TYPE_CONFIG[type].label}
                </p>
                <p className="text-xs text-slate-500">
                  {QUESTION_TYPE_CONFIG[type].description}
                </p>
              </div>
            </div>
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomCenter"
    >
      <Button
        appearance="primary"
        size="small"
        icon={<Plus className="w-4 h-4" />}
        className="!shadow-soft"
      >
        Add Question
      </Button>
    </Dropdown>
  );
};

export default AddQuestionDropdown;
