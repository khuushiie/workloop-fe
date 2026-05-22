import React from "react";
import { Users } from "lucide-react";
import { VIEW_MODE, ViewMode } from "../../../utils/constants";

interface ViewModeTabsProps {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const ViewModeTabs: React.FC<ViewModeTabsProps> = ({ viewMode, setViewMode, setPage }) => (
  <div className="mb-1 flex border-b border-slate-200">
    <button
      onClick={() => {
        setViewMode(VIEW_MODE.ALL);
        setPage(1);
      }}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        viewMode === VIEW_MODE.ALL
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }`}
    >
      <span className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        All Employees
      </span>
    </button>
    <button
      onClick={() => {
        setViewMode(VIEW_MODE.REPORTEES);
        setPage(1);
      }}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        viewMode === VIEW_MODE.REPORTEES
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }`}
    >
      <span className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        My Reportees
      </span>
    </button>
  </div>
);

export default ViewModeTabs;

