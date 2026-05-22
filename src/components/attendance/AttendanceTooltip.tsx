import React, { useEffect } from 'react';
import { Clock, Coffee, Activity, Calendar } from 'lucide-react';
import {
  convertToHourMinute,
  formatBreakHoursForDisplay,
} from '../../utils/convertToHourMinute';
import type { AttendanceRecord } from './types';

export type TooltipDayRecord = Partial<
  Pick<AttendanceRecord, 'checkInTime' | 'checkOutTime' | 'totalBreakHours' | 'netWorkHours' | 'notes'>
> & Pick<AttendanceRecord, 'date'>;

interface AttendanceTooltipProps {
  dayRecord: TooltipDayRecord | undefined;
  status: string;
  children: React.ReactNode;
}

const AttendanceTooltip: React.FC<AttendanceTooltipProps> = ({
  dayRecord,
  status,
  children
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsVisible(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const tooltipWidth = 280; // max-width from CSS

    // Calculate horizontal position with viewport bounds
    let x = rect.left + rect.width / 2;
    if (x - tooltipWidth / 2 < 10) {
      x = tooltipWidth / 2 + 10;
    } else if (x + tooltipWidth / 2 > viewportWidth - 10) {
      x = viewportWidth - tooltipWidth / 2 - 10;
    }

    setPosition({
      x,
      y: rect.top - 8
    });
  };

  const closeTooltip = () => {
    setIsVisible(false);
  };

  const handleMouseLeave = closeTooltip;

  useEffect(() => {
  if (!isVisible) return;

  const handleScroll = () => {
    closeTooltip();
  };

  window.addEventListener("scroll", handleScroll, {
    passive: true,
    capture: true, // important
  });

  window.addEventListener("touchmove", handleScroll, {
    passive: true,
  });

  return () => {
    window.removeEventListener(
      "scroll",
      handleScroll,
      { capture: true } as any
    );
    window.removeEventListener("touchmove", handleScroll);
  };
}, [isVisible]);


  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatHours = (hours: number) => {
    return `${convertToHourMinute(hours)}hr`;
  };

  const formatBreakHours = (value: number) => {
    return `${formatBreakHoursForDisplay(value)}hr`;
  };

  const getLeaveTypeLabel = (leaveType: string): string => {
    switch (leaveType.toLowerCase()) {
      case 'el': return 'Earned Leave';
      case 'sl': return 'Sick Leave';
      case 'lwp': return 'Leave Without Pay';
      case 'wfh': return 'Work From Home';
      case 'fwl': return 'Flexi Weekend Leave';
      case 'cpl': return 'Compensatory Leave';
      default: return leaveType;
    }
  };

  const getStatusInfo = (status: string) => {
    const lowerStatus = status.toLowerCase();

    // Handle combined half-day statuses (e.g., "p/el", "hd/sl")
    if (lowerStatus.includes('/')) {
      const [workPart, leavePart] = lowerStatus.split('/');
      const leaveLabel = getLeaveTypeLabel(leavePart);

      if (workPart === 'p') {
        return {
          label: `Half Present + Half ${leaveLabel}`,
          color: 'text-green-600',
          bgColor: 'bg-gradient-to-r from-green-50 to-primary-50'
        };
      } else if (workPart === 'hd') {
        return {
          label: `Half Day ${leaveLabel} (No Check-in)`,
          color: 'text-orange-600',
          bgColor: 'bg-gradient-to-r from-orange-50 to-primary-50'
        };
      }
    }

    switch (lowerStatus) {
      case 'p':
        return { label: 'Present', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'a':
        return { label: 'Absent', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'hd':
        return { label: 'Half Day', color: 'text-orange-600', bgColor: 'bg-orange-50' };
      case 'el':
        return { label: 'Earned Leave', color: 'text-primary-600', bgColor: 'bg-primary-50' };
      case 'sl':
        return { label: 'Sick Leave', color: 'text-purple-600', bgColor: 'bg-purple-50' };
      case 'lwp':
        return { label: 'Leave Without Pay', color: 'text-slate-600', bgColor: 'bg-slate-50' };
      case 'wfh':
        return { label: 'Work From Home', color: 'text-cyan-600', bgColor: 'bg-cyan-50' };
      case 'cpl':
      case 'compensatory_leave':
        return { label: 'Compensatory Leave', color: 'text-indigo-600', bgColor: 'bg-indigo-50' };
      case 'nm':
        return { label: 'Not Marked', color: 'text-slate-500', bgColor: 'bg-slate-50' };
      case 'hl':
      case 'holiday':
        return { label: 'Holiday', color: 'text-orange-600', bgColor: 'bg-orange-50' };
      case 'oh':
      case 'optional_holiday':
        return { label: 'Optional Holiday', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      default:
        return { label: status, color: 'text-slate-600', bgColor: 'bg-slate-50' };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="bg-white rounded-xl shadow-soft-hover border border-slate-200 p-5 min-w-[240px] max-w-[280px] animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 gap-6">
              <span className="text-sm font-bold text-slate-700">
                Status
              </span>
              <span className={`px-3 py-1 text-xs rounded-full max-w-40  block break-words whitespace-normal  font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {dayRecord ? (
              <div className="space-y-3">
                {(dayRecord.checkInTime || dayRecord.checkOutTime) && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-xs text-slate-500 leading-none mb-0.5">Check In</p>
                        <p className="text-sm font-semibold text-slate-900 leading-none mb-0">
                          {dayRecord.checkInTime ? formatTime(dayRecord.checkInTime) : '--'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 h-8 flex flex-col justify-center">
                        <p className="text-xs text-slate-500 mb-0.5 leading-none">Check Out</p>
                        <p className="text-sm font-semibold text-slate-900 leading-none mb-0">
                          {dayRecord.checkOutTime ? formatTime(dayRecord.checkOutTime) : '--'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {((dayRecord.totalBreakHours ?? 0) > 0 || (dayRecord.netWorkHours ?? 0) > 0) && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Coffee className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1 h-8 flex flex-col justify-center">
                        <p className="text-xs text-slate-500 mb-0.5 leading-none">Break Time</p>
                        <p className="text-sm font-semibold text-slate-900 leading-none mb-0">
                          {formatBreakHours(dayRecord.totalBreakHours || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 h-8 flex flex-col justify-center">
                        <p className="text-xs text-slate-500 mb-0.5 leading-none">Net Work Hours</p>
                        <p className="text-sm font-semibold text-slate-900 leading-none mb-0">
                          {formatHours(dayRecord.netWorkHours || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {dayRecord.notes && (
                  <div className={`pt-2 ${(dayRecord.checkInTime || dayRecord.checkOutTime || dayRecord.totalBreakHours > 0 || dayRecord.netWorkHours > 0) ? 'border-t border-slate-200' : ''}`}>
                    <p className="text-xs text-slate-500 mb-0.5">Notes</p>
                    <p className="text-sm text-slate-700 italic break-words whitespace-pre-wrap overflow-wrap-anywhere" title={dayRecord.notes}>
                      {dayRecord.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No attendance data</p>
              </div>
            )}

            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttendanceTooltip;
