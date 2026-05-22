import React, { useState, useCallback } from "react";
import { X, Save, MessageSquare, Info } from "lucide-react";
import { Button, Select, SimpleTooltip } from "../../common";
import Input from "../../common/Input";
import { TextArea } from "../../common/TextArea";
import {
  IKpiResponseV2,
  IKpiSetResponseV2,
  KpiTimeline,
  KPI_TIMELINE_VALUES,
} from "../../../types/kpi.api.types";

/** KPI item with id (v2 API) */
interface KpiWithId {
  id: string;
}

export interface SetFormSubmitData {
  code: string;
  name: string;
  description: string;
  timeline: KpiTimeline;
  kpis: string[];
}

interface SetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SetFormSubmitData) => void;
  editingSet?: IKpiSetResponseV2 | null;
  kpis: IKpiResponseV2[];
}

const SetFormModal: React.FC<SetFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingSet,
  kpis,
}) => {
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    description: string;
    timeline: KpiTimeline;
  }>({
    code: "",
    name: "",
    description: "",
    timeline: KpiTimeline.WEEKLY,
  });
  const [selectedKpis, setSelectedKpis] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (editingSet) {
      setFormData({
        code: editingSet.code || "",
        name: editingSet.name || "",
        description: editingSet.description || "",
        timeline: (editingSet.timeline as KpiTimeline) || KpiTimeline.WEEKLY,
      });
      setSelectedKpis(
        new Set(
          (editingSet.kpis ?? []).map((k: KpiWithId) => k.id).filter(Boolean)
        )
      );
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        timeline: KpiTimeline.WEEKLY,
      });
      setSelectedKpis(new Set());
    }
  }, [editingSet, isOpen]);

  const handleKpiToggle = useCallback((kpiId: string) => {
    setSelectedKpis((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(kpiId)) {
        newSet.delete(kpiId);
      } else {
        newSet.add(kpiId);
      }
      return newSet;
    });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const kpisArray = Array.from(selectedKpis);

      if (kpisArray.length < 1) {
        return;
      }
      if (kpisArray.length > 20) {
        return;
      }

      formData.code =
        formData.code || formData.name.toUpperCase().replace(/\s+/g, "_");

      const payload = {
        ...formData,
        kpis: kpisArray,
      };

      onSubmit(payload);
    },
    [formData, selectedKpis, onSubmit]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ marginTop: 0 }}
    >
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {editingSet ? "Edit KPI Set" : "Create New KPI Set"}
          </h2>
          <Button
            htmlType="button"
            appearance="secondary"
            onClick={onClose}
            className="p-0 text-slate-500 hover:text-slate-700"
            icon={<X className="w-6 h-6" />}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Code * <span className="text-xs text-slate-500">(unique identifier)</span>
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., WEEK_SET_1"
            />
          </div> */}

          <div>
            <Input
              label="Name"
              required
              placeholder="e.g., Weekly Performance Set"
              value={formData.name}
              onChange={(value) =>
                setFormData({ ...formData, name: value as string })
              }
            />
          </div>

          <div>
            <TextArea
              label="Description"
              value={formData.description}
              onChange={(value: string) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="Optional description"
            />
          </div>

          <div>
            <Select
              label=" Timeline (Period)"
              options={KPI_TIMELINE_VALUES.map((t) => ({
                value: t,
                label: t === KpiTimeline.WEEKLY ? "Weekly" : t === KpiTimeline.MONTHLY ? "Monthly" : "Yearly",
              }))}
              value={formData.timeline}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  timeline: (value as KpiTimeline) ?? KpiTimeline.WEEKLY,
                })
              }
              placeholder="Select timeline"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Add KPIs to this Set<span className="text-red-500 ml-1">*</span>{" "}
              <span className="text-xs text-slate-500">(Select 1-20 KPIs)</span>
            </label>
            <div className="text-sm text-slate-600 mb-2 bg-primary-50 border border-primary-200 rounded p-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Currently selected: <strong>{selectedKpis.size}</strong> KPI
              {selectedKpis.size !== 1 ? "s" : ""}
              {selectedKpis.size > 0 && selectedKpis.size <= 20 && (
                <span className="ml-2 text-green-600">✓ Valid</span>
              )}
              {selectedKpis.size === 0 && (
                <span className="ml-2 text-red-600">
                  ⚠ Select at least 1 KPI
                </span>
              )}
              {selectedKpis.size > 20 && (
                <span className="ml-2 text-red-600">
                  ⚠ Maximum 20 KPIs allowed
                </span>
              )}
            </div>
            <div className="border border-slate-300 rounded-lg max-h-64 overflow-y-auto">
              {kpis.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No KPIs available</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Go to KPI Management to create KPIs first
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-40 sm:gap-x-5 gap-y-3">
                  {kpis.map((kpi) => (
                    <label
                      key={kpi?.id}
                      className="flex items-center justify-between gap-3 p-3 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-primary-200"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedKpis.has(kpi?.id)}
                          onChange={() => handleKpiToggle(kpi?.id)}
                          className="w-5 h-5 shrink-0 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex items-center">
                          <p className="text-xs sm:text-sm font-medium text-slate-900 mb-0">
                            {kpi?.name}
                          </p>
                          <SimpleTooltip
                            key={kpi?.id}
                            label={
                              <div className="text-xs max-w-[200px]">
                                <p className="font-semibold mb-1 text-justify border-b border-slate-500/30 pb-1">
                                  {kpi.name}
                                </p>
                                <p className="text-slate-500 text-justify">
                                  {kpi.description ?? ""}
                                </p>
                              </div>
                            }
                            side="top"
                          >
                            <span
                              className="flex self-center cursor-pointer flex-shrink-0 ml-1"
                              style={{ marginTop: "4px" }}
                            >
                              <Info
                                size={10}
                                className="w-4 h-4 text-slate-400"
                              />
                            </span>
                          </SimpleTooltip>
                        </div>
                      </div>
                      {selectedKpis.has(kpi.id) && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Selected
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              htmlType="button"
              appearance="secondary"
              onClick={onClose}
              className="px-4 py-2"
            >
              Cancel
            </Button>

            <Button
              htmlType="submit"
              appearance="primary"
              disabled={selectedKpis.size < 1 || selectedKpis.size > 20}
              icon={<Save className="w-4 h-4" />}
              className="px-4 py-2"
            >
              {editingSet ? "Update Set" : "Create Set"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetFormModal;
