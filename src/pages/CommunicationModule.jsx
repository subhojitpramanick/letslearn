import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { 
  Mic, CheckCircle, Volume2, MicOff, Send, 
  Loader2, Play, BookOpen, X 
} from "lucide-react";

const CommunicationModule = ({ user, sessionId, onComplete, onCancel }) => {
  const [stage, setStage] = useState("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState({ reading: [], repetition: [], comprehension: [] });
  const [practiceSet, setPracticeSet] = useState(null);
  
  // Strict State Management
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState("idle"); // idle, playing, ready

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 1. Fetch Content
  useEffect(() => {
    fetch("/exple.json")
      .then(res => res.json())
      .then(data => {
        if (data?.sets?.length > 0) {
          const randomSet = data.sets[Math.floor(Math.random() * data.sets.length)];
          setPracticeSet(randomSet);
          setStage("reading");
        }
      })
      .catch(err => console.error("Error loading JSON:", err));

    return () => {
      stopAudioPlayback();
      cleanupMic();
    };
  }, []);

  const stopAudioPlayback = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setPlaybackStatus("idle");
  };

  const cleanupMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // 2. Browser AI Voice (Text-to-Speech)
  const playAIVoice = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Browser does not support AI voice.");
      return;
    }

    // STRICT: Stop any current audio or recording
    stopAudioPlayback();
    if (isRecording) stopRecording();

    setPlaybackStatus("playing");
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; 
    utterance.pitch = 1;

    utterance.onend = () => setPlaybackStatus("ready");
    utterance.onerror = () => {
      console.error("TTS Error");
      setPlaybackStatus("ready");
    };

    window.speechSynthesis.speak(utterance);
  };

  // 3. Audio Recording Engine
  const startRecording = async () => {
    if (playbackStatus === "playing") stopAudioPlayback();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        cleanupMic(); 
        handleAudioUpload(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied. Please check browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 4. Upload & Save Logic
  const handleAudioUpload = async (audioBlob) => {
    setIsUploading(true);
    const filePath = `${user.id}/${stage}_${Date.now()}.webm`;

    try {
      const { error } = await supabase.storage.from("audio-uploads").upload(filePath, audioBlob);
      if (error) throw error;
      
      const { data: urlData } = supabase.storage.from("audio-uploads").getPublicUrl(filePath);
      saveResultAndAdvance(urlData.publicUrl);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
      setIsUploading(false);
    }
  };

  const saveResultAndAdvance = (url) => {
    const currentItems = practiceSet[stage];
    const originalText = stage === "reading" 
      ? currentItems[currentIndex] 
      : (currentItems[currentIndex]?.text || "Unknown");

    setResults(prev => ({
      ...prev,
      [stage]: [...prev[stage], { text: originalText, audioUrl: url }]
    }));

    setIsUploading(false);
    setPlaybackStatus("idle"); 
    
    if (currentIndex < currentItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      advanceStage();
    }
  };

  const advanceStage = () => {
    setCurrentIndex(0);
    setPlaybackStatus("idle");
    const flow = ["reading", "repetition", "comprehension", "finished"];
    const next = flow[flow.indexOf(stage) + 1];
    setStage(next);
  };

  // 5. MCQ Logic (Comprehension) - FIXED JSON ACCESS
  const handleMCQAnswer = (option) => {
    if (playbackStatus === "playing") stopAudioPlayback();

    // FIX: Access .questions directly (removed [0])
    const questions = practiceSet.comprehension.questions;
    const qData = questions[currentIndex];
    const isCorrect = option === qData.correctAnswer;

    setResults(prev => ({
      ...prev,
      comprehension: [...prev.comprehension, { question: qData.question, isCorrect }]
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStage("finished");
    }
  };

const handleSubmit = async () => {
  setIsSubmitting(true);

  try {
    const { data: { session: authSession } } = await supabase.auth.getSession();
    const token = authSession?.access_token;

    // 1. Create Session
    const { data: newSession, error: createError } = await supabase
        .from('mock_interview_sessions')
        .insert([{
            user_id: user.id,
            user_email: user.email,
            status: 'processing',
            communication_data: results
        }])
        .select()
        .single();

    if (createError) throw createError;

    // 2. Trigger Analysis
    const payload = {
        sessionId: newSession.id,
        userId: user.id,
        userEmail: user.email,
        results: results
    };

    const baseUrl = import.meta.env.VITE_MOTIA_URL;
    await fetch(`${baseUrl}/api/student/analyze`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // 3. POLL FOR RESULTS (The New Logic)
    // We check the DB every 2 seconds to see if 'status' becomes 'completed'
    let attempts = 0;
    const maxAttempts = 30; // Wait up to 60 seconds (30 * 2s)

    const pollInterval = setInterval(async () => {
        attempts++;
        
        const { data: updatedSession, error: pollError } = await supabase
            .from('mock_interview_sessions')
            .select('status, communication_score')
            .eq('id', newSession.id)
            .single();

        if (pollError) {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            alert("Error checking results. Please refresh.");
            return;
        }

        // STOP CONDITION: Analysis is done!
        if (updatedSession.status === 'completed') {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            
            // NOW we have the real score (e.g., 55)
            // Default to 0 if null, but NEVER 75
            onComplete(updatedSession.communication_score || 0); 
        }

        // TIMEOUT CONDITION
        if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            alert("Analysis timed out. Please check your dashboard later.");
        }

    }, 5000); // Check every 5 seconds

  } catch (err) {
    console.error("Submission Error:", err);
    alert(err.message || "Failed to submit analysis");
    setIsSubmitting(false);
  }
};

  if (stage === "loading") return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#FF4A1F]" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#111] rounded-[2.5rem] border border-gray-800 shadow-2xl relative">
      <button onClick={onCancel} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={24} /></button>
      
      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-[#FF4A1F] uppercase tracking-widest text-sm">Voice Assessment</h2>
        <h1 className="text-3xl font-bold mt-2 text-white capitalize">{stage} Round</h1>
      </div>

      {/* STAGE: READING */}
      {stage === "reading" && (
        <div className="text-center space-y-8">
          <div className="p-10 bg-black/40 rounded-3xl border border-gray-800 min-h-[150px] flex items-center justify-center">
            <p className="text-3xl font-medium italic text-white leading-relaxed">"{practiceSet.reading[currentIndex]}"</p>
          </div>
          <RecordUI 
            isRecording={isRecording} isUploading={isUploading} 
            onStart={startRecording} onStop={stopRecording} 
            disabled={false} 
          />
        </div>
      )}

      {/* STAGE: REPETITION */}
      {stage === "repetition" && (
        <div className="text-center space-y-8">
          <div className="p-12 bg-black/40 rounded-3xl border border-gray-800">
             <button 
                onClick={() => playAIVoice(practiceSet.repetition[currentIndex].text)} 
                disabled={playbackStatus === "playing" || isRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all shadow-xl ${playbackStatus === "playing" ? "bg-[#FF4A1F] text-black scale-110" : "bg-[#FF4A1F]/10 text-[#FF4A1F] hover:bg-[#FF4A1F]/20"}`}
             >
               {playbackStatus === "playing" ? <Volume2 size={40} className="animate-pulse" /> : <Play size={40} className="ml-1" />}
             </button>
             <p className="mt-6 text-sm font-bold uppercase tracking-widest text-gray-500">
                {playbackStatus === "playing" ? "Listen Carefully..." : "Tap to Listen"}
             </p>
          </div>

          <RecordUI 
            isRecording={isRecording} isUploading={isUploading} 
            onStart={startRecording} onStop={stopRecording} 
            disabled={playbackStatus === "idle" || playbackStatus === "playing"} // Strict: Must finish listening
          />
        </div>
      )}

      {/* STAGE: COMPREHENSION (FIXED) */}
      {stage === "comprehension" && practiceSet.comprehension && (
        <div className="space-y-8">
          {/* Story Audio Player */}
          <div className="p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl text-center">
            <h4 className="text-blue-400 font-bold mb-3 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
              <BookOpen size={16}/> Story Context
            </h4>
            <button 
              // FIX: Removed [0] because comprehension is an object in your JSON
              onClick={() => playAIVoice(practiceSet.comprehension.story)}
              disabled={playbackStatus === "playing"}
              className={`mb-2 p-3 rounded-full transition-all ${playbackStatus === "playing" ? "bg-blue-500 text-white animate-pulse" : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"}`}
            >
              <Volume2 size={24} />
            </button>
            <p className="text-xs text-gray-500">{playbackStatus === "playing" ? "Playing Story..." : "Play Story Audio"}</p>
          </div>

          {/* MCQ Section */}
          <div className="space-y-4">
             {/* FIX: Removed [0] from access path */}
             <h3 className="text-xl font-bold text-center">
               {practiceSet.comprehension.questions[currentIndex].question}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {practiceSet.comprehension.questions[currentIndex].options.map((opt, i) => (
                 <button 
                   key={i} 
                   onClick={() => handleMCQAnswer(opt)}
                   disabled={playbackStatus === "playing"}
                   className="p-5 bg-gray-900 border border-gray-800 rounded-xl hover:bg-[#FF4A1F]/10 hover:border-[#FF4A1F]/50 transition-all text-left disabled:opacity-50"
                 >
                   {opt}
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* STAGE: FINISHED */}
      {stage === "finished" && (
        <div className="text-center py-10 space-y-6">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 border border-green-500/20">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-4xl font-bold">Session Complete</h2>
          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-[#FF4A1F] text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            {isSubmitting ? "Generating Report..." : "Submit for Analysis"}
          </button>
        </div>
      )}
    </div>
  );
};

// Reusable Record Button
const RecordUI = ({ isRecording, isUploading, onStart, onStop, disabled }) => (
  <button 
    onClick={isRecording ? onStop : onStart} 
    disabled={isUploading || disabled}
    className={`
      px-12 py-5 rounded-full font-black text-lg flex items-center gap-3 mx-auto transition-all shadow-xl
      ${disabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' : 
        isRecording ? 'bg-red-600 text-white animate-pulse shadow-red-500/20 scale-105' : 'bg-[#FF4A1F] text-black hover:scale-105 shadow-orange-500/20'}
    `}
  >
    {isUploading ? <Loader2 className="animate-spin" /> : isRecording ? <MicOff /> : <Mic />} 
    <span>{isUploading ? "Syncing..." : isRecording ? "Stop Recording" : "Start Recording"}</span>
  </button>
);

export default CommunicationModule;