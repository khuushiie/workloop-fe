import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Label,
  Cell,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IMasterConfigOption, useGetMasterConfigByCategoryQuery } from "../../../../store/apis/masterConfig.api";

/* ---------- Colors ---------- */
const COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

/* ---------- Tooltip ---------- */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const ORDER = ["low", "medium", "high"];

  const sortedPayload = [...payload].sort(
    (a, b) => ORDER.indexOf(a.dataKey) - ORDER.indexOf(b.dataKey)
  );

  return (
    <div className="bg-white px-4 py-3 rounded-xl shadow-soft border border-slate-200">
      <p className="text-sm font-medium text-slate-900 mb-2">{label}</p>

      {sortedPayload.map((item: any) => (
        <div key={item.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: item.fill }}
          />
          <span className="text-slate-600 capitalize">
            {item.name} Priority:
          </span>
          <span className="font-medium text-slate-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
};
/* ---------- Fixed halves ---------- */
const HALF_YEAR_RANGES = [
  { label: "Jan – Jun", months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
  { label: "Jul – Dec", months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
];

const PriorityDistributionChart = ({ data, total }: any) => {
  const availableYears = useMemo(() => {
    return Array.isArray(data) ? data.map((d: any) => d.year).sort((a, b) => b - a) : [new Date().getFullYear()];
  }, [data]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || new Date().getFullYear());
  const [rangeIndex, setRangeIndex] = useState(0);

  /* ---------- Extract year data ---------- */
  const yearData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const found = data.find((d: any) => d.year === selectedYear);
    return found ? found.data : [];
  }, [data, selectedYear]);

  /* ---------- lookup ---------- */
  const lookup = useMemo(
    () => Object.fromEntries(yearData.map((d: any) => [d.month, d])),
    [yearData],
  );

  /* ---------- always 6 months ---------- */
  const visibleData = useMemo(() => {
    return HALF_YEAR_RANGES[rangeIndex].months.map((m) => ({
      month: m,
      ...(lookup[m] || { high: 0, medium: 0, low: 0 }),
    }));
  }, [rangeIndex, lookup]);

  const safeTotal = Math.max(total || 0, 4);

  const steps = 4;
  const step = Math.ceil(safeTotal / steps);

  const ticks = [0, step, step * 2, step * 3, step * 4];

  const { data: priorityData, isLoading: priorityLoading } = useGetMasterConfigByCategoryQuery("project_priority")

  const getColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  }

  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl shadow-soft w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold text-slate-500">
          Priority Distribution
        </h3>

        <div className="flex items-center gap-4">
          {/* Year Selector */}
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs md:text-sm font-medium bg-transparent border-none text-slate-700 outline-none cursor-pointer hover:text-black"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Month Range Selector */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
            <ChevronLeft
              className={`cursor-pointer hover:text-black ${
                rangeIndex === 0 && availableYears.indexOf(selectedYear) === availableYears.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                if (rangeIndex === 0) {
                  const currentIndex = availableYears.indexOf(selectedYear);
                  if (currentIndex < availableYears.length - 1) {
                    setSelectedYear(availableYears[currentIndex + 1]);
                    setRangeIndex(1);
                  }
                } else {
                  setRangeIndex(0);
                }
              }}
            />
            <span className="font-medium">
              {HALF_YEAR_RANGES[rangeIndex].label}
            </span>
            <ChevronRight
              className={`cursor-pointer hover:text-black ${
                rangeIndex === 1 && availableYears.indexOf(selectedYear) === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                if (rangeIndex === 1) {
                  const currentIndex = availableYears.indexOf(selectedYear);
                  if (currentIndex > 0) {
                    setSelectedYear(availableYears[currentIndex - 1]);
                    setRangeIndex(0);
                  }
                } else {
                  setRangeIndex(1);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[420px] h-[240px] md:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visibleData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />

              {/* ✅ ALWAYS VISIBLE */}
              <YAxis
                domain={[0, step * 4]}
                ticks={ticks}
                allowDataOverflow
                interval={0}
                minTickGap={0}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              >
                <Label
                  value="Total Projects"
                  angle={-90}
                  position="insideLeft"
                  style={{ fill: "#6b7280", fontSize: 12 }}
                />
              </YAxis>

              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="high" stackId="a" fill={COLORS.high}>
                {visibleData.map((d: any, i: number) => {
                  const top =
                    d.low > 0
                      ? "low"
                      : d.medium > 0
                        ? "medium"
                        : d.high > 0
                          ? "high"
                          : "";

                  return (
                    <Cell
                      key={i}
                      radius={
                        (top === "high" ? [6, 6, 0, 0] : [0, 0, 0, 0]) as any
                      }
                    />
                  );
                })}
              </Bar>

              <Bar dataKey="medium" stackId="a" fill={COLORS.medium}>
                {visibleData.map((d: any, i: number) => {
                  const top =
                    d.low > 0
                      ? "low"
                      : d.medium > 0
                        ? "medium"
                        : d.high > 0
                          ? "high"
                          : "";

                  return (
                    <Cell
                      key={i}
                      radius={
                        (top === "medium" ? [6, 6, 0, 0] : [0, 0, 0, 0]) as any
                      }
                    />
                  );
                })}
              </Bar>

              <Bar dataKey="low" stackId="a" fill={COLORS.low}>
                {visibleData.map((d: any, i: number) => {
                  const top =
                    d.low > 0
                      ? "low"
                      : d.medium > 0
                        ? "medium"
                        : d.high > 0
                          ? "high"
                          : "";

                  return (
                    <Cell
                      key={i}
                      radius={
                        (top === "low" ? [6, 6, 0, 0] : [0, 0, 0, 0]) as any
                      }
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs md:text-sm">
        {priorityData?.map((item: IMasterConfigOption) => (
          <div key={item?.id} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getColor(item?.filterCode) }}
            />
            <span className="text-slate-600">{item?.displayName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityDistributionChart;
