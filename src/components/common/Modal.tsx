import React, { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: ReactNode;
  size?:
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "full";
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  footer?: ReactNode;
  loading?: boolean;
  zIndex?: number;
  disableBodyScroll?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closable = true,
  maskClosable = true,
  centered = true,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  footerClassName = "",
  footer,
  loading = false,
  zIndex = 50,
  disableBodyScroll = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closable, onClose]);

  // Handle mask click
  const handleMaskClick = (e: React.MouseEvent) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    "8xl": "max-w-8xl",
    full: "max-w-full m-4",
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex no-space ${centered
        ? "items-center justify-center"
        : "items-start justify-center pt-16"
        } p-4 z-${zIndex}`}
      onClick={handleMaskClick}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-soft-hover w-full ${sizeClasses[size]} 
          max-h-[90vh] flex flex-col
          ${className}
          ${loading ? "pointer-events-none" : ""}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="text-slate-600">Loading...</span>
            </div>
          </div>
        )}

        {/* Header */}
        {(title || closable) && (
          <div
            className={`flex items-center justify-between p-3 border-b border-slate-200 ${headerClassName}`}
          >
            {title && (
              <div className="flex-1 min-w-0 pr-4">
                {typeof title === "string" ? (
                  <h2 className="text-xl font-semibold text-gray-900 truncate mb-0">
                    {title}
                  </h2>
                ) : (
                  title
                )}
              </div>
            )}
            {closable && (
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`flex-1 ${disableBodyScroll ? "overflow-hidden" : "overflow-y-auto"} p-6 ${bodyClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`p-6 border-t border-slate-200 ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal Footer component for consistent styling
export const ModalFooter: React.FC<{
  children: ReactNode;
  className?: string;
  justify?: "start" | "center" | "end" | "between";
}> = ({ children, className = "", justify = "end" }) => {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={`flex items-center gap-3 ${justifyClasses[justify]} ${className}`}
    >
      {children}
    </div>
  );
};

// Modal Buttons for consistency
export const ModalButton: React.FC<{
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  form?: string;
}> = ({
  children,
  variant = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  form,
}) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantClasses = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-400",
      secondary:
        "bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-500 disabled:bg-slate-100",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400",
      ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        form={form}
        className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${className}
      `}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        )}
        {children}
      </button>
    );
  };

export default Modal;
