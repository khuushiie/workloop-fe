import { SimpleTooltip } from "../../../common";
import { IResourceMeta, ITransformedTeamSize } from "../../../../store/apis/resource-allocation/project-analytics.api";

const COLORS = [
  "#2563eb",
  "#22c55e",
  "#f97316",
  "#7c3aed",
  "#06b6d4",
  "#e11d48",
];

const TeamSizeByProject = ({ data }: { data: ITransformedTeamSize[] }) => {

  return (
    <div className="bg-white rounded-2xl shadow-soft p-5 flex flex-col h-[460px]  w-full">
      {/* Title */}
      <h3 className="text-md font-semibold mb-4 text-slate-500">
        Team Size by Project
      </h3>

      {/* Scroll container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-5">
        {data.map((p, index: number) => {
          const capacity = Number(p.capacity) || 1;
          const allocation = Math.round(Number(p.allocation)) || 0;

          const percent = Math.min((allocation / capacity) * 100, 100);

          const color = COLORS[index % COLORS.length];

          const tooltipLabel = (
            <div className="flex flex-col gap-1.5 min-w-[240px]">
              <div className="border-b border-slate-200 pb-1.5 mb-1 pt-2 font-semibold text-slate-800 sticky top-0 bg-white -mx-3 px-3 rounded-t-lg">
                Team Members
              </div>
              {p.resources?.length > 0 ? (
                p.resources.map((res: IResourceMeta | string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 text-slate-600 w-full"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                      <span className="truncate">
                        {typeof res === "string" ? res : res.name || "Unknown"}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0">
                      {typeof res === "string" ? 0 : res.allocation || 0}%
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 italic">
                  No resources allocated
                </span>
              )}
            </div>
          );

          return (
            <div key={p.name} className="w-full min-w-0">
              {/* header */}
              <div className="flex justify-between items-center mb-2 gap-3">
                <span className="text-sm font-medium text-slate-800 truncate cursor-default">
                  {p.name}
                </span>

                <SimpleTooltip
                  delay={600}
                  side="top"
                  closeOnScroll={false}
                  tooltipClassName="max-h-[180px] overflow-y-auto pr-1 -ml-12 mt-2 pt-0 overflow-x-hidden scrollbar-thin"
                  label={tooltipLabel}
                >
                  <span className="text-sm font-semibold text-slate-900 whitespace-nowrap cursor-pointer">
                    {allocation}
                    <span className="text-slate-400 font-normal ml-1">
                      Resources
                    </span>
                  </span>
                </SimpleTooltip>
              </div>

              {/* progress track */}
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 hover:opacity-90"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamSizeByProject;
