import React from "react";

export interface SearchIconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

const SearchIcon: React.FC<SearchIconProps> = ({ className = "w-4 h-4", ...rest }) => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export default SearchIcon;
