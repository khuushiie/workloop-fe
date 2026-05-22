import React from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { cn } from '../../../utils/cn';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    buttonVariant: 'primary' as const,
  },
  info: {
    icon: Info,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    buttonVariant: 'primary' as const,
  },
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center mb-4',
              config.iconBg
            )}
          >
            <Icon className={cn('w-6 h-6', config.iconColor)} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-sm text-slate-600 mb-6 max-w-sm">{message}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              appearance="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none sm:min-w-[100px]"
            >
              {cancelText}
            </Button>
            <Button
              appearance={config.buttonVariant}
              onClick={onConfirm}
              loading={isLoading}
              className="flex-1 sm:flex-none sm:min-w-[100px]"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
