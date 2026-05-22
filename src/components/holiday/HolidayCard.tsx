import React, { useMemo, useEffect } from "react";
import { Calendar, CheckCircle, Loader2 } from "lucide-react";
import { useGetCurrentYearHolidaysQuery } from "../../store/apis/holidayManagement.api";
import Badge from "../common/Badge";
import { SimpleTooltip } from "../common";

const HolidayCard: React.FC = () => {
  const { data: holidays = [], isLoading, isError, error } = useGetCurrentYearHolidaysQuery();

  const sortedHolidays = useMemo(
    () =>
      [...holidays].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [holidays]
  );

  useEffect(() => {
    const bridge = (globalThis as typeof globalThis & { ReactNativeWebView?: { postMessage: (m: string) => void } }).ReactNativeWebView;
    if (bridge && sortedHolidays.length > 0) {
      bridge.postMessage(
        JSON.stringify({ type: "HOLIDAY_LIST", payload: sortedHolidays })
      );
    }
  }, [sortedHolidays]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:p-6 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isError) {
    const message =
      error && typeof error === "object" && "data" in error
        ? (error.data as { message?: string })?.message
        : "Failed to load holidays";
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:px-6 md:py-4 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex items-center justify-center">
        <p className="text-red-600 text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:px-6 md:py-4 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-slate-900 mb-0">
            {new Date().getFullYear()} Holidays
          </h3>
        </div>
        <span className="text-sm text-slate-500">{sortedHolidays.length} total</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="flex flex-col flex-1 space-y-3 pr-2 h-full">
          {sortedHolidays.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-8 h-full">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">
                No holidays for {new Date().getFullYear()}
              </p>

            </div>
          ) : (
            <div>
              {sortedHolidays.map((holiday) => (
                <div
                  key={holiday.id ?? holiday.date}
                  className="flex items-center justify-between p-3 bg-slate-50 w-full rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle
                      className={`w-4 h-4 mr-2 ${
                        holiday.isMandatory ? "text-green-600" : "text-yellow-600"
                      }`}
                    />
                    <div>
                      <SimpleTooltip
                        label={holiday.name}
                        delay={500}
                        side="top"
                        tooltipClassName={
                          holiday.name.length < 20 ? "hidden" : ""
                        }
                      >
                        <p className="text-xs 2xl:text-sm font-medium text-slate-900 mb-1 max-w-32 2xl:max-w-48 truncate">
                          {holiday.name}
                        </p>
                      </SimpleTooltip>
                      <p className="text-xs text-slate-500 mb-1">
                        {formatDate(holiday.date)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={holiday.isMandatory ? "green" : "orange"}
                    size="small"
                  >
                    {holiday.isMandatory ? "Mandatory" : "Optional"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HolidayCard;
