const DowntimeIcon = () => {
  return (
    <div className="relative">
      <svg
        width="200"
        height="160"
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Cloud body - using explicit white fill */}
        <ellipse cx="100" cy="100" rx="60" ry="40" fill="white" />
        <ellipse cx="60" cy="105" rx="40" ry="30" fill="white" />
        <ellipse cx="140" cy="105" rx="40" ry="30" fill="white" />
        <ellipse cx="80" cy="85" rx="35" ry="28" fill="white" />
        <ellipse cx="120" cy="85" rx="35" ry="28" fill="white" />
        
        {/* Wrench icon - using explicit blue color */}
        <g transform="translate(75, 70)">
          <path
            d="M45 5C45 5 42 8 42 12C42 16 45 19 49 19C53 19 56 16 56 12C56 8 53 5 49 5"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M42 15L10 47"
            stroke="#3B82F6"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M5 52L15 42L20 47L10 57L5 52Z"
            fill="#3B82F6"
          />
        </g>

        {/* Gear icon - using explicit blue color */}
        <g transform="translate(100, 75)">
          <circle cx="20" cy="20" r="8" stroke="#60A5FA" strokeWidth="3" fill="none" />
          <circle cx="20" cy="20" r="3" fill="#60A5FA" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <rect
              key={i}
              x="18"
              y="6"
              width="4"
              height="8"
              rx="2"
              fill="#60A5FA"
              transform={`rotate(${angle} 20 20)`}
            />
          ))}
        </g>
      </svg>

      {/* Decorative dots */}
      <div className="absolute -top-4 -right-4 w-3 h-3 rounded-full bg-primary-500/40" />
      <div className="absolute top-8 -left-6 w-2 h-2 rounded-full bg-primary-400/50" />
      <div className="absolute -bottom-2 right-8 w-2.5 h-2.5 rounded-full bg-primary-500/30" />
    </div>
  );
};

export default DowntimeIcon;