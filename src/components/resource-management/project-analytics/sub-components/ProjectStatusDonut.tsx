
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useMemo } from "react";

/* ---------- Colors ---------- */
const COLORS = [
  "#2563eb",
  "#22c55e",
  "#f97316",
  "#7c3aed",
  "#06b6d4",
  "#e11d48",
  "#f59e0b",
  "#14b8a6",
  "#6366f1",
];

/* ---------- Tooltip UI ---------- */
const CustomRingTooltip = ({ active, payload, coordinate }: any) => {
  if (!active || !payload?.length) return null;

  const { name, value, payload: item } = payload[0];
// chart center (50% of 260 height chart ≈ 130)
const chartCenterX = 130;

// decide side automatically
const isRightSide = (coordinate?.x || 0) > chartCenterX;

const xOffset = isRightSide ? 20 : -140;
const yOffset = -30;
  return (
    <div
  style={{
    position: "absolute",
    left: (coordinate?.x || 0) + xOffset,
    top: (coordinate?.y || 0) + yOffset,
    pointerEvents: "none",
  }}
  className="bg-white border border-slate-200 shadow-soft rounded-lg px-3 py-2 min-w-[120px]"
>

      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {name}
        </span>
      </div>

      <div className="text-lg font-semibold text-slate-900">
        {value}%
      </div>
    </div>
  );
};

/* ---------- Component ---------- */
const ProjectStatusDonut = ({ data }: any) => {
  const domains: Record<string, number> = data?.domains || {};
  const total = data?.total || 0;

  /* transform data */
  const chartData = useMemo(() => {
    return Object.entries(domains).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [domains]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft w-full">
      {/* Title */}
      <h3 className="text-md font-semibold mb-4 text-slate-500">
        Domain Wise Projects
      </h3>

      {/* Chart */}
      <div className="relative">
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <span className="text-4xl font-bold text-slate-900">{total}</span>
          <span className="text-xs uppercase tracking-wider text-slate-500">
            Total
          </span>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <PieChart>

            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={85}
              outerRadius={115}
              stroke="#fff"
              strokeWidth={4}
              strokeLinejoin="round"
              isAnimationActive={false}
              animationDuration={0}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>

     
            <Tooltip
              content={<CustomRingTooltip />}

              cursor={false}
              isAnimationActive={false}
              wrapperStyle={{ pointerEvents: "none", zIndex: 50 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-y-3 text-sm overflow-y-auto h-28">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2 px-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-600 truncate">{item.name}</span>
            <span className="ml-auto font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectStatusDonut;
