import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void> | void;
  defaultName?: string;
  isSaving: boolean;
}

const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultName = '',
  isSaving,
}) => {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setError('');
    }
  }, [isOpen, defaultName]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }
    try {
      await onSave(name.trim());
      onClose();
    } catch {
      // Parent handles error
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-soft-hover w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 text-primary-500">
              <Save className="w-6 h-6" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-slate-900 mb-0">Save as Template</h3>
          </div>

          {/* Body */}
          <div className="mb-6 space-y-4">
            <p className="text-sm text-slate-600">
              Save your current survey structure as a template to reuse later.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && !isSaving && handleSave()}
                className={`block w-full rounded-md border-slate-300 shadow-soft focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 ${error ? 'border-red-300' : ''}`}
                placeholder="Enter template name"
                maxLength={100}
                autoFocus
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-red-600 h-4">{error}</span>
                <span className="text-xs text-slate-400">{name.length}/100</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveAsTemplateModal;