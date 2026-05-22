
import React from "react";
import { cn } from "../../utils/cn";

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

export type BadgeVariant =
  | "green"
  | "blue"
  | "orange"
  | "yellow"
  | "purple"
  | "gray"
  | "red"
  | "emerald";

export type BadgeSize = "small" | "middle" | "large";

export interface BadgeProps {
  /**
   * Badge color variant
    @default "gray"
   */
  variant?: BadgeVariant;

  /**
   * Badge size
   * @default "middle"
   */
  size?: BadgeSize;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Dot style badge (online / status indicator)
   */
  dot?: boolean;

  /**
   * Optional icon (used in status badges)
   */
  icon?: React.ReactNode;

  
  //  Outline style (used in tables / role setup)
   
  outline?: boolean;

  /**
   * Badge content
   */
  children?: React.ReactNode;
}

/* ---------------------------------- */
/* Badge Component */
/* ---------------------------------- */

const Badge: React.FC<BadgeProps> = ({
  variant = "gray",
  size = "middle",
  className,
  dot = false,
  icon,
  outline = false,
  children,
}) => {
  /* ---------- Size mapping (like getAntdSize) ---------- */
  const getSizeClasses = (): string => {
    if (dot) {
      switch (size) {
        case "small":
          return "w-2 h-2 sm:w-2.5 sm:h-2.5";
        case "large":
          return "w-4 h-4 sm:w-5 sm:h-5";
        case "middle":
        default:
          return "w-3 h-3 sm:w-3.5 sm:h-3.5";
      }
    }

    switch (size) {
      case "small":
        return "px-2 py-0.5 text-[10px] sm:text-xs";
      case "large":
        return "px-3.5 py-1.5 text-xs sm:text-sm";
      case "middle":
      default:
        return "px-2.5 py-1 text-xs";
    }
  };

  /* ---------- Variant classes (like getVariantClasses) ---------- */
  const getVariantClasses = (): string => {
    const baseClasses = "font-medium rounded-full whitespace-nowrap";

    const variants: Record<BadgeVariant, string> = {
      green: "bg-green-100 text-green-800 border-green-200",
      blue: "bg-primary-100 text-primary-800 border-primary-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      red: "bg-red-100 text-red-800 border-red-200",
      gray: "bg-slate-100 text-slate-700 border-slate-200",
      emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };

    return cn(
      baseClasses,
      variants[variant],
      outline && "border bg-transparent"
    );
  };

  /* ---------- Dot variant mapping ---------- */
  const getDotClasses = (): string => {
    const dotVariants: Record<BadgeVariant, string> = {
      green: "bg-green-500",
      blue: "bg-primary-500",
      orange: "bg-orange-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      gray: "bg-slate-400",
      emerald: "bg-emerald-500",
    };

    return cn(
      "inline-block rounded-full animate-pulse flex-shrink-0",
      getSizeClasses(),
      dotVariants[variant]
    );
  };

  /* ---------- Dot Badge ---------- */
  if (dot) {
    return <span className={cn(getDotClasses(), className)} />;
  }

  /* ---------- Normal Badge ---------- */
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        getSizeClasses(),
        getVariantClasses(),
        className
      )}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
