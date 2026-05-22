import React, { useMemo } from "react";
import { useAuth } from "../../../store/hooks/useAuth";
import { RoleTypeEnum } from "../../../utils/constants";

export type TabKey = "roles" | "users" | "overrides" | "modules";

type TabSelectorProps = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

const TabSelector: React.FC<TabSelectorProps> = ({ active, onChange }) => {
  const { user } = useAuth();
  const isSuperAdmin =
    (user as { role?: string })?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN?.toLowerCase();

  const tabs = useMemo(() => {
    const all: { k: TabKey; label: string }[] = [
      { k: "roles", label: "Setup Roles Permission" },
      { k: "users", label: "Users" },
      { k: "overrides", label: "Additional Users Permissions" },
      { k: "modules", label: "Module Management" },
    ];
    return isSuperAdmin ? all : all.filter((t) => t.k !== "modules");
  }, [isSuperAdmin]);

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
