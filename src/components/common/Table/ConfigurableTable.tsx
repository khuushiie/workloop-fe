import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import React, { useState } from 'react';
import Table, { TableProps } from '../Table';
import { useTableConfig, TableConfigOptions } from '../../../hooks/useTableConfig';
import { DraggableHeader } from './DraggableHeader';
import { ColumnSelector } from './ColumnSelector';
import { ColumnDragProvider } from './ColumnDragContext';

export interface ConfigurableTableProps<T extends object> extends TableProps<T> {

  configOptions?: TableConfigOptions;

  renderColumnSelector?: (selector: React.ReactNode) => React.ReactNode;

  skeleton?: React.ReactNode;
  
  spacing?: number;
}

const ConfigurableTable = <T extends object>(props: ConfigurableTableProps<T>) => {
  const { columns, data, configOptions, renderColumnSelector, skeleton, spacing = 4, ...rest } = props;


  const {
    configuredColumns,
    visibleKeys,
    toggleVisibility,
    reorderColumns,
    allColumns,
  } = useTableConfig(columns, configOptions);


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderColumns(active.id as string, over.id as string);
    }

    setActiveId(null);
  };

  const selector = (
    <ColumnSelector
      columns={allColumns}
      visibleKeys={visibleKeys}
      onToggle={toggleVisibility}
    />
  );

  const spacingClass = spacing === 0 ? "space-y-0" : `space-y-${spacing}`;

  return (
    <div className={spacingClass}>

      {renderColumnSelector ? (
        renderColumnSelector(selector)
      ) : (
        <div className="flex justify-end items-center gap-2 pr-1 mb-2 relative z-30">
          {selector}
        </div>
      )}


      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >

        <SortableContext
          items={configuredColumns.filter(c => !c.required).map((c) => c.key)}
          strategy={horizontalListSortingStrategy}
        >

          <ColumnDragProvider value={{ activeId }}>
            <Table
              bordered={false}
              {...rest}
              columns={configuredColumns}
              data={data}
              skeleton={skeleton}
              tableFixed={true}
              renderHeaderCell={(column, _index, defaultContent) => (
                <DraggableHeader
                  id={column.key}
                  isReorderable={column.isReorderable !== false && !column.required}
                >
                  {defaultContent}
                </DraggableHeader>
              )}
            />
          </ColumnDragProvider>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ConfigurableTable;
