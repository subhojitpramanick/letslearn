import React from "react";

const RolePanelSelector = ({ value, onChange, className = "" }) => {
  const isSelected = (role) => value === role;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {/* Student / Learner Panel */}
      <button
        type="button"
        onClick={() => onChange("student")}
        className={`group relative text-left p-4 rounded-xl border transition-all duration-200 overflow-hidden
        ${
          isSelected("student")
            ? "border-[#FF4A1F] bg-[#101010] shadow-[0_0_30px_rgba(255,74,31,0.35)] scale-[1.01]"
            : "border-[#262626] bg-[#080808] hover:border-[#3a3a3a] hover:bg-[#0b0b0b] hover:scale-[1.01]"
        }`}
      >
        {/* Accent glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 w-28 h-28 rounded-full bg-[#FF4A1F]/10 blur-2xl opacity-70" />

        {isSelected("student") && (
          <span className="absolute right-3 top-3 text-[10px] px-2 py-0.5 rounded-full bg-[#FF4A1F] text-black font-semibold">
            Selected
          </span>
        )}

        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center border border-[#2b2b2b] group-hover:border-[#FF4A1F]/60 transition-colors">
            {/* book / code icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="5"
                width="10"
                height="14"
                rx="2"
                stroke="#FF4A1F"
                strokeWidth="1.4"
              />
              <path
                d="M9 7h3M7 10h5M7 13h4"
                stroke="#FF4A1F"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M16 7l3 2v6l-3 2"
                stroke="#FF4A1F"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
              Student mode
            </p>
            <h3 className="text-sm font-semibold text-white">
              Learner / Developer
            </h3>
          </div>
        </div>

        {/* Short tags only */}
        <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 relative z-10">
          <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-[#252525]">
            Practice & projects
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-[#252525]">
            Progress tracking
          </span>
        </div>
      </button>

      {/* Creator Panel */}
      <button
        type="button"
        onClick={() => onChange("creator")}
        className={`group relative text-left p-4 rounded-xl border transition-all duration-200 overflow-hidden
        ${
          isSelected("creator")
            ? "border-[#FF4A1F] bg-[#101010] shadow-[0_0_30px_rgba(255,74,31,0.35)] scale-[1.01]"
            : "border-[#262626] bg-[#080808] hover:border-[#3a3a3a] hover:bg-[#0b0b0b] hover:scale-[1.01]"
        }`}
      >
        {/* Accent glow */}
        <div className="pointer-events-none absolute -left-10 -top-10 w-28 h-28 rounded-full bg-[#FF4A1F]/10 blur-2xl opacity-70" />

        {isSelected("creator") && (
          <span className="absolute right-3 top-3 text-[10px] px-2 py-0.5 rounded-full bg-[#FF4A1F] text-black font-semibold">
            Selected
          </span>
        )}

        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center border border-[#2b2b2b] group-hover:border-[#FF4A1F]/60 transition-colors">
            {/* creator / dashboard icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="5"
                width="16"
                height="12"
                rx="2"
                stroke="#FF4A1F"
                strokeWidth="1.4"
              />
              <path
                d="M4 9h16"
                stroke="#FF4A1F"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M8 13h3M13 13h3"
                stroke="#FF4A1F"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
              Creator mode
            </p>
            <h3 className="text-sm font-semibold text-white">
              Creator / Instructor
            </h3>
          </div>
        </div>

        {/* Short tags only */}
        <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 relative z-10">
          <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-[#252525]">
            Publish courses
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-[#252525]">
            Cohorts & insights
          </span>
        </div>
      </button>
    </div>
  );
};

export default RolePanelSelector;
