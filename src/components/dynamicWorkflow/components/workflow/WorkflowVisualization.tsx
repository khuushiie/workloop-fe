interface Level {
  label: string;
  type: "employee" | "level";
}

interface Props {
  levels: Level[];
}

const colorMap = {
  employee: { bg: "bg-blue-100", text: "text-blue-700" },
  level: { bg: "bg-fuchsia-100", text: "text-fuchsia-700" },
};

export function WorkflowVisualization({ levels }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {levels.map((level, index) => {
        const colors = colorMap[level.type];

        return (
          <div key={index} className="flex items-center gap-2">
            
            {/* Circle */}
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center
                text-xs font-semibold
                ${colors.bg} ${colors.text}
              `}
            >
              {level.label}
            </div>

            {/* Arrow */}
            {index !== levels.length - 1 && (
              <span className="text-gray-400 text-sm">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}