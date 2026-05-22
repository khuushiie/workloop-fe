import React from "react";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  type?: "error" | "warning" | "success" | "info";
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  buttonText = "OK",
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    error: {
      icon: XCircle,
      iconColor: "text-red-500",
      buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      buttonColor: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    },
    info: {
      icon: Info,
      iconColor: "text-primary-500",
      buttonColor: "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500",
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-soft-hover w-full max-w-md mx-4">
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 ${config.iconColor}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-slate-900">{title}</h3>
          </div>

          {/* Message */}
          <div className="mb-6">
            {typeof message === "string" ? (
              <p className="text-sm text-slate-600">{message}</p>
            ) : (
              <div className="text-sm text-slate-600">{message}</div>
            )}
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.buttonColor}`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
