import React, { useState, useEffect } from "react";
import { Modal, ModalFooter, ModalButton } from "../common";

interface KpiAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (selectedKpiIds: Set<string>) => Promise<void>;
  user: any;
  kpis: any[];
  assignedKpisByUser: Record<string, any[]>;
  loading?: boolean;
}

const KpiAssignmentModal: React.FC<KpiAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  user,
  kpis,
  assignedKpisByUser,
  loading = false,
}) => {
  const [selectedKpiIds, setSelectedKpiIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = user?._id || user?.id;

  // Initialize selected KPIs when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      const assigned = new Set<string>(
        (assignedKpisByUser[userId] || []).map((a: any) => a.kpiId)
      );
      setSelectedKpiIds(assigned);
    }
  }, [isOpen, userId, assignedKpisByUser]);

  const handleKpiToggle = (kpiId: string) => {
    const newSelected = new Set(selectedKpiIds);
    if (newSelected.has(kpiId)) {
      newSelected.delete(kpiId);
    } else {
      newSelected.add(kpiId);
    }
    setSelectedKpiIds(newSelected);
  };

  const calculateTotalWeight = () => {
    return Array.from(selectedKpiIds).reduce((total, kpiId) => {
      const kpi = kpis.find((k) => k._id === kpiId);
      return total + (kpi?.weight || 10);
    }, 0);
  };

  const totalWeight = calculateTotalWeight();
  const isValidSelection = totalWeight === 100;

  const handleSubmit = async () => {
    if (!isValidSelection) return;

    try {
      setIsSubmitting(true);
      await onAssign(selectedKpiIds);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWeightageMessage = () => {
    if (totalWeight === 100) {
      return (
        <div className="text-sm text-green-600 mt-1">
          ✅ Perfect! Total weightage is exactly 100.
        </div>
      );
    } else if (totalWeight > 100) {
      return (
        <div className="text-sm text-red-600 mt-1">
          ⚠️ Total weightage exceeds 100! Please reduce your selection.
        </div>
      );
    } else if (totalWeight < 100 && selectedKpiIds.size > 0) {
      return (
        <div className="text-sm text-orange-600 mt-1">
          ⚠️ Total weightage must be exactly 100. Add more KPIs or adjust
          weights.
        </div>
      );
    }
    return null;
  };

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || user?.workEmail || "Unknown User";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign KPIs to ${userName}`}
      size="lg"
      loading={loading}
    >
      <div className="space-y-4">
        {/* Selection Summary */}
        <div className="p-3 bg-primary-50 rounded-lg">
          <div className="text-sm text-primary-700">
            <strong>{selectedKpiIds.size}</strong> of{" "}
            <strong>{kpis.length}</strong> KPIs selected
          </div>
          <div className="text-sm text-primary-700 mt-1">
            Total Weightage: <strong>{totalWeight}</strong> / 100
          </div>
          {getWeightageMessage()}
        </div>

        {/* KPI Selection */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {kpis.map((kpi) => {
            const isAlreadyAssigned = assignedKpisByUser[userId]?.some(
              (assignment: any) => assignment.kpiId === kpi._id
            );
            const isSelected = selectedKpiIds.has(kpi._id);

            return (
              <label
                key={kpi._id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleKpiToggle(kpi._id)}
                  className="rounded h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300"
                  disabled={isSubmitting}
                />
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      isAlreadyAssigned ? "text-slate-500" : ""
                    }`}
                  >
                    {kpi.name}
                  </div>
                  <div
                    className={`text-sm ${
                      isAlreadyAssigned ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {kpi.description}
                  </div>
                </div>
                <div
                  className={`text-sm ${
                    isAlreadyAssigned ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Weightage:{" "}
                  <span className="font-medium">{kpi.weight || 10}</span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <ModalFooter className="pt-4 border-t border-slate-200">
          <ModalButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </ModalButton>
          <ModalButton
            type="button"
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!isValidSelection || isSubmitting}
          >
            {isValidSelection
              ? `${
                  assignedKpisByUser[userId]?.length > 0 ? "Update" : "Assign"
                } ${selectedKpiIds.size} KPI${
                  selectedKpiIds.size !== 1 ? "s" : ""
                }`
              : "Total weightage must be 100"}
          </ModalButton>
        </ModalFooter>
      </div>
    </Modal>
  );
};

export default KpiAssignmentModal;
