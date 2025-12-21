import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient.js";
import { useNavigate } from "react-router-dom";
import MockInterviewView from "./MockInterviewView.jsx";
import {
  LogOut, User, BookOpen, Award, Settings, PlusCircle,
  BarChart2, Users, DollarSign, PlayCircle, CheckCircle,
  Clock, Home, Menu, X, ClipboardList, Mic
} from "lucide-react";

export default function ProfilePage({ defaultTab = "overview" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student"); 
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/login"); return; }
        setUser(user);
        setRole(user.user_metadata?.role || "student");
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4A1F]"></div>
      </div>
    );
  }
const userInitial = (user?.user_metadata?.fullName || user?.email || "U").charAt(0).toUpperCase();
const displayUserName = user?.user_metadata?.fullName || user?.email?.split("@")[0];
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row font-sans">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#111]">
        <div className="flex items-center gap-3">
          {/* Replace {user?.email?.charAt(0).toUpperCase()} with: */}
      <div className="w-8 h-8 rounded-full bg-[#FF4A1F] flex items-center justify-center font-bold text-black text-sm">
  {userInitial}
        </div>
          <span className="font-semibold">My Dashboard</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed md:relative z-50 w-full md:w-64 bg-[#111] border-r border-gray-800 p-6 flex flex-col justify-between h-[calc(100vh-65px)] md:h-screen transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} top-[65px] md:top-0`}>
        <div>
          <div className="hidden md:flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4A1F] to-[#FF8C69] flex items-center justify-center text-xl font-bold text-black shadow-lg shadow-orange-500/20">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold truncate w-32">{displayUserName}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 uppercase tracking-wider">{role}</span>
            </div>
          </div>

          <nav className="space-y-2 relative">
            <SidebarItem icon={Home} label="Home" active={false} onClick={() => navigate("/")} />
            <div className="my-4 h-px bg-gray-800/50" />

            {/* Overview - Shared */}
            <SidebarItem 
              icon={role === "creator" ? BarChart2 : User} 
              label="Overview" 
              active={activeTab === "overview"} 
              onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }} 
            />

            {role === "student" ? (
              <>
                {/* Student specific order */}
                <SidebarItem icon={Award} label="Achievements" active={activeTab === "achievements"} onClick={() => { setActiveTab("achievements"); setMobileMenuOpen(false); }} />
                <SidebarItem icon={ClipboardList} label="Assignments" active={activeTab === "assignments"} onClick={() => { setActiveTab("assignments"); setMobileMenuOpen(false); }} />
                <SidebarItem icon={Mic} label="Mock Interview" active={activeTab === "mock-interview"} onClick={() => { setActiveTab("mock-interview"); setMobileMenuOpen(false); }} />
                <SidebarItem icon={BookOpen} label="Courses" active={activeTab === "courses"} onClick={() => { setActiveTab("courses"); setMobileMenuOpen(false); }} />
              </>
            ) : (
              /* Creator specific */
              <SidebarItem icon={BookOpen} label="Manage Courses" active={activeTab === "courses"} onClick={() => { setActiveTab("courses"); setMobileMenuOpen(false); }} />
            )}

            <SidebarItem icon={Settings} label="Settings" active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }} />
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full mt-6">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen bg-[#0A0A0A]">
        <header className="mb-8">
          <h1 className="text-3xl font-bold capitalize">{activeTab.replace("-", " ")}</h1>
          <p className="text-gray-400 mt-1">Welcome back, <span className="text-white font-medium">{user?.user_metadata?.fullName || user?.email?.split("@")[0]}</span>.</p>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {role === "creator" ? (
              <CreatorView activeTab={activeTab} onCreateCourse={() => navigate("/courses-upload")} />
            ) : (
              <StudentView activeTab={activeTab}  user={user}/>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENTS - THESE MUST BE IN THE SAME FILE OR IMPORTED                */
/* -------------------------------------------------------------------------- */

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`relative flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors duration-200 ${active ? "text-[#FF4A1F] font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
      {active && (
        <motion.div layoutId="active-sidebar-bg" className="absolute inset-0 bg-[#FF4A1F]/10 border border-[#FF4A1F]/20 rounded-xl" initial={false} transition={{ type: "spring", stiffness: 350, damping: 30 }} />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <Icon size={20} />
        <span>{label}</span>
      </div>
    </button>
  );
}

function StudentView({ activeTab , user }) {
  if (activeTab === "overview") {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-[#FF4A1F] to-[#FF8C69] rounded-2xl p-8 text-black relative overflow-hidden shadow-lg shadow-orange-900/20">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Keep it up! 🔥</h2>
            <p className="font-medium opacity-80 mb-6 max-w-lg">You've completed 12 lessons this week. You're on a 3-day streak.</p>
            <button className="bg-black text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform">Resume Learning</button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "achievements") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AchievementCard title="Fast Starter" icon="🚀" unlocked />
        <AchievementCard title="Code Warrior" icon="⚔️" unlocked />
        <AchievementCard title="React Master" icon="⚛️" unlocked={false} />
      </div>
    );
  }

  if (activeTab === "assignments") {
    return <PlaceholderSection title="Assignments" icon={ClipboardList} />;
  }

  if (activeTab === "mock-interview") {
    return <MockInterviewView user={user} />;
  }

  if (activeTab === "courses") {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Your Learning Path</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CourseProgressCard title="Modern React" progress={65} lastAccessed="2 hours ago" image="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=500&q=60" large />
        </div>
      </div>
    );
  }

  return <PlaceholderSection title={activeTab} icon={Settings} />;
}

function CreatorView({ activeTab, onCreateCourse }) {
  if (activeTab === "overview") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={Users} title="Total Students" value="1,240" trend="+12%" />
        <StatCard icon={DollarSign} title="Total Revenue" value="$12,450" trend="+8.5%" />
        <StatCard icon={BarChart2} title="Avg. Rating" value="4.8" trend="+0.2" />
      </div>
    );
  }
  return <PlaceholderSection title={activeTab} icon={BookOpen} />;
}

/* HELPER COMPONENTS FOR UI */
function StatCard({ icon: Icon, title, value, trend }) {
  return (
    <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h4 className="text-3xl font-bold mt-2">{value}</h4>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg text-gray-400"><Icon size={24} /></div>
      </div>
    </div>
  );
}

function AchievementCard({ title, icon, unlocked }) {
  return (
    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 ${unlocked ? "bg-[#111] border-gray-800" : "bg-[#0A0A0A] border-gray-900 opacity-50 grayscale"}`}>
      <div className="text-3xl mb-1">{icon}</div>
      <span className="text-xs font-bold">{title}</span>
    </div>
  );
}

function CourseProgressCard({ title, progress, lastAccessed, image, large }) {
  return (
    <div className={`bg-[#111] rounded-2xl p-4 flex gap-4 border border-gray-800 items-center`}>
      <img src={image} alt={title} className="w-16 h-16 rounded-xl object-cover" />
      <div className="flex-1">
        <h4 className="font-bold">{title}</h4>
        <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2">
          <div className="bg-[#FF4A1F] h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function PlaceholderSection({ title, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-gray-500 border border-dashed border-gray-800 rounded-2xl bg-[#111]/50">
      <Icon size={48} className="mb-4 opacity-50" />
      <h3 className="text-lg font-semibold capitalize">{title} Content Coming Soon</h3>
      <p className="text-sm mt-2 max-w-xs text-center opacity-70">We're working on building the {title} module for your dashboard.</p>
    </div>
  );
}