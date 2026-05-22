import React, { useState, useRef, useId, useEffect } from "react";
import { createPortal } from "react-dom";

interface ImprovedTooltipProps {
  label: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  tooltipClassName?: string;
  delay?: number;
  closeOnScroll?: boolean; // New flag
}

const calculatePosition = (
  rect: DOMRect,
  side: "top" | "bottom" | "left" | "right"
) => {
  const spacing = 8;
  let top = 0;
  let left = 0;

  switch (side) {
    case "top":
      top = rect.top - spacing;
      left = rect.left + rect.width / 2;
      break;
    case "bottom":
      top = rect.bottom + spacing;
      left = rect.left + rect.width / 2;
      break;
    case "left":
      top = rect.top + rect.height / 2;
      left = rect.left - spacing;
      break;
    case "right":
      top = rect.top + rect.height / 2;
      left = rect.right + spacing;
      break;
  }

  return { top, left };
};

const getTransformClass = (side: "top" | "bottom" | "left" | "right") => {
  switch (side) {
    case "top": return "-translate-x-1/2 -translate-y-full";
    case "bottom": return "-translate-x-1/2";
    case "left": return "-translate-x-full -translate-y-1/2";
    case "right": return "-translate-y-1/2";
    default: return "-translate-x-1/2 -translate-y-full";
  }
};

const SimpleTooltip: React.FC<ImprovedTooltipProps> = ({
  label,
  children,
  side = "bottom",
  className,
  tooltipClassName,
  delay = 0,
  closeOnScroll = true, // Default to true for backwards compatibility
}) => {
  const [tooltipState, setTooltipState] = useState<{
    isOpen: boolean;
    position: { top: number; left: number };
  }>({ isOpen: false, position: { top: 0, left: 0 } });

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const tooltipId = useId();

  // --- Handlers ---
  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const position = calculatePosition(rect, side);
        // Set position and isOpen together to avoid the animation glitch
        setTooltipState({ isOpen: true, position });
      }
    }, delay);
  };

  const closeTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTooltipState((prev) => ({ ...prev, isOpen: false }));
  };
  const handleMouseLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as Node;

    // If moving inside trigger OR tooltip → don't close
    if (
      triggerRef.current?.contains(relatedTarget) ||
      tooltipRef.current?.contains(relatedTarget)
    ) {
      return;
    }

    closeTooltip();
  };
  const handleBlur = closeTooltip;

  const handleFocus = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const position = calculatePosition(rect, side);
      setTooltipState({ isOpen: true, position });
    }
  };

  // Effect to handle scroll-to-close functionality
  useEffect(() => {
    if (!tooltipState.isOpen || !closeOnScroll) return;

    const handleScroll = () => {
      closeTooltip();
    };

    // Use capture: true to detect scroll on any element, not just window
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("touchmove", handleScroll);
    };
  }, [tooltipState.isOpen, closeOnScroll]);

  return (
    <div
      ref={triggerRef}
      className={`block relative ${className || ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-describedby={tooltipState.isOpen ? tooltipId : undefined}
    >
      {children}

      {tooltipState.isOpen &&
        createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="tooltip"
            className={`fixed transform ${getTransformClass(side)}
              z-[9999999]
              px-3 py-2 text-xs rounded-lg shadow-2xl
              bg-white text-slate-900
              max-w-sm text-left break-words
              border border-slate-300 whitespace-normal
              animate-tooltip-fade-in
             
              ${tooltipClassName || ""}`}
            style={{
              top: tooltipState.position.top,
              left: tooltipState.position.left,
            }}
          >
            {label}
          </span>,
          document.body
        )}
    </div>
  );
};

export default SimpleTooltip;
