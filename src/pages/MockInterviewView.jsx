// MockInterviewView.jsx

import React, { useState, useEffect } from "react";
import { Mic, BookOpen, Code, Award, CheckCircle, Lock } from "lucide-react";
import CommunicationModule from "./CommunicationModule"; 
import { supabase } from "../supabaseClient";

const MockInterviewView = ({ user }) => {
  const [sessionStage, setSessionStage] = useState("dashboard");
  const [commScore, setCommScore] = useState(0);
  const [loading, setLoading] = useState(true); // Default to true

  // ✅ STEP 1: Define the Constant Variable here
  const PASSING_CUTOFF = 60; 

  useEffect(() => {
    const fetchProgress = async () => {
      // ✅ FIX: Select 'communication_score' directly (backend calculates it)
      const { data } = await supabase
        .from('mock_interview_sessions')
        .select('communication_score') 
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }) // Get the latest attempt
        .limit(1)
        .maybeSingle();

      if (data && data.communication_score) {
        setCommScore(data.communication_score);
      }
      setLoading(false);
    };
    if (user) fetchProgress();
  }, [user]);

  // ✅ STEP 2: Handle Completion Logic with the Constant
  const handleCommComplete = (finalScore) => {
    setCommScore(finalScore);
    setSessionStage("dashboard");

    // Optional: Add immediate feedback
    if (finalScore < PASSING_CUTOFF) {
      alert(`Your score: ${finalScore}%. You need ${PASSING_CUTOFF}% to unlock the Technical Round.`);
    } else {
      alert(`Success! Score: ${finalScore}%. Technical Round Unlocked.`);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Roadmap...</div>;

  // ✅ STEP 3: Pass the Cutoff to the Child if needed (Optional, but good practice)
  if (sessionStage === "communication") {
    return (
        <CommunicationModule 
            user={user} 
            onComplete={handleCommComplete} 
            onCancel={() => setSessionStage("dashboard")}
            passingCutoff={PASSING_CUTOFF} // Pass it down if you want to show it in the UI
        />
    );
  }

  // ✅ STEP 4: Use the Constant for Unlocking
  const isTechnicalUnlocked = commScore >= PASSING_CUTOFF;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Roadmap Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoundCard 
          step="1" title="Communication" icon={Mic} 
          score={commScore} 
          // Check against constant
          status={commScore >= PASSING_CUTOFF ? "completed" : "active"} 
        />
        <RoundCard 
          step="2" title="Technical MCQ" icon={BookOpen} 
          status={isTechnicalUnlocked ? "active" : "locked"} 
        />
        <RoundCard 
          step="3" title="Coding Test" icon={Code} 
          status="locked" 
        />
      </div>

      {/* Action Hero Section */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="p-5 bg-[#FF4A1F]/10 rounded-full text-[#FF4A1F]">
          <Award size={48} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold">
            {isTechnicalUnlocked ? "Round 2: Technical Assessment" : "Round 1: Communication Coach"}
          </h2>
          <p className="text-gray-400 mt-2 max-w-lg">
            {isTechnicalUnlocked 
              ? "Communication passed! You're now ready to prove your technical expertise." 
              // Use constant in text
              : `Complete the AI Voice round with ${PASSING_CUTOFF}% or higher to unlock the Technical test.`}
          </p>
        </div>
        <button 
          onClick={() => setSessionStage(isTechnicalUnlocked ? "technical" : "communication")}
          className="bg-[#FF4A1F] text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-lg shadow-orange-500/20"
        >
          {isTechnicalUnlocked ? "Start Technical Round" : "Begin Communication"}
        </button>
      </div>
    </div>
  );
};


// Sub-component for Roadmap Cards
const RoundCard = ({ step, title, icon: Icon, status, score }) => {
  const isLocked = status === "locked";
  const isDone = status === "completed";

  return (
    <div className={`p-6 rounded-2xl border transition-all ${isLocked ? "opacity-40 grayscale" : "bg-[#111] border-gray-800 shadow-md"}`}>
      <div className="flex justify-between items-center mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDone ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400"}`}>
          {isDone ? <CheckCircle size={20} /> : step}
        </div>
        {!isLocked && score > 0 && <span className="text-[#FF4A1F] font-mono text-xl">{score}%</span>}
      </div>
      <h4 className="font-bold text-lg flex items-center gap-2">
        <Icon size={20} className={isLocked ? "text-gray-500" : "text-[#FF4A1F]"} /> {title}
      </h4>
      <p className="text-xs text-gray-500 mt-2 uppercase tracking-tighter">
        {isLocked ? <span className="flex items-center gap-1"><Lock size={12}/> Locked</span> : "Round Active"}
      </p>
    </div>
  );
};

export default MockInterviewView;