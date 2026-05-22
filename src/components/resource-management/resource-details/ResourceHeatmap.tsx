export function calculateDailyUtilization(projects: any[], monthsRange = 3) {
  const today = dayjs();
  const startMonth = today.subtract(monthsRange - 1, "month").startOf("month");
  const endMonth = today.endOf("month");

  const dailyMap: Record<string, { percent: number; projects: any[] }> = {};

  projects.forEach((proj) => {
    const start = dayjs(proj.startDate);
    const end = dayjs(proj.endDate);
    const percent = proj.allocationPercentage ?? 0;

    let current = start;

    while (current.isBefore(end) || current.isSame(end)) {
      const key = current.format("YYYY-MM-DD");

      if (!dailyMap[key]) {
        dailyMap[key] = { percent: 0, projects: [] };
      }

      dailyMap[key].percent += percent;
      dailyMap[key].projects.push({
        projectName: proj.projectId?.name ?? "Unnamed Project",
        allocationPercentage: percent,
      });

      current = current.add(1, "day");
    }
  });

  // ensure full range
  const final: any[] = [];
  let current = startMonth;

  while (current.isBefore(endMonth) || current.isSame(endMonth)) {
    const key = current.format("YYYY-MM-DD");

    final.push({
      date: key,
      percent: Math.min(dailyMap[key]?.percent || 0, 100),
      projects: dailyMap[key]?.projects || [],
    });

    current = current.add(1, "day");
  }

  return final;
}

import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SimpleTooltip from "../../common/SimpleTooltip";

type DayProject = {
  projectName: string;
  allocationPercentage: number;
};

type GridDay = {
  date: string;
  percent: number;
  projects: DayProject[];
} | null;

const getColor = (percent: number) => {
  if (percent === 0) return "bg-slate-200";
  if (percent <= 25) return "bg-green-200";
  if (percent <= 50) return "bg-green-400";
  if (percent <= 75) return "bg-green-600";
  return "bg-green-800";
};

const ResourceHeatmap = ({ data }: { data: any[] }) => {
  const [rangeOffset, setRangeOffset] = useState(0);

  const isForwardDisabled = rangeOffset === 0;
  const [monthsToShow, setMonthsToShow] = useState(4);

  // Detect screen size and update number of months
  useEffect(() => {
    const updateMonths = () => {
      const width = window.innerWidth;

      if (width < 500) {
        setMonthsToShow(2);      // small mobile
      } else if (width < 640) {
        setMonthsToShow(3);      // large mobile / small tablet
      } else if (width < 768) {
        setMonthsToShow(4);      // large mobile / small tablet
      } else if (width < 1024) {
        setMonthsToShow(5);      // tablet
      } else if (width < 1370) {
        setMonthsToShow(3);      // laptop
      } else if (width < 1560) {
        setMonthsToShow(4);      // laptop
      } else if (width < 1800) {
        setMonthsToShow(5);      // laptop
      } else {
        setMonthsToShow(6);      // large desktop
      }
    };

    updateMonths();
    window.addEventListener("resize", updateMonths);

    return () => window.removeEventListener("resize", updateMonths);
  }, []);

  const months: Dayjs[] = [];
  for (let i = 0; i < monthsToShow; i++) {
    months.push(
      dayjs()
        .startOf("month")
        .subtract(i + rangeOffset * monthsToShow, "month"),
    );
  }
  months.reverse();

  const rangeLabel = `${months[0].format("MMM")} – ${months[
    monthsToShow - 1
  ].format("MMM")} ${months[monthsToShow - 1].format("YYYY")}`;

  const generateMonthGrid = (month: Dayjs) => {
    const start = month.startOf("month");
    const daysInMonth = month.daysInMonth();
    const firstDayIndex = start.day();
    const weeks = Math.ceil((firstDayIndex + daysInMonth) / 7);

    const grid: GridDay[][] = Array.from({ length: 7 }, () =>
      Array(weeks).fill(null),
    );

    let pointer = start;

    for (let index = 0; index < daysInMonth; index++) {
      const weekday = pointer.day();
      const weekIndex = Math.floor((index + firstDayIndex) / 7);

      const matched = data.find((d) => d.date === pointer.format("YYYY-MM-DD"));

      grid[weekday][weekIndex] = {
        date: pointer.format("YYYY-MM-DD"),
        percent: matched?.percent || 0,
        projects: matched?.projects || [],
      };

      pointer = pointer.add(1, "day");
    }

    return grid;
  };

  return (
    <div className="w-full px-4 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg sm:text-xl font-semibold">Contributions</h3>

        <div className="flex items-center gap-2 text-sm">
          <ChevronLeft
            className="cursor-pointer hover:text-black"
            onClick={() => setRangeOffset(rangeOffset + 1)}
          />
          <span className="font-medium">{rangeLabel}</span>
          <ChevronRight
            className={`${isForwardDisabled
                ? "text-slate-300 cursor-not-allowed"
                : "cursor-pointer hover:text-black"
              }`}
            onClick={() => {
              if (!isForwardDisabled) {
                setRangeOffset(rangeOffset - 1);
              }
            }}
          />

        </div>
      </div>

      {/* Heatmap layout */}
      <div className="w-full flex justify-center gap-2">
        {/* Day labels */}
        <div className="flex flex-col justify-between text-xs text-slate-500 mt-8 mr-2 h-[120px]">
          <span>Mon</span>
          <span>Wed</span>
          <span>Sat</span>
        </div>

        {/* Month blocks */}
        <div className="flex gap-6 overflow-hidden">
          {months.map((month, index) => {
            const grid = generateMonthGrid(month);

            return (
              <div key={index} className="flex flex-col gap-1">
                <div className="text-center text-sm font-medium mb-2">
                  {month.format("MMM")}
                </div>

                <div className="flex gap-1">
                  {grid[0].map((_, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-1">
                      {grid.map((row, weekdayIndex) => {
                        const day = row[colIndex];

                        if (!day)
                          return <div key={weekdayIndex} className="w-4 h-4" />;

                        return (
                          <SimpleTooltip
                            key={weekdayIndex}
                            side="top"
                            label={
                              <div className="p-3 w-56">
                                <div className="mb-3 pb-2 border-b border-slate-200">
                                  <span className="text-sm font-semibold text-slate-800">
                                    {dayjs(day.date).format("ddd, MMM DD")}
                                  </span>
                                </div>

                                {day.projects.length === 0 ? (
                                  <span className="text-slate-700 text-[12px] rounded-full py-1 px-3 inline-block text-center">
                                    No projects
                                  </span>
                                ) : (
                                  <ul className="space-y-2">
                                    {day.projects.map((proj, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <span className="w-2 h-2 bg-primary-500 rounded-full" />
                                        <span
                                          className="text-slate-800 font-medium flex-1 min-w-0 truncate"

                                        >
                                          {proj.projectName}
                                        </span>
                                        <span className="ml-auto text-slate-600 text-xs">
                                          {proj.allocationPercentage}%
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            }
                          >
                            <div
                              className={`w-4 h-4 rounded-sm cursor-pointer ${getColor(
                                day.percent,
                              )}`}
                            />
                          </SimpleTooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResourceHeatmap;
