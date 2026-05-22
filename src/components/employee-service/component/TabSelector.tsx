import React from "react";

export type TabKey = "notification" | "comp-off" | "game-booking" | "document-approvals";

interface TabItem<T> {
  k: T;
  label: string;
}

interface TabSelectorProps<T> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
}

const TabSelector = <T extends string>({ tabs, active, onChange }: TabSelectorProps<T>) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="bg-white border border-slate-200 rounded-lg md:rounded-full shadow-soft px-1.5 py-1.5 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.k}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-colors duration-200 ${
              active === tab.k
                ? "bg-primary-600 text-white shadow"
                : "text-slate-600 hover:text-primary-600 hover:bg-primary-50"
            }`}
            onClick={() => onChange(tab.k)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabSelector;
