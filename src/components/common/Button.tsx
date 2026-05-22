import React from "react";
import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd/lib/button";
import { cn } from "../../utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "link"
  | "text"
  | "default"
  | "dashed"
  | "success"
  | "warning";

export type ButtonSize = "small" | "middle" | "large";

export interface ButtonProps extends Omit<AntButtonProps, "type" | "size"> {
  appearance?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

const ANTD_TYPE_MAP: Record<ButtonVariant, AntButtonProps["type"]> = {
  primary: "primary",
  secondary: "default",
  danger: "primary",
  ghost: "default",
  link: "link",
  text: "text",
  dashed: "dashed",
  default: "default",
  success: "primary",
  warning: "primary",
};

const BASE = "transition-all duration-200 font-semibold";
const PAD = "!px-5 !py-4 !rounded-lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: cn(
    BASE, PAD,
    "!bg-gradient-to-r !from-primary-600 !to-secondary-600",
    "hover:!shadow-brand-button hover:!-translate-y-0.5",
    "!border-0 !text-white",
    "focus-visible:!ring-2 focus-visible:!ring-primary-500 focus-visible:!ring-offset-2",
  ),
  secondary: cn(
    BASE, PAD,
    "!bg-white hover:!bg-slate-50",
    "!border !border-slate-200 hover:!border-slate-300",
    "!text-slate-700 hover:!text-slate-900",
    "focus-visible:!ring-2 focus-visible:!ring-primary-500 focus-visible:!ring-offset-2",
  ),
  danger: cn(
    BASE, PAD,
    "!bg-red-600 hover:!bg-red-700 active:!bg-red-800",
    "!border-red-600 hover:!border-red-700",
    "!text-white",
    "focus-visible:!ring-2 focus-visible:!ring-red-500 focus-visible:!ring-offset-2",
  ),
  success: cn(
    BASE, PAD,
    "!bg-emerald-600 hover:!bg-emerald-700 active:!bg-emerald-800",
    "!border-emerald-600 hover:!border-emerald-700",
    "!text-white",
    "focus-visible:!ring-2 focus-visible:!ring-emerald-500 focus-visible:!ring-offset-2",
  ),
  warning: cn(
    BASE, PAD,
    "!bg-amber-500 hover:!bg-amber-600 active:!bg-amber-700",
    "!border-amber-500 hover:!border-amber-600",
    "!text-white",
    "focus-visible:!ring-2 focus-visible:!ring-amber-500 focus-visible:!ring-offset-2",
  ),
  ghost: cn(
    BASE, PAD,
    "hover:!bg-primary-50 active:!bg-primary-100",
    "!text-primary-600 hover:!text-primary-700",
    "focus-visible:!ring-2 focus-visible:!ring-primary-500 focus-visible:!ring-offset-2",
  ),
  link: cn(BASE, "!text-primary-600 hover:!text-primary-700"),
  text: cn(BASE, PAD, "hover:!bg-slate-100"),
  dashed: cn(BASE, PAD, "!border-dashed !border-slate-300 hover:!border-primary-400 hover:!text-primary-600"),
  default: cn(
    BASE, PAD,
    "!bg-white hover:!bg-slate-50",
    "!border !border-slate-200 hover:!border-slate-300",
    "!text-slate-700",
  ),
};

const Button: React.FC<ButtonProps> = ({
  appearance = "primary",
  size = "middle",
  className,
  children,
  ...rest
}) => {
  return (
    <AntButton
      type={ANTD_TYPE_MAP[appearance]}
      size={size}
      className={cn(
        VARIANT_CLASSES[appearance],
        (rest.disabled || rest.loading) && "!opacity-50 !cursor-not-allowed !pointer-events-none",
        className,
      )}
      {...rest}
    >
      {children}
    </AntButton>
  );
};

export default Button;
