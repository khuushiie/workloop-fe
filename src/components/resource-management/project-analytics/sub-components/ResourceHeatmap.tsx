import { useState, useEffect } from "react";
import { capitalizeWords } from "../../../../utils/nameUtils";
import OverflowTooltip from "../../../common/OverflowTooltip";
import SimpleTooltip from "../../../common/SimpleTooltip";

const COLOR_SCALE = ["#f1f5f9", "#c7d2fe", "#93c5fd", "#3b82f6", "#1e40af"];

const getColor = (value: number) => {
  if (value <= 1) return COLOR_SCALE[0];
  if (value === 2) return COLOR_SCALE[1];
  if (value === 3) return COLOR_SCALE[2];
  if (value === 4) return COLOR_SCALE[3];
  return COLOR_SCALE[4];
};

const getTextColor = (value: number) =>
  value >= 4 ? "text-white" : "text-slate-900";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 768
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDesktop;
};

const ROW_HEIGHT = 36; // h-9
const GAP = 8;

const ResourceHeatmap = ({ data }: any) => {
  const projects: string[] = data?.projects ?? [];
  const roles: string[] = data?.roles ?? [];

  const isDesktop = useIsDesktop();

  const ROLE_COL_WIDTH = isDesktop ? 140 : 120;
  const CELL_W = isDesktop ? 132 : 56;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-soft w-full">
      <h3 className="text-md font-semibold mb-4 text-slate-500">
        Resource Distribution Heatmap
      </h3>

      <div className="border rounded-xl overflow-hidden">
        {/* Two-column layout: [sticky roles] | [scrollable projects] */}
        <div className="flex max-h-[420px] overflow-y-auto">

          {/* ── LEFT: sticky role labels ── */}
          <div
            className="flex-shrink-0 bg-white sticky left-0 z-10 border-r border-slate-200"
            style={{ width: ROLE_COL_WIDTH }}
          >
            {/* Blank header to align with project header row */}
            <div style={{ height: ROW_HEIGHT + GAP }} />

            {roles.map((role) => (
              <div
                key={role}
                className="flex items-center pl-3 md:pl-5 text-sm font-medium text-slate-700 truncate"
                style={{ height: ROW_HEIGHT, marginBottom: GAP }}
              >
                {role}
              </div>
            ))}
          </div>

          {/* ── RIGHT: horizontally scrollable project grid ── */}
          <div className="overflow-x-auto flex-1">
            <div className="flex flex-col" style={{ padding: `0 ${GAP}px` }}>

              {/* Project header row */}
              <div className="flex gap-2" style={{ marginBottom: GAP }}>
                {projects.map((project) => (
                  <div
                    key={project}
                    className="flex-shrink-0 flex items-center px-1 cursor-default"
                    style={{ width: CELL_W, height: ROW_HEIGHT }}
                  >
                    <OverflowTooltip text={project} className="text-xs font-medium text-slate-500">
                      {project}
                    </OverflowTooltip>
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {roles.map((role, rowIndex) => (
                <div
                  key={role}
                  className="flex gap-2"
                  style={{ marginBottom: GAP }}
                >
                  {data?.values[rowIndex]?.map((value: number, colIndex: number) => (
                    <SimpleTooltip
                      key={`${rowIndex}-${colIndex}`}
                      side="top"
                      tooltipClassName="md:mt-4"
                      closeOnScroll={false}
                      label={
                        <div className="w-[160px] min-h-[40px] flex flex-col p-1">
                          {/* Tooltip header */}
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="flex flex-col flex-1 overflow-hidden">
                              <div
                                className="font-semibold text-[14px] text-slate-800 truncate"
                                title={role}
                              >
                                {role}
                              </div>
                              <div
                                className="text-slate-500 text-[12px] truncate"
                                title={projects[colIndex]}
                              >
                                {capitalizeWords(projects[colIndex])}
                              </div>
                            </div>
                            <span className="shrink-0 bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full font-semibold text-[11px]">
                              {value}
                            </span>
                          </div>

                          {/* Divider + resource list */}
                          {data?.metaMatrix[rowIndex][colIndex]?.length > 0 && (
                            <>
                              <div className="border-t mb-2" />
                              <div className="space-y-1 max-h-28 overflow-auto">
                                {[...(data?.metaMatrix[rowIndex][colIndex] || [])]
                                  .sort((a: any, b: any) => b?.allocation - a?.allocation)
                                  .map((r: any, i: number) => (
                                    <div key={i} className="flex justify-between gap-2">
                                      <span
                                        className="truncate flex-1 text-slate-700"
                                        title={r?.name}
                                      >
                                        {r?.name}
                                      </span>
                                      <span className="font-semibold shrink-0">
                                        {Math.round(r?.allocation)}%
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </>
                          )}
                        </div>
                      }
                    >
                      <div
                        className={`flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-semibold transition-transform duration-200 hover:scale-110 ${getTextColor(value)}`}
                        style={{
                          width: CELL_W,
                          height: ROW_HEIGHT,
                          backgroundColor: getColor(value),
                        }}
                      >
                        {value}
                      </div>
                    </SimpleTooltip>
                  ))}
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResourceHeatmap;