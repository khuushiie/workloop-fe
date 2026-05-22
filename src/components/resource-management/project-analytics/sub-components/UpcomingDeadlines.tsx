import dayjs from "dayjs";
import { SimpleTooltip } from "../../../common";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const UpcomingDeadlines = ({ data }: any) => {
  const [year, setYear] = useState(dayjs().year());
  const yearStart = dayjs().year(year).startOf("year");
  const yearEnd = dayjs().year(year).endOf("year");
  const totalDays = yearEnd.diff(yearStart, "day");

  const getPosition = (date: string) => {
    const d = dayjs(date);

    if (d.isBefore(yearStart)) return 0;
    if (d.isAfter(yearEnd)) return 100;

    return (d.diff(yearStart, "day") / totalDays) * 100;
  };

  const projectsInYear =
    data?.filter((project: any) => {
      const start = dayjs(project.startDate);
      const end = dayjs(project.endDate);

      return start.isBefore(yearEnd, "day") && end.isAfter(yearStart, "day");
    }) || [];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-soft">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold mb-4 text-slate-500">
          Projects Timelines
        </h3>
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
          <ChevronLeft
            className="cursor-pointer hover:text-black"
            onClick={() => setYear((prev) => prev - 1)}
          />
          <span className="font-medium">
            {year}
          </span>
          <ChevronRight
            className="cursor-pointer hover:text-black"
            onClick={() => setYear((prev) => prev + 1)}
          />
        </div>
      </div>

      {/* Month scale */}
      <div className="relative mb-6 overflow-x-auto  ">
        <div className="min-w-[900px]">
          {/* Month labels */}
          <div className="flex items-center mb-3">
            <div className="w-40 shrink-0" />
            <div className="flex-1 flex justify-between text-xs text-slate-500 px-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i}>{dayjs().year(year).month(i).format("MMM")}</span>
              ))}
            </div>
          </div>

          {/* Projects */}


          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            { projectsInYear.length === 0 ? (
              <div className="text-md w-full flex items-center justify-center pt-4 text-slate-400">
                No projects found
              </div>
            ) : (
              projectsInYear.map((project: any) => {
                const startPercent = getPosition(project.startDate);
                const endPercent = getPosition(project.endDate);

                const start = dayjs(project.startDate);
                const end = dayjs(project.endDate);

                const startsBeforeYear = start.isBefore(yearStart, "day");
                const endsAfterYear = end.isAfter(yearEnd, "day");
                const radiusLeft = startsBeforeYear ? 0 : 9999;
                const radiusRight = endsAfterYear ? 0 : 9999;


                const width = endPercent - startPercent;
                if (width <= 0) return null;

                const startLabel = dayjs(project.startDate).year() === year 
                  ? dayjs(project.startDate).format("MMM D, YYYY") 
                  : "";
                const endLabel = dayjs(project.endDate).year() === year 
                  ? dayjs(project.endDate).format("MMM D, YYYY") 
                  : "";

                const fullStartLabel = dayjs(project.startDate).format("MMM D, YYYY");
                const fullEndLabel = dayjs(project.endDate).format("MMM D, YYYY");

                const showInsideText = width > 20;

                return (
                  <div key={project.name} className="flex items-center gap-4 ">
                    {/* Project name */}
                    <div className="w-40 text-sm font-medium text-slate-800 truncate shrink-0">
                      <SimpleTooltip
                        className="truncate"
                        tooltipClassName={`${project.name.length > 16 ? "" : "hidden"}`}
                        side="top"
                        label={project.name}
                      >
                        {project.name}
                      </SimpleTooltip>
                    </div>

                    {/* Timeline */}
                    <div className="relative flex-1 h-8 bg-slate-100 rounded-full">
                      <div
                        className="absolute"
                        style={{
                          left: `${startPercent}%`,
                          width: `${width}%`,
                        }}
                      >
                        <SimpleTooltip
                          side="top"
                          label={
                            <>
                              <div>Start Date : {fullStartLabel}</div>
                              <div>End Date : {fullEndLabel}</div>
                            </>
                          }
                        >
                          <div className="h-8 bg-primary-600 flex items-center justify-between px-2 text-xs text-white cursor-pointer whitespace-nowrap overflow-hidden"
                            style={{
                              borderTopLeftRadius: radiusLeft,
                              borderBottomLeftRadius: radiusLeft,
                              borderTopRightRadius: radiusRight,
                              borderBottomRightRadius: radiusRight,
                            }}
                          >

                            {showInsideText ? (
                              <>
                                <span>{startLabel}</span>
                                <span>{endLabel}</span>
                              </>
                            ) : (
                              <span className="truncate w-full text-left">
                                {startLabel ? `${startLabel}...` : ""}
                              </span>
                            )}
                          </div>
                        </SimpleTooltip>
                      </div>
                    </div>
                  </div>
                );
              }))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
