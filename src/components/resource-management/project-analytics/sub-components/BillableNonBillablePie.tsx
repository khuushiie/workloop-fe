import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = {
  billable: "#2563eb",
  nonBillable: "#22c55e"
};


const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const { name, value, payload: item } = payload[0];
  const total = item.total;

  const percent = ((value / total) * 100).toFixed(1);

  return (
    <div
      className="
        bg-white/95 backdrop-blur-md
        border border-slate-200
        shadow-soft-hover
        rounded-xl
        px-4 py-3
        min-w-[150px]
        transition-all duration-150
      "
    >
      {/* Top label row */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {name}
        </span>
      </div>

      {/* Value + percent */}
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-slate-900">
          {value}
        </span>

      
      </div>
    </div>
  );
};

  
const BillableNonBillablePie = ({ data }: any) => {
  const total = data.billable + data.nonBillable;

  const chartData = [
    { name: "Billable", value: data.billable, color: COLORS.billable },
    { name: "Non Billable", value: data.nonBillable, color: COLORS.nonBillable },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft h-full flex flex-col">
      {/* Title */}
      <h3 className="text-md font-semibold mb-4 text-slate-500 ">
        Billable & Non-Billable Projects
      </h3>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={110}
              isAnimationActive
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
        <div className="flex items-center gap-2 px-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: COLORS.billable }}
          />
          <span className="text-slate-600">Billable</span>
          <span className="ml-auto font-medium text-slate-900">
            {data.billable}
          </span>
        </div>

        <div className="flex items-center gap-2 px-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: COLORS.nonBillable }}
          />
          <span className="text-slate-600">Non Billable</span>
          <span className="ml-auto font-medium text-slate-900">
            {data.nonBillable}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BillableNonBillablePie;
