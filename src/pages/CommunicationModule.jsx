import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Mic, CheckCircle, Volume2, MicOff, Send, Loader2, Play, BookOpen, X } from "lucide-react";

// ✅ Accept 'customData' prop
const CommunicationModule = ({ user, sessionId, onComplete, onCancel, customData }) => {
  const [stage, setStage] = useState("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState({ reading: [], repetition: [], comprehension: [] });
  const [practiceSet, setPracticeSet] = useState(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState("idle"); 

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ✅ 1. Load Data from Props (instead of fetch)
  useEffect(() => {
    if (customData) {
      // Ensure data structure validity
      const safeSet = {
        reading: customData.reading || ["Read this sample text."],
        repetition: customData.repetition || [{text: "Repeat this sample."}], // Handle string or obj
        comprehension: customData.comprehension || { story: "Sample story.", questions: [] }
      };
      
      // Normalize repetition if it's just strings
      if(typeof safeSet.repetition[0] === 'string') {
         safeSet.repetition = safeSet.repetition.map(t => ({ text: t }));
      }

      setPracticeSet(safeSet);
      setStage("reading");
    } else {
      // Fallback if no data passed
      alert("No communication data found in this set.");
      onCancel();
    }

    return () => {
      stopAudioPlayback();
      cleanupMic();
    };
  }, [customData]);

  // ... (Keep the rest of your audio logic exactly the same: stopAudioPlayback, cleanupMic, playAIVoice, startRecording, stopRecording, handleAudioUpload) ...
  // FOR BREVITY: I am not repeating the helper functions like startRecording/playAIVoice here because they do not change. 
  // JUST COPY-PASTE YOUR EXISTING HELPER FUNCTIONS HERE.

  // --- RE-INSERT HELPERS HERE ---
  const stopAudioPlayback = () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setPlaybackStatus("idle"); };
  const cleanupMic = () => { if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; } };
  const playAIVoice = (text) => {
    if (!('speechSynthesis' in window)) return;
    stopAudioPlayback();
    if (isRecording) stopRecording();
    setPlaybackStatus("playing");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; 
    utterance.onend = () => setPlaybackStatus("ready");
    window.speechSynthesis.speak(utterance);
  };
  const startRecording = async () => {
    if (playbackStatus === "playing") stopAudioPlayback();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => { const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" }); cleanupMic(); handleAudioUpload(audioBlob); };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { alert("Mic Access Denied"); }
  };
  const stopRecording = () => { if (mediaRecorderRef.current?.state === "recording") { mediaRecorderRef.current.stop(); setIsRecording(false); } };
  const handleAudioUpload = async (audioBlob) => {
    setIsUploading(true);
    const filePath = `${user.id}/${stage}_${Date.now()}.webm`;
    try {
      const { error } = await supabase.storage.from("audio-uploads").upload(filePath, audioBlob);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("audio-uploads").getPublicUrl(filePath);
      saveResultAndAdvance(urlData.publicUrl);
    } catch (err) { setIsUploading(false); }
  };
  // -----------------------------

  const saveResultAndAdvance = (url) => {
    const currentItems = practiceSet[stage];
    // Handle different data structures (string vs obj)
    const originalText = stage === "reading" 
      ? currentItems[currentIndex] 
      : (currentItems[currentIndex]?.text || currentItems[currentIndex]); 

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
    // Skip empty stages if practice set doesn't have them
    let nextIdx = flow.indexOf(stage) + 1;
    // Simple loop to find next valid stage
    while(nextIdx < flow.length && (!practiceSet[flow[nextIdx]] || (Array.isArray(practiceSet[flow[nextIdx]]) && practiceSet[flow[nextIdx]].length === 0))) {
        nextIdx++;
    }
    setStage(flow[nextIdx] || "finished");
  };

  const handleMCQAnswer = (option) => {
    if (playbackStatus === "playing") stopAudioPlayback();
    const questions = practiceSet.comprehension.questions;
    const qData = questions[currentIndex];
    const isCorrect = option === qData.correctAnswer; // Assuming JSON has 'correctAnswer'

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
    // ... (Keep existing submit logic, just mocked for brevity in this response block, assume you paste the API call here) ...
    // For demo:
    onComplete(85); 
  };

  if (stage === "loading") return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#FF4A1F]" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#111] rounded-[2.5rem] border border-gray-800 shadow-2xl relative min-h-[500px] flex flex-col justify-center">
      <button onClick={onCancel} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={24} /></button>
      
      {/* ... (Keep existing JSX for stages) ... */}
      {/* Reading */}
      {stage === "reading" && (
        <div className="text-center space-y-8">
          <p className="text-3xl font-medium italic text-white leading-relaxed">"{practiceSet.reading[currentIndex]}"</p>
          <RecordUI isRecording={isRecording} isUploading={isUploading} onStart={startRecording} onStop={stopRecording} />
        </div>
      )}

      {/* Repetition */}
      {stage === "repetition" && (
        <div className="text-center space-y-8">
             <button onClick={() => playAIVoice(practiceSet.repetition[currentIndex].text)} className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${playbackStatus === "playing" ? "bg-[#FF4A1F] animate-pulse" : "bg-[#FF4A1F]/20 text-[#FF4A1F]"}`}><Volume2 size={40}/></button>
             <RecordUI isRecording={isRecording} isUploading={isUploading} onStart={startRecording} onStop={stopRecording} disabled={playbackStatus !== "idle"} />
        </div>
      )}

      {/* Comprehension */}
      {stage === "comprehension" && (
         <div className="space-y-6">
            <h3 className="text-xl font-bold text-center">{practiceSet.comprehension.questions[currentIndex].question}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {practiceSet.comprehension.questions[currentIndex].options.map((opt, i) => (
                 <button key={i} onClick={() => handleMCQAnswer(opt)} className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-[#FF4A1F]">{opt}</button>
               ))}
            </div>
         </div>
      )}

      {stage === "finished" && (
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold">Session Complete</h2>
          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-[#FF4A1F] text-black py-4 rounded-xl font-bold">Submit Results</button>
        </div>
      )}
    </div>
  );
};

const RecordUI = ({ isRecording, isUploading, onStart, onStop, disabled }) => (
  <button onClick={isRecording ? onStop : onStart} disabled={isUploading || disabled} className={`px-12 py-5 rounded-full font-black text-lg flex items-center gap-3 mx-auto transition-all ${disabled ? 'bg-gray-800 opacity-50' : isRecording ? 'bg-red-600 animate-pulse' : 'bg-[#FF4A1F] text-black hover:scale-105'}`}>
    {isUploading ? <Loader2 className="animate-spin" /> : isRecording ? <MicOff /> : <Mic />} <span>{isUploading ? "Syncing..." : isRecording ? "Stop" : "Record"}</span>
  </button>
);

export default CommunicationModule;