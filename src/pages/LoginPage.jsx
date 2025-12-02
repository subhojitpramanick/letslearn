import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  GraduationCap,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import heroImage from "../assets/heroImage.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("student"); // 'student' | 'creator'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign In
      const {
        data: { user },
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      // 2. Update Role in Metadata to match selection
      // This ensures the ProfilePage loads the correct dashboard view.
      if (user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: role },
        });

        if (updateError) throw updateError;
      }

      // 3. Redirect
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Left: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-md w-full">
          <Link
            to="/"
            className="flex items-center gap-2 mb-10 text-gray-400 hover:text-white transition"
          >
            <div className="w-8 h-8 rounded-full bg-[#FF4A1F] flex items-center justify-center font-bold text-black text-sm">
              FB
            </div>
            <span className="font-semibold">Fox Bird</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2">Welcome back</h1>
            <p className="text-gray-400 mb-8">
              Choose your role and enter your details.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* ROLE SELECTOR */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    role === "student"
                      ? "border-[#FF4A1F] bg-[#FF4A1F]/10 text-white"
                      : "border-gray-800 bg-[#111] text-gray-400 hover:border-gray-700 hover:bg-[#161616]"
                  }`}
                >
                  <GraduationCap size={28} className="mb-2" />
                  <span className="font-semibold text-sm">Student</span>
                  {role === "student" && (
                    <div className="absolute top-2 right-2 text-[#FF4A1F]">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("creator")}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    role === "creator"
                      ? "border-[#FF4A1F] bg-[#FF4A1F]/10 text-white"
                      : "border-gray-800 bg-[#111] text-gray-400 hover:border-gray-700 hover:bg-[#161616]"
                  }`}
                >
                  <Briefcase size={28} className="mb-2" />
                  <span className="font-semibold text-sm">Creator</span>
                  {role === "creator" && (
                    <div className="absolute top-2 right-2 text-[#FF4A1F]">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </button>
              </div>

              {/* EMAIL INPUT */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#111] border border-gray-800 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-[#FF4A1F] transition-colors placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#111] border border-gray-800 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-[#FF4A1F] transition-colors placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="rounded border-gray-800 bg-[#111] text-[#FF4A1F] focus:ring-[#FF4A1F]"
                  />
                  <span className="text-gray-400 group-hover:text-gray-300">
                    Remember me
                  </span>
                </label>
                <a href="#" className="text-[#FF4A1F] hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF4A1F] hover:bg-[#E03E13] text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign In as <span className="capitalize">{role}</span>{" "}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-white font-medium hover:text-[#FF4A1F] transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Visual Side (Hidden on Mobile) */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-[#111]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10" />
        <img
          src={heroImage}
          alt="Login Visual"
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute bottom-12 left-12 z-20 max-w-lg">
          <h2 className="text-3xl font-bold mb-4">
            Master new skills, faster.
          </h2>
          <p className="text-gray-400 text-lg">
            Join a community of developers building the future. Get instant AI
            feedback and ship real projects.
          </p>
        </div>
      </div>
    </div>
  );
}
