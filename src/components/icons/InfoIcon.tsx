import React from "react";

export interface InfoIconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ className = "w-4 h-4", ...rest }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...rest}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default InfoIcon;
