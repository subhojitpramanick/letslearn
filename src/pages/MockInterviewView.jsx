import React, { useState, useEffect } from "react";
import { Mic, BookOpen, Code, Award, CheckCircle, Lock, Trophy, Play, Clock, AlertCircle } from "lucide-react";
import CommunicationModule from "./CommunicationModule"; 
import TechnicalModule from "./TechnicalModule"; 
import CodingModule from "./CodingModule"; 
import { supabase } from "../supabaseClient";

const MockInterviewView = ({ user }) => {
  // --- STATE MANAGEMENT ---
  const [activeSessionId, setActiveSessionId] = useState(null); // ID of current run
  const [sessionStage, setSessionStage] = useState("intro"); // intro, communication, technical, coding, report
  
  // Active Session Scores (Reset to 0/null on every new session)
  const [commScore, setCommScore] = useState(0);
  const [techPassed, setTechPassed] = useState(false);
  const [codingScore, setCodingScore] = useState(null);
  
  // History Data
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Constants
  const COMM_CUTOFF = 60; 

  // --- 1. FETCH HISTORY ONLY (Do not resume) ---
  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('mock_interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setHistory(data);
      setLoadingHistory(false);
    };
    if (user) fetchHistory();
  }, [user, activeSessionId]); // Refetch history when a new session is created/finished

  // --- 2. START NEW SESSION LOGIC ---
  const handleStartNewSession = async () => {
    setLoadingHistory(true);
    try {
      // Create a fresh row in DB
      const { data, error } = await supabase
        .from('mock_interview_sessions')
        .insert([{
          user_id: user.id,
          user_email: user.email,
          status: 'in_progress',
          communication_score: 0,
          technical_score: 0,
          coding_score: null, 
          technical_passed: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Reset Local State for the New Session
      setActiveSessionId(data.id);
      setCommScore(0);
      setTechPassed(false);
      setCodingScore(null);
      
      // Start at Dashboard View of the new session
      setSessionStage("dashboard");
    } catch (err) {
      console.error("Error starting session:", err);
      alert("Could not start new session.");
    } finally {
      setLoadingHistory(false);
    }
  };

  // --- 3. COMPLETION HANDLERS (Update DB & Local State) ---
  
  const handleCommComplete = async (score) => {
    // Update DB
    await supabase.from('mock_interview_sessions')
      .update({ communication_score: score })
      .eq('id', activeSessionId);

    setCommScore(score);
    setSessionStage("dashboard");
  };

  const handleTechComplete = async (passed) => {
    // Update DB
    await supabase.from('mock_interview_sessions')
      .update({ technical_passed: passed }) // Ensure you added this column or map it
      .eq('id', activeSessionId);

    setTechPassed(passed);
    setSessionStage("dashboard");
  };

  const handleCodingComplete = async (score) => {
    // Update DB & Mark Complete
    await supabase.from('mock_interview_sessions')
      .update({ 
        coding_score: score, 
        status: 'completed' 
      })
      .eq('id', activeSessionId);

    setCodingScore(score);
    setSessionStage("dashboard");
  };

  // --- 4. EXIT / TERMINATE SESSION ---
  // If user clicks "Exit", we just clear the active ID. 
  // The row remains in DB as 'in_progress' (effectively terminated/abandoned).
  const handleExit = () => {
    if(confirm("Are you sure? This session will be terminated and saved as a previous record.")) {
      setActiveSessionId(null);
      setSessionStage("intro");
    }
  };

  // --- RENDER: MODULES ---
  // Pass the activeSessionId so modules know where to save data if needed
  if (sessionStage === "communication") {
    return <CommunicationModule user={user} sessionId={activeSessionId} onComplete={handleCommComplete} onCancel={() => setSessionStage("dashboard")} />;
  }
  if (sessionStage === "technical") {
    return <TechnicalModule user={user} sessionId={activeSessionId} onComplete={handleTechComplete} onCancel={() => setSessionStage("dashboard")} />;
  }
  if (sessionStage === "coding") {
    return <CodingModule user={user} sessionId={activeSessionId} onComplete={handleCodingComplete} onCancel={() => setSessionStage("dashboard")} />;
  }

  // --- LOGIC: UNLOCKS ---
  const isTechnicalUnlocked = commScore >= COMM_CUTOFF;
  const isCodingUnlocked = techPassed;
  const isAllComplete = codingScore !== null;

  // --- RENDER: MAIN VIEW ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen">
      
      {/* 1. INTRO VIEW (HISTORY + START BUTTON) */}
      {!activeSessionId && (
        <div className="space-y-8">
           {/* Hero */}
           <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-xl">
              <div className="p-4 bg-[#FF4A1F]/10 rounded-full text-[#FF4A1F] mb-4">
                <Trophy size={48} />
              </div>
              <h1 className="text-3xl font-bold text-white">Mock Interview Suite</h1>
              <p className="text-gray-400 mt-2 max-w-lg mb-8">
                Test your skills in a real-world environment. Complete all 3 rounds (Communication, Technical, Coding) to get your certification score.
              </p>
              <button 
                onClick={handleStartNewSession}
                className="bg-[#FF4A1F] text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <Play size={20} fill="black" /> Start New Interview
              </button>
           </div>

           {/* History Table */}
           <div className="bg-[#0A0A0A] rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock className="text-gray-500" /> Previous Records
              </h3>
              
              {loadingHistory ? (
                <div className="text-center text-gray-500 py-10">Loading records...</div>
              ) : history.length === 0 ? (
                <div className="text-center text-gray-600 py-10 italic">No previous interview attempts found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800 text-sm uppercase tracking-wider">
                        <th className="pb-4">Date</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4 text-center">Comm.</th>
                        <th className="pb-4 text-center">Tech</th>
                        <th className="pb-4 text-center">Coding</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {history.map((session) => (
                        <tr key={session.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                          <td className="py-4 text-sm font-mono text-gray-400">
                            {new Date(session.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              session.status === 'completed' ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'
                            }`}>
                              {session.status === 'completed' ? 'COMPLETED' : 'TERMINATED'}
                            </span>
                          </td>
                          <td className="py-4 text-center">{session.communication_score || '-'}%</td>
                          <td className="py-4 text-center">
                            {session.technical_passed ? <CheckCircle size={16} className="mx-auto text-green-500"/> : <span className="text-gray-600">-</span>}
                          </td>
                          <td className="py-4 text-center">{session.coding_score !== null ? session.coding_score + '%' : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
           </div>
        </div>
      )}

      {/* 2. ACTIVE SESSION VIEW (LOCKED/UNLOCKED STAGES) */}
      {activeSessionId && (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"/> Live Session
            </h2>
            <button onClick={handleExit} className="text-xs text-red-500 hover:underline">
              Terminate Session
            </button>
          </div>

          {/* Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <RoundCard 
              step="1" title="Communication" icon={Mic} 
              score={commScore} 
              // Active if session is live, Completed if we have a score >= cutoff
              status={commScore >= COMM_CUTOFF ? "completed" : "active"} 
            />
            <RoundCard 
              step="2" title="Technical MCQ" icon={BookOpen} 
              // Locked unless Communication Passed
              status={techPassed ? "completed" : isTechnicalUnlocked ? "active" : "locked"} 
            />
            <RoundCard 
              step="3" title="Coding Test" icon={Code} 
              score={codingScore || 0}
              // Locked unless Technical Passed
              status={isAllComplete ? "completed" : isCodingUnlocked ? "active" : "locked"} 
            />
          </div>

          {/* Context Action Box */}
          <div className={`border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl transition-all ${isAllComplete ? 'bg-gradient-to-r from-green-900/20 to-black border-green-900' : 'bg-[#111] border-gray-800'}`}>
            
            <div className={`p-5 rounded-full ${isAllComplete ? 'bg-green-500 text-black' : 'bg-[#FF4A1F]/10 text-[#FF4A1F]'}`}>
              {isAllComplete ? <Trophy size={48} /> : <Award size={48} />}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">
                {isAllComplete ? "Congratulations! Session Completed." : 
                 !isTechnicalUnlocked ? "Step 1: Communication Round" :
                 !techPassed ? "Step 2: Technical Assessment" : "Step 3: Coding Challenge"}
              </h2>
              <p className="text-gray-400 mt-2 max-w-lg">
                {isAllComplete 
                   ? "You have successfully passed all rounds. Your scores have been recorded. You can now terminate this session."
                   : !isTechnicalUnlocked 
                      ? `You must score at least ${COMM_CUTOFF}% in Communication to unlock the Technical round.`
                      : !techPassed
                         ? "Pass the Technical MCQ section to verify your knowledge before Coding."
                         : "Solve the final coding problem to complete your interview."}
              </p>
            </div>

            {/* DYNAMIC BUTTONS */}
            {!isAllComplete ? (
               <button 
                 onClick={() => {
                    if (!isTechnicalUnlocked) setSessionStage("communication");
                    else if (!techPassed) setSessionStage("technical");
                    else setSessionStage("coding");
                 }}
                 // DISABLED STATE IF LOCKED
                 className="bg-[#FF4A1F] text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-lg shadow-orange-500/20"
               >
                  {!isTechnicalUnlocked ? "Start Communication" : !techPassed ? "Start Technical" : "Start Coding"}
               </button>
            ) : (
                <button 
                  onClick={handleExit} 
                  className="bg-green-500 text-black px-10 py-4 rounded-full font-bold hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
                >
                  Return to History
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---

const RoundCard = ({ step, title, icon: Icon, status, score }) => {
  const isLocked = status === "locked";
  const isDone = status === "completed";

  return (
    <div className={`p-6 rounded-2xl border transition-all ${isLocked ? "opacity-40 grayscale" : "bg-[#111] border-gray-800 shadow-md"} ${isDone ? "border-green-900/50 bg-green-900/5" : ""}`}>
      <div className="flex justify-between items-center mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDone ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400"}`}>
          {isDone ? <CheckCircle size={20} /> : step}
        </div>
        {!isLocked && (score !== null && score !== undefined && score !== 0) && (
            <span className={`font-mono text-xl ${isDone ? "text-green-500" : "text-[#FF4A1F]"}`}>{score}%</span>
        )}
      </div>
      <h4 className="font-bold text-lg flex items-center gap-2">
        <Icon size={20} className={isLocked ? "text-gray-500" : isDone ? "text-green-500" : "text-[#FF4A1F]"} /> {title}
      </h4>
      <p className="text-xs text-gray-500 mt-2 uppercase tracking-tighter">
        {isLocked ? <span className="flex items-center gap-1"><Lock size={12}/> Locked</span> : isDone ? "Passed" : "Unlocked"}
      </p>
    </div>
  );
};

export default MockInterviewView;