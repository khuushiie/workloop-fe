import React, { useState, useEffect } from 'react';
import { Modal, ModalFooter, ModalButton } from '../common';
import { TextArea } from '../common/TextArea';

interface KpiFormData {
  name: string;
  description: string;
  info: string;
  weight: number;
  isActive: boolean;
}

interface KpiFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KpiFormData) => Promise<void>;
  initialData?: Partial<KpiFormData>;
  isEditMode?: boolean;
  loading?: boolean;
}

interface KpiFormErrors {
  name?: string;
  description?: string;
  info?: string;
  weight?: string;
}
const KpiForm: React.FC<KpiFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditMode = false,
  loading = false,
}) => {
  const [formData, setFormData] = useState<KpiFormData>({
    name: '',
    description: '',
    info: '',
    weight: 10,
    isActive: true,
  });

 const [errors, setErrors] = useState<KpiFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        info: initialData.info || '',
        weight: initialData.weight || 10,
        isActive: initialData.isActive ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        info: '',
        weight: 10,
        isActive: true,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

type KpiErrorKeys = keyof KpiFormErrors;


  const validateForm = (): boolean => {
    const newErrors: KpiFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'KPI Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 100) {
      newErrors.description = 'Description must be 100 characters or less';
    }

    if (!formData.info.trim()) {
      newErrors.info = 'KPI Info is required';
    }

    if (formData.weight < 1 || formData.weight > 100) {
      newErrors.weight = 'Weight must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof KpiFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
   if (field in errors) {
  setErrors(prev => ({ ...prev, [field as KpiErrorKeys]: undefined }));
}
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit KPI' : 'Add New KPI'}
      size="md"
      loading={loading}
    >
      <form onSubmit={handleSubmit} className="space-y-4 ">
        {/* KPI Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            KPI Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.name ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter KPI name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <TextArea
            label="Description"
            value={formData.description}
            onChange={(value) => handleInputChange('description', value as string)}
            maxLength={100}
            placeholder="Brief description of what this KPI measures"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p className="text-sm text-red-600">{errors.description}</p>
            ) : (
              <p className="text-xs text-slate-500">
                Brief description of what this KPI measures
              </p>
            )}
            <p className={`text-xs ${formData.description.length > 90 ? 'text-red-500' : 'text-slate-500'}`}>
              {formData.description.length}/100
            </p>
          </div>
        </div>

        {/* KPI Info */}
        <div>
          <TextArea
            label='KPI Info (for hover tooltip) ' 
            required
            value={formData.info}
            onChange={(value) => handleInputChange('info', value as string)}
            placeholder="Enter detailed information about this KPI that will be shown in the hover tooltip. You can use numbered points like:&#10;1. Complete assigned tasks on time&#10;2. Maintain quality standards&#10;3. Collaborate effectively with team members"
            disabled={isSubmitting}
          />
          {errors.info ? (
            <p className="mt-1 text-sm text-red-600">{errors.info}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              This information will be displayed when users hover over the info icon next to the KPI name.
            </p>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Weightage (1-100) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.weight ? 'border-red-500' : 'border-slate-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.weight ? (
            <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              Higher weightage means this KPI has more importance. Total weightage of all assigned KPIs must equal exactly 100.
            </p>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="isActive" className="text-sm text-slate-700">
            Active
          </label>
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
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditMode ? 'Update KPI' : 'Create KPI'}
          </ModalButton>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default KpiForm;
