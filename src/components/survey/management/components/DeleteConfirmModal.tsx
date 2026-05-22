import React from 'react';
import { XCircle } from 'lucide-react';

export type DeleteItemType = 'survey' | 'draft' | 'template';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  itemType: DeleteItemType;
  itemTitle?: string;
}

const getItemTypeLabel = (type: DeleteItemType): string => {
  switch (type) {
    case 'survey': return 'published survey';
    case 'draft': return 'draft';
    case 'template': return 'template';
    default: return 'item';
  }
};

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  itemType,
  itemTitle,
}) => {
  if (!isOpen) return null;

  const itemLabel = getItemTypeLabel(itemType);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-soft-hover w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 text-red-500">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-slate-900 mb-0">Delete {itemType === 'survey' ? 'Survey' : 'Item'}</h3>
          </div>

          {/* Body */}
          <div className="mb-6 space-y-2">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete this {itemLabel}?
              {itemTitle && <span className="font-medium text-slate-800"> "{itemTitle}"</span>}
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;