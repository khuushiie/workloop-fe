import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { AccordionWrapper, MultiSelect, RadioCardGroup } from '../components';
import Badge from '../../../common/Badge';
import { SurveyAssignment, AssignmentEntityType, ENTITY_TYPE_CONFIG } from '../../types';
import { useAssignmentOptions, getOptionLabel, getOptionValue } from '../../hooks';

interface AssignSurveyAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  assignment: SurveyAssignment;
  onAssignmentChange: (assignment: Partial<SurveyAssignment>) => void;
  entityTypeError?: string;
  entityIdsError?: string;
  readOnly?: boolean;
}

interface OptionType {
  value: string;
  label: string;
}

const SELECT_ALL_VALUE = '__SELECT_ALL__';

const entityTypeOptions: Array<{ value: AssignmentEntityType; label: string; description: string }> = [
  {
    value: 'individual',
    label: ENTITY_TYPE_CONFIG.individual.label,
    description: 'Select specific employees',
  },
  {
    value: 'designation',
    label: ENTITY_TYPE_CONFIG.designation.label,
    description: 'All employees with selected designations',
  },
  {
    value: 'department',
    label: ENTITY_TYPE_CONFIG.department.label,
    description: 'All employees in selected departments',
  },
  {
    value: 'role',
    label: ENTITY_TYPE_CONFIG.role.label,
    description: 'All employees with selected roles',
  },
];

const AssignSurveyAccordion: React.FC<AssignSurveyAccordionProps> = ({
  isOpen,
  onToggle,
  assignment,
  onAssignmentChange,
  entityTypeError,
  entityIdsError,
  readOnly = false,
}) => {
  const { options, isLoading, searchTerm, setSearchTerm } = useAssignmentOptions(
    assignment.entityType
  );

  // Map hook options to the { value, label } shape expected by MultiSelect
  const realOptions: OptionType[] = useMemo(() => {
    if (!assignment.entityType) return [];
    return options.map((opt) => ({
      value: getOptionValue(opt),
      label: getOptionLabel(opt, assignment.entityType!),
    }));
  }, [assignment.entityType, options]);

  const selectedOptions = useMemo(() => {
    return realOptions.filter(opt =>
      assignment.entityIds.includes(opt.value)
    );
  }, [realOptions, assignment.entityIds]);

  const isAllSelected = useMemo(() => {
    return realOptions.length > 0 && assignment.entityIds.length === realOptions.length;
  }, [realOptions, assignment.entityIds]);

  // Inject "Select All" as first option
  const selectOptionsWithAll = useMemo(() => {
    if (realOptions.length === 0) return realOptions;
    return [
      { value: SELECT_ALL_VALUE, label: 'Select All' },
      ...realOptions,
    ];
  }, [realOptions]);

  const selectValue = assignment.entityIds;

  const handleSelectionChange = (values: string[]) => {
    // If the values array contains our fake option, the user just clicked "Select All"
    const clickedSelectAll = values.includes(SELECT_ALL_VALUE);

    if (clickedSelectAll) {
      if (isAllSelected) {
        // If all were already selected, clicking "Select All" acts as a Deselect All
        onAssignmentChange({ entityIds: [] });
      } else {
        // Otherwise, select everything
        onAssignmentChange({ entityIds: realOptions.map((opt) => opt.value) });
      }
    } else {
      // Normal interaction (checking/unchecking individual options)
      onAssignmentChange({ entityIds: values });
    }
  };

  const handleEntityTypeChange = (type: AssignmentEntityType) => {
    onAssignmentChange({
      entityType: type,
      entityIds: [],
    });
  };

  const getPlaceholder = () => {
    if (!assignment.entityType) return 'First select an assignment type';
    const config = ENTITY_TYPE_CONFIG[assignment.entityType];
    return `Search and select ${config.label.toLowerCase()}...`;
  };

  const entityLabel = assignment.entityType ? ENTITY_TYPE_CONFIG[assignment.entityType].label : '';

  console.log("realOptions", realOptions);
console.log("assignment.entityIds", assignment.entityIds);

  return (
    <AccordionWrapper
      title="Assign Survey"
      subtitle="Choose who should receive this survey"
      icon={<Users className="w-4 h-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
      error={entityTypeError || entityIdsError}
      badge={
        assignment.entityIds.length > 0 && (
          <Badge variant="blue" size="small">
            {isAllSelected ? `All ${entityLabel}` : `${assignment.entityIds.length} selected`}
          </Badge>
        )
      }
    >
      <div className="space-y-4">
        <RadioCardGroup<AssignmentEntityType>
          name="entityType"
          label="Assign To"
          required
          value={assignment.entityType}
          options={entityTypeOptions}
          onChange={handleEntityTypeChange}
          columns={4}
          error={entityTypeError}
          disabled={readOnly}
        />

        {assignment.entityType && (
          <div>
            {readOnly ? (
              <>
              <div className="flex flex-wrap gap-2">
                {isAllSelected ? (
                  <Badge variant="blue">
                    All {entityLabel}
                  </Badge>
                ) : selectedOptions.length > 0 ? (
                  selectedOptions.map(option => (
                    <Badge key={option.value} variant="gray">
                      {option.label}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No assignment</p>
                )}
              </div>
              </>
            ) : (
              <>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
              Select {ENTITY_TYPE_CONFIG[assignment.entityType].label}{' '}
              <span className="text-red-500">*</span>
            </label>
              <MultiSelect
                options={selectOptionsWithAll}
                value={selectValue}
                onChange={handleSelectionChange}
                placeholder={getPlaceholder()}
                loading={isLoading}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                showSearch
                chipsOutside
                selectMaxWidth="320px"
                disabled={readOnly}
              />
              </>
            )}

            {entityIdsError && (
              <p className="text-xs text-red-600 mt-1">{entityIdsError}</p>
            )}
          </div>
        )}
      </div>
    </AccordionWrapper>
  );
};

export default AssignSurveyAccordion;