import React from "react";
import { Layers } from "lucide-react";

type GeneratedCodes = {
  moduleCode: string;
  submoduleCode: string;
  actionCode: string;
};

type ModuleSummary = {
  moduleCount: number;
};

type ModuleBuilderCardProps = {
  moduleName: string;
  onModuleNameChange: (value: string) => void;
  submoduleName: string;
  onSubmoduleNameChange: (value: string) => void;
  actionName: string;
  onActionNameChange: (value: string) => void;
  generatedCodes: GeneratedCodes;
  moduleError: string | null;
  moduleSuccess: string | null;
  onCreateModule: () => Promise<void> | void;
  moduleSubmitting: boolean;
  onOpenEditModule: () => void;
  moduleSummary: ModuleSummary;
  canManage?: boolean;
};

const ModuleBuilderCard: React.FC<ModuleBuilderCardProps> = ({
  moduleName,
  onModuleNameChange,
  submoduleName,
  onSubmoduleNameChange,
  actionName,
  onActionNameChange,
  generatedCodes,
  moduleError,
  moduleSuccess,
  onCreateModule,
  moduleSubmitting,
  onOpenEditModule,
  moduleSummary,
  canManage = false,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-900">
          Manage Module
        </h2>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-600 px-3 py-1 text-xs font-semibold border border-primary-100">
        {moduleSummary.moduleCount} modules
      </span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Module Name<span className="text-red-500">*</span>
        </label>
        <input
          className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          placeholder="e.g. Payroll"
          value={moduleName}
          onChange={(e) => onModuleNameChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Submodule Name
        </label>
        <input
          className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          placeholder="Optional e.g. Export"
          value={submoduleName}
          onChange={(e) => onSubmoduleNameChange(e.target.value)}
        />
      </div>
    </div>
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        Action<span className="text-red-500">*</span>
      </label>
      <select
        className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        value={actionName}
        onChange={(e) => onActionNameChange(e.target.value)}
      >
        <option value="">Select an action</option>
        <option value="View">View</option>
        <option value="View & Edit">View & Edit</option>
      </select>
    </div>
    {(generatedCodes.moduleCode ||
      generatedCodes.submoduleCode ||
      generatedCodes.actionCode) && (
      <div className="bg-primary-50/70 border border-primary-200 rounded-xl p-4 text-sm space-y-1">
        <p className="font-medium text-primary-800">Generated Codes</p>
        {generatedCodes.moduleCode && (
          <p className="text-primary-700">
            Module:{" "}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-primary-200">
              {generatedCodes.moduleCode}
            </code>
          </p>
        )}
        {generatedCodes.submoduleCode && (
          <p className="text-primary-700">
            Submodule:{" "}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-primary-200">
              {generatedCodes.submoduleCode}
            </code>
          </p>
        )}
        {generatedCodes.actionCode && (
          <p className="text-primary-700">
            Action:{" "}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-primary-200">
              {generatedCodes.actionCode}
            </code>
          </p>
        )}
      </div>
    )}
    {moduleError && <div className="text-sm text-red-600">{moduleError}</div>}
    {moduleSuccess && (
      <div className="text-sm text-green-600">{moduleSuccess}</div>
    )}
    {canManage && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-2 self-start sm:self-auto">
          <button
           className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onOpenEditModule}
          >
            Edit Module
          </button>
          <button
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCreateModule}
            disabled={moduleSubmitting}
          >
            {moduleSubmitting ? "Creating..." : "Create Module"}
          </button>
        </div>
      </div>
    )}
  </div>
);

export default ModuleBuilderCard;
