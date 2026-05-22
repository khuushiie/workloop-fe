import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { TemplateItem } from '../types';

interface DuplicateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
  loading?: boolean;
  template: TemplateItem | null;
}

const DuplicateTemplateModal: React.FC<DuplicateTemplateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  template,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && template) {
      setNewTitle(`${template.title} (Copy)`);
      setError('');
    }
  }, [isOpen, template]);

  const handleConfirm = () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) { setError('Title is required'); return; }
    if (trimmedTitle.length < 3) { setError('Title must be at least 3 characters'); return; }
    if (trimmedTitle.length > 100) { setError('Title must be less than 100 characters'); return; }
    setError('');
    onConfirm(trimmedTitle);
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
              <Copy className="w-6 h-6" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-slate-900 mb-0">Duplicate Template</h3>
          </div>

          {/* Body */}
          <div className="mb-6 space-y-4">
            <p className="text-sm text-slate-600">
              Create a copy of <span className="font-medium text-slate-800">"{template?.title}"</span>.
              The new template will contain all existing questions.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Template Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setError('');
                }}
                className={`block w-full rounded-md border-slate-300 shadow-soft focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 ${error ? 'border-red-300' : ''}`}
                placeholder="Enter new title"
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateTemplateModal;