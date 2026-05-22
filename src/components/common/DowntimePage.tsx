import React from "react";
import DowntimeIcon from "../../icons/downtimeicon";

const DowntimePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e8f4fc] to-[#f0f7fc]">
      <div className="text-center px-4">
        {/* Cloud Icon with Tools - FIRST */}
        <div className="relative inline-block mb-6">
          {/* Decorative dots */}
          <div className="absolute -top-3 left-1/3 w-1.5 h-1.5 bg-primary-300/60 rounded-full"></div>
          <div className="absolute top-2 -right-2 w-1 h-1 bg-primary-400/50 rounded-full"></div>
          <div className="absolute bottom-4 -right-1 w-1.5 h-1.5 bg-primary-300/40 rounded-full"></div>
          
          {/* Cloud shape */}
         <DowntimeIcon />
        </div>

        {/* Status Badge - BELOW the icon */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-soft border border-slate-100">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-slate-600 font-medium">Maintenance in progress</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-5">
          We'll be back soon!
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-base max-w-sm mx-auto mb-8 leading-relaxed">
          Our website is currently undergoing scheduled maintenance. 
          We're working hard to improve your experience.
        </p>

        {/* Thank you message */}
        <p className="text-slate-400 text-sm">
          Thank you for your patience and understanding.
        </p>
      </div>
    </div>
  );
};

export default DowntimePage;
