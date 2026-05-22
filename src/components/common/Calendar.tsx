import React, { useState, useMemo } from 'react';
import { Calendar as AntCalendar, Badge, Tooltip } from 'antd';
import { CalendarProps as AntCalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';


dayjs.extend(localeData);
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  type?: 'holiday' | 'leave' | 'meeting' | 'deadline' | 'birthday' | 'anniversary' | 'custom';
  description?: string;
  color?: string;
  icon?: React.ReactNode;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface CustomCalendarProps extends Omit<AntCalendarProps<Dayjs>, 'cellRender' | 'headerRender'> {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Dayjs, events: CalendarEvent[]) => void;
  showEventCount?: boolean;
  eventLimit?: number;
  customCellRender?: (date: Dayjs, events: CalendarEvent[]) => React.ReactNode;
  customHeaderRender?: (value: Dayjs, type: 'month' | 'year', onChange: (date: Dayjs) => void, onTypeChange: (type: 'month' | 'year') => void) => React.ReactNode;
  highlightToday?: boolean;
  highlightWeekends?: boolean;
  theme?: 'default' | 'modern' | 'minimal' | 'colorful';
  size?: 'small' | 'default' | 'large';
  showLunarCalendar?: boolean;
  label?: string;
  className?: string;
}

const Calendar: React.FC<CustomCalendarProps> = ({
  events = [],
  onEventClick,
  onDateSelect,
  showEventCount = true,
  eventLimit = 3,
  customCellRender,
  customHeaderRender,
  highlightToday = true,
  highlightWeekends = true,
  theme = 'modern',
  size = 'default',
  showLunarCalendar = false,
  label,
  className = '',
  ...antdProps
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const dateKey = dayjs(event.date).format('YYYY-MM-DD');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Event type configurations
  const eventTypeConfig = {
    holiday: { color: 'var(--color-event-holiday)', icon: <CalendarIcon size={12} />, bgColor: 'var(--color-event-holiday-bg)' },
    leave: { color: 'var(--color-event-leave)', icon: <Clock size={12} />, bgColor: 'var(--color-event-leave-bg)' },
    meeting: { color: 'var(--color-event-meeting)', icon: <Users size={12} />, bgColor: 'var(--color-event-meeting-bg)' },
    deadline: { color: 'var(--color-event-deadline)', icon: <AlertCircle size={12} />, bgColor: 'var(--color-event-deadline-bg)' },
    birthday: { color: 'var(--color-event-birthday)', icon: '🎂', bgColor: 'var(--color-event-birthday-bg)' },
    anniversary: { color: 'var(--color-event-anniversary)', icon: '🎉', bgColor: 'var(--color-event-anniversary-bg)' },
    custom: { color: '#52c41a', icon: <CheckCircle size={12} />, bgColor: '#f6ffed' },
  };

  // Get theme styles
  const getThemeStyles = () => {
    const themes = {
      default: {
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      modern: {
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      },
      minimal: {
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--color-border-input-hover)',
      },
      colorful: {
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    };
    return themes[theme] || themes.modern;
  };

  // Custom cell renderer
  const cellRender = (current: Dayjs, info: { type: string; originNode?: React.ReactNode }) => {
    if (customCellRender) {
      const dateEvents = eventsByDate[current.format('YYYY-MM-DD')] || [];
      return customCellRender(current, dateEvents);
    }

    const dateKey = current.format('YYYY-MM-DD');
    const dayEvents = eventsByDate[dateKey] || [];

    if (info.type === 'date') {
      const isToday = current.isSame(dayjs(), 'day');
      const isWeekend = current.day() === 0 || current.day() === 6;
      const isSelected = selectedDate?.isSame(current, 'day');

      return (
        <div
          className={`
            calendar-cell relative h-full w-full min-h-[80px] p-1
            ${isToday && highlightToday ? 'bg-primary-50 border-2 border-primary-300 rounded-lg' : ''}
            ${isWeekend && highlightWeekends ? 'bg-slate-50' : ''}
            ${isSelected ? 'bg-primary-100 border-2 border-primary-400 rounded-lg' : ''}
            hover:bg-slate-50 transition-all duration-200 cursor-pointer
          `}
          onClick={() => {
            setSelectedDate(current);
            onDateSelect?.(current, dayEvents);
          }}
        >
          {/* Date number */}
          <div className={`
            text-sm font-medium mb-1
            ${isToday ? 'text-primary-600 font-bold' : ''}
            ${isWeekend && !isToday ? 'text-slate-500' : ''}
          `}>
            {current.date()}
          </div>

          {/* Events */}
          <div className="space-y-1">
            {dayEvents.slice(0, eventLimit).map((event, index) => {
              const config = eventTypeConfig[event.type || 'custom'];

              return (
                <Tooltip
                  key={event.id}
                  title={
                    <div>
                      <div className="font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-xs mt-1 opacity-90">{event.description}</div>
                      )}
                    </div>
                  }
                  placement="top"
                >
                  <div
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer
                      hover:opacity-80 transition-opacity
                    `}
                    style={{
                      backgroundColor: event.color || config.bgColor,
                      color: event.color ? '#fff' : config.color,
                      border: `1px solid ${event.color || config.color}`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {event.icon || config.icon}
                    <span className="truncate flex-1 font-medium">
                      {event.title}
                    </span>
                  </div>
                </Tooltip>
              );
            })}

            {/* Show more indicator */}
            {dayEvents.length > eventLimit && (
              <div className="text-xs text-slate-500 text-center py-1">
                +{dayEvents.length - eventLimit} more
              </div>
            )}

            {/* Event count badge */}
            {showEventCount && dayEvents.length > 0 && (
              <Badge
                count={dayEvents.length}
                size="small"
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  fontSize: '10px',
                }}
              />
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // Custom header renderer
  const headerRender = ({ value, type, onChange, onTypeChange }: {
    value: Dayjs;
    type: 'month' | 'year';
    onChange: (date: Dayjs) => void;
    onTypeChange: (type: 'month' | 'year') => void
  }) => {
    if (customHeaderRender) {
      return customHeaderRender(value, type, onChange, onTypeChange);
    }

    const start = 0;
    const end = 12;
    const monthOptions = [];

    let current = value.clone();
    const localeData = value.localeData();
    const months = [];
    for (let i = 0; i < 12; i++) {
      current = current.month(i);
      months.push(localeData.monthsShort(current));
    }

    for (let i = start; i < end; i++) {
      monthOptions.push(
        <option key={i} value={i} className="text-sm">
          {months[i]}
        </option>,
      );
    }

    const year = value.year();
    const month = value.month();
    const options = [];
    for (let i = year - 10; i < year + 10; i += 1) {
      options.push(
        <option key={i} value={i} className="text-sm">
          {i}
        </option>,
      );
    }

    return (
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-4">
          {/* Month/Year selectors */}
          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => {
                const newValue = value.clone().month(parseInt(e.target.value, 10));
                onChange(newValue);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
            >
              {monthOptions}
            </select>
            <select
              value={year}
              onChange={(e) => {
                const newValue = value.clone().year(parseInt(e.target.value, 10));
                onChange(newValue);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
            >
              {options}
            </select>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChange(value.clone().subtract(1, 'month'))}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onChange(dayjs())}
              className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
            >
              Today
            </button>
            <button
              onClick={() => onChange(value.clone().add(1, 'month'))}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* View type switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTypeChange('month')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${type === 'month'
              ? 'bg-primary-500 text-white'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            Month
          </button>
          <button
            onClick={() => onTypeChange('year')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${type === 'year'
              ? 'bg-primary-500 text-white'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            Year
          </button>
        </div>
      </div>
    );
  };

  const themeStyles = getThemeStyles();

  return (
    <div
      className={`custom-calendar ${theme} ${size} ${className}`}
      style={themeStyles}
    >
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
        </label>
      )}
      <AntCalendar
        {...antdProps}
        cellRender={cellRender}
        headerRender={headerRender}
        className={`
          ${theme === 'colorful' ? 'text-white' : ''}
          ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : ''}
        `}
      />

      {/* Custom styles */}
      <style>{`
        .custom-calendar .ant-picker-calendar {
          background: transparent;
        }
        
        .custom-calendar.modern .ant-picker-calendar-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px 12px 0 0;
        }

        .custom-calendar.colorful .ant-picker-calendar-header {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .custom-calendar.colorful .ant-picker-calendar-header .ant-picker-calendar-year-select,
        .custom-calendar.colorful .ant-picker-calendar-header .ant-picker-calendar-month-select {
          color: white;
        }

        .custom-calendar .ant-picker-calendar-date-today {
          border-color: #1890ff;
        }

        .custom-calendar.small .ant-picker-calendar-date-content {
          height: 60px;
        }

        .custom-calendar.large .ant-picker-calendar-date-content {
          height: 120px;
        }

        .calendar-cell:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .custom-calendar .ant-picker-calendar-date-content {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default Calendar;
