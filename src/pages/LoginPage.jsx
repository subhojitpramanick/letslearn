import React, { useState } from "react";
import RotatingText from "../components/texts/RotatingText";
import ClickSpark from "@/components/ClickSpark";
import RolePanelSelector from "../components/auth/RolePanelSelector"; // <- update path if needed

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student"); // "student" | "creator"

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
            Welcome back to
            <div className="text-5xl sm:text-6xl mt-2">
              <RotatingText
                texts={["Shipping", "Debugging", "Building", "Winning offers"]}
                mainClassName="px-3 bg-orange-500 text-white overflow-hidden py-1 justify-center rounded-lg inline-flex"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2200}
              />
            </div>
          </h2>

          <p className="mt-6 text-gray-400 max-w-md leading-relaxed">
            Pick up exactly where you left off. Keep shipping projects, refining
            your skills, and preparing for real-world interviews – all in one
            workspace.
          </p>

          <div className="mt-10 space-y-4">
            <FeaturePoint label="Resume sessions with saved code states" />
            <FeaturePoint label="Track progress across all courses" />
            <FeaturePoint label="Instant replays of AI suggestions" />
            <FeaturePoint label="Stay synced across devices" />
          </div>
        </div>

        <p className="text-sm text-gray-600">
          © 2025 Fox Bird — All rights reserved.
        </p>
      </div>

      {/* RIGHT — LOGIN FORM */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 lg:p-14 relative z-10">
        <div className="w-full max-w-md bg-[#0C0C0C]/70 backdrop-blur-xl border border-gray-800 p-10 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold">Log in to Fox Bird</h2>
          <p className="text-gray-400 mt-1">
            New here?{" "}
            <a
              href="/signup"
              className="text-[#FF4A1F] font-semibold hover:underline"
            >
              Create an account
            </a>
          </p>

          {/* Role panels: Creator vs Student */}
          <div className="mt-6">
            <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">
              Continue as
            </p>
            <RolePanelSelector value={role} onChange={setRole} />
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              // hook up to auth here, include `role`
              // e.g. login({ email, password, role })
            }}
          >
            {/* Email */}
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="you@example.com"
            />

            {/* Password with toggle */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••••"
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4A1F]/50 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500 hover:text-gray-300"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-black border-gray-500"
                />
                <span>Remember me</span>
              </label>

              <a
                href="/forgot-password"
                className="text-[#FF4A1F] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Login button with ClickSpark wrapper */}
            <ClickSpark>
              <button
                type="submit"
                className="w-full mt-2 py-3 text-black font-semibold text-lg rounded-xl bg-[#FF4A1F] hover:brightness-95 transition-all shadow-[0_0_25px_-6px_#ff4a1f]"
              >
                {role === "creator" ? "Log in as Creator" : "Log in as Student"}
              </button>
            </ClickSpark>

            <p className="text-xs text-gray-500 mt-3">
              Tip: you can also log in with a one-tap provider below if your
              account is already connected.
            </p>
          </form>

          <Divider />

          {/* Social login */}
          <button className="w-full flex items-center justify-center gap-3 py-3 bg-[#111] hover:bg-[#171717] rounded-xl border border-gray-800 transition-all">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google
          </button>

          <button className="w-full flex items-center justify-center gap-3 mt-3 py-3 bg-[#111] hover:bg-[#171717] rounded-xl border border-gray-800 transition-all">
            <img
              src="https://www.svgrepo.com/show/343674/github.svg"
              className="w-5 h-5 invert"
              alt="GitHub"
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
