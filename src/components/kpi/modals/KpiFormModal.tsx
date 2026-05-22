import { Switch } from "antd";
import { Save, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../../common";
import Input from "../../common/Input";
import { TextArea } from "../../common/TextArea";

export interface KpiData {
  code: string;
  name: string;
  description: string;
  info: string;
  category: string;
  id?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

interface KpiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KpiData) => void;
  initialData?: KpiData | null;
}

const EMPTY_FORM_STATE = {
  code: "",
  name: "",
  description: "",
  info: "",
  category: "",
};

const KpiFormModal: React.FC<KpiFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<KpiData>(EMPTY_FORM_STATE);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData(EMPTY_FORM_STATE);
      }
    }
  }, [isOpen, initialData]);

  const isEditMode = !!initialData;
  const title = isEditMode ? "Edit KPI" : "Create New KPI";
  const submitButtonLabel = isEditMode ? "Save Changes" : "Create KPI";
  const isValidName = (value: string) =>
    /^(?=.*[a-zA-Z])[a-zA-Z0-9 &_\-]+$/.test(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawName = formData.name;
    const trimmedName = rawName.trim();

    if (!trimmedName) {
      toast.error("KPI name cannot be empty");
      return;
    }
    if (trimmedName.length < 3) {
      toast.error("KPI name must be at least 3 characters");
      return;
    }
    if (trimmedName.length > 100) {
      toast.error("KPI name length must be smaller than 100 characters");
      return;
    }
    if (!isValidName(trimmedName)) {
      toast.error("KPI name can only have alphabets and numbers");
      return;
    }

    const code =
      formData.code || formData.name.toUpperCase().replace(/\s+/g, "_");
    const dataToSubmit: KpiData = isEditMode
      ? { ...formData, code, id: initialData?.id }
      : { ...formData, code };

    onSubmit(dataToSubmit);
    onClose();
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ marginTop: 0 }}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
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
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                KPI Name<span className="text-red-500 ml-1">*</span>{" "}
              </label>

              {isEditMode && (
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-sm font-semibold text-slate-700">
                    Active
                  </label>
                  <Switch
                    className="min-h-[15px]"
                    checked={formData.isActive !== false}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        isActive: formData.isActive === false,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <Input
              required
              placeholder="e.g., Code Quality"
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
              onChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              minRows={5}
              required
              placeholder="Brief description of this KPI"
            />
          </div>

          <Input
            label="Category (Optional)"
            placeholder="e.g., Performance, Quality, Innovation"
            value={formData.category}
            onChange={(value) =>
              setFormData({ ...formData, category: value as string })
            }
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              htmlType="button"
              appearance="secondary"
              onClick={handleClose}
            >
              Cancel
            </Button>

            <Button
              htmlType="submit"
              appearance="primary"
              icon={<Save className="w-4 h-4" />}
            >
              {submitButtonLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KpiFormModal;
