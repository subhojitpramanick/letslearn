import React, { useState } from "react";
import RotatingText from "../components/texts/RotatingText";
import ClickSpark from "@/components/ClickSpark";
import RolePanelSelector from "../components/auth/RolePanelSelector"; // <- update path if needed

/**
 * FoxBird — Signup Page
 * Full-screen, professional, dark-themed onboarding page.
 * TailwindCSS required.
 */

export default function SignUpPage() {
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // "student" | "creator"

  const passwordStrength = () => {
    if (!password) return "empty";
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  };

  // (optional) handle submit later – now it's just UI
  const handleSubmit = (e) => {
    e.preventDefault();
    // send role + form fields to backend when ready
    // e.g. { fullName, email, password, role, ... }
  };

  return (
    <div className="min-h-screen w-full bg-[#060606] text-white relative overflow-hidden flex">
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between p-14 w-2/5 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF4A1F] flex items-center justify-center font-extrabold text-black text-xl shadow-lg">
              FB
            </div>
            <h1 className="text-xl font-bold tracking-wide">Fox Bird</h1>
          </div>

          <h2 className="mt-14 text-4xl font-extrabold leading-tight">
            Welcome to the future of
            <div className="text-6xl">
              <RotatingText
                texts={["Creativity", "Innovations", "Tech", "Engineering !!"]}
                mainClassName="px-2 sm:px-2 md:px-3 bg-orange-500 text-white overflow-hidden py-0.5 sm:py-1 md:py-1.5 justify-center rounded-lg inline-flex"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </div>
          </h2>

          <p className="mt-6 text-gray-400 max-w-md leading-relaxed">
            Join thousands of developers leveling up with hands-on projects,
            instant AI feedback, in-browser coding, and real-world challenges.
          </p>

          <div className="mt-10 space-y-4">
            <FeaturePoint label="Real-time AI code reviews" />
            <FeaturePoint label="Interactive coding playground" />
            <FeaturePoint label="Full-stack guided projects" />
            <FeaturePoint label="Job-ready interview prep" />
          </div>
        </div>

        <p className="text-sm text-gray-600">
          © 2025 Fox Bird — All rights reserved.
        </p>
      </div>

      {/* RIGHT — SIGNUP FORM */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 lg:p-14 relative z-10">
        <div className="w-full max-w-md bg-[#0C0C0C]/70 backdrop-blur-xl border border-gray-800 p-10 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold">Create your account</h2>
          <p className="text-gray-400 mt-1">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#FF4A1F] font-semibold hover:underline"
            >
              Login
            </a>
          </p>

          {/* Role panels: Creator vs Student */}
          <div className="mt-6">
            <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">
              Choose your panel
            </p>
            <RolePanelSelector value={role} onChange={setRole} />
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <Input label="Full Name" id="name" placeholder="John Carter" />

            {/* Email */}
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="you@example.com"
            />

            {/* Role (extra context about user profile) */}
            <Select
              label="You are signing up as"
              id="profile-role"
              options={[
                "Student",
                "Working Professional",
                "Self-taught Learner",
              ]}
            />

            {/* Experience */}
            <Select
              label="Experience Level"
              id="experience"
              options={["Beginner", "Intermediate", "Advanced"]}
            />

            {/* Password */}
            <div>
              <Input
                label="Password"
                id="password"
                type="password"
                placeholder="•••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />

              <PasswordStrengthIndicator strength={passwordStrength()} />
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              placeholder="•••••••••"
            />

            {/* Social GitHub (Optional) */}
            <Input
              label="GitHub Profile (optional)"
              id="github"
              placeholder="https://github.com/username"
            />

            {/* Terms */}
            <div className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded bg-black border-gray-500"
              />
              <label htmlFor="terms" className="text-gray-400 leading-snug">
                I agree to the{" "}
                <a href="/terms" className="text-[#FF4A1F] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-[#FF4A1F] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button className="w-full mt-4 py-3 text-black font-semibold text-lg rounded-xl bg-[#FF4A1F] hover:brightness-95 transition-all shadow-[0_0_25px_-6px_#ff4a1f]">
              {role === "creator"
                ? "Create Creator Account"
                : "Create Student Account"}
            </button>
          </form>

          <Divider />

          {/* Social signup */}
          <button className="w-full flex items-center justify-center gap-3 py-3 bg-[#111] hover:bg-[#171717] rounded-xl border border-gray-800 transition-all">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="Google logo"
            />
            Continue with Google
          </button>

          <button className="w-full flex items-center justify-center gap-3 mt-3 py-3 bg-[#111] hover:bg-[#171717] rounded-xl border border-gray-800 transition-all">
            <img
              src="https://www.svgrepo.com/show/343674/github.svg"
              className="w-5 h-5 invert"
              alt="GitHub logo"
            />
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------- Sub Components --------------------- */

function Input({ label, id, placeholder, type = "text", onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4A1F]/50"
      />
    </div>
  );
}

function Select({ label, id, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label}
      </label>
      <select
        id={id}
        className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF4A1F]/50"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function FeaturePoint({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2.5 h-2.5 rounded-full bg-[#FF4A1F] shadow-[0_0_10px_#ff4a1f]" />
      <p className="text-gray-300">{label}</p>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center my-6">
      <div className="w-full bg-gray-700 h-px" />
      <span className="px-4 text-xs uppercase text-gray-500 tracking-wider">
        OR
      </span>
      <div className="w-full bg-gray-700 h-px" />
    </div>
  );
}

function PasswordStrengthIndicator({ strength }) {
  const map = {
    empty: { label: "", color: "bg-gray-700" },
    weak: { label: "Weak", color: "bg-red-500" },
    medium: { label: "Moderate", color: "bg-yellow-500" },
    strong: { label: "Strong", color: "bg-green-500" },
  };

  const info = map[strength];

  return (
    <div className="mt-2">
      {info.label && (
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-20 h-1 rounded-full ${info.color}`} />
          <span className="text-gray-400">{info.label}</span>
        </div>
      )}
    </div>
  );
}
