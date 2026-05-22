import { useLayoutEffect, useRef, useState } from "react";
import SimpleTooltip from "./SimpleTooltip";

type Side = "top" | "bottom" | "left" | "right";

interface OverflowTooltipProps {
  children: React.ReactNode;
  text?: string; // Optional text override for tooltip if children is complex
  className?: string;
  rootClassName?: string;
  side?: Side;
  tooltipClassName?: string;
  delay?: number;
  closeOnScroll?: boolean;
  align?: "left" | "center" | "right";
}

const OverflowTooltip = ({
  children,
  text,
  className,
  rootClassName = "w-full",
  side = "top",
  tooltipClassName,
  delay,
  closeOnScroll,
  align = "left",
}: OverflowTooltipProps) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textElementRef = useRef<HTMLDivElement>(null);

  const checkOverflow = () => {
    const el = textElementRef.current;
    if (el) {
      setIsOverflowing(el.scrollWidth > el.clientWidth);
    }
  };

  useLayoutEffect(() => {
    setIsOverflowing(false);
  }, [children]);

  const tooltipLabel = text || children;

  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  const content = (
    <div
      ref={textElementRef}
      onMouseEnter={checkOverflow}
      className={`block w-full truncate ${alignClass} ${className ?? ""}`}
    >
      {children}
    </div>
  );

  const plainClass = `${rootClassName} relative block ${alignClass}`.trim();

  return isOverflowing ? (
    <SimpleTooltip
      label={tooltipLabel}
      side={side}
      className={`${rootClassName} ${alignClass}`}
      tooltipClassName={tooltipClassName}
      delay={delay}
      closeOnScroll={closeOnScroll}
    >
      {content}
    </SimpleTooltip>
  ) : (
    <div className={plainClass} onMouseEnter={checkOverflow}>
      {content}
    </div>
  );
};

export default OverflowTooltip;
