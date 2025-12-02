export default function MobileNav({ open, onClose, isLoggedIn }) {
  return (
    <div
      className={`md:hidden absolute inset-x-0 top-full origin-top transform transition-all duration-200 bg-[#050505] border-t border-gray-800 ${
        open
          ? "scale-y-100 opacity-100"
          : "scale-y-0 opacity-0 pointer-events-none"
      }`}
    >
      <nav
        className="px-6 py-4 flex flex-col gap-3 text-sm text-gray-200"
        aria-label="Mobile Navigation"
      >
        <a
          href="#how-it-works"
          className="py-2 border-b border-gray-800/60"
          onClick={onClose}
        >
          Features
        </a>
        <a
          href="#courses"
          className="py-2 border-b border-gray-800/60"
          onClick={onClose}
        >
          Courses
        </a>
        <a
          href="#pricing"
          className="py-2 border-b border-gray-800/60"
          onClick={onClose}
        >
          Pricing
        </a>

        {/* CONDITIONAL AUTH LINKS FOR MOBILE */}
        {!isLoggedIn ? (
          <>
            <a
              href="/login"
              className="py-2 border-b border-gray-800/60"
              onClick={onClose}
            >
              Login
            </a>

            <div className="pt-3 flex flex-col gap-2">
              <a
                href="/signup"
                onClick={onClose}
                className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-full bg-[#FF4A1F] text-black font-semibold shadow"
              >
                Sign Up
              </a>
            </div>
          </>
        ) : (
          <div className="pt-3 flex flex-col gap-2">
            <a
              href="/profile"
              onClick={onClose}
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-full bg-[#FF4A1F] text-black font-semibold shadow"
            >
              Profile
            </a>
          </div>
        )}
      </nav>
    </div>
  );
}