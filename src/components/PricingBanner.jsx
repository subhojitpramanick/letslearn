export default function PricingBanner() {
  return (
    <div className="w-full flex items-center justify-center py-3 bg-[#070707] text-sm">
      <a
        href="/pricing"
        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-gradient-to-r from-[#FF4A1F] to-[#FF6B3A] text-black font-medium shadow-md hover:opacity-95 transition"
      >
        <span>Explore premium coding features and unlock your potential.</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.91797 7H11.0846"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 2.9165L11.0833 6.99984L7 11.0832"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}
