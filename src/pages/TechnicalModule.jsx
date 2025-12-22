import React, { useState, useEffect } from "react";
import { 
  Clock, CheckCircle, AlertCircle, Save, 
  Code, Laptop, Database, Globe, Cpu 
} from "lucide-react";
import { supabase } from "../supabaseClient";

// --- MOCK DATA (Keep your existing mock data exactly as is) ---
const MOCK_QUESTIONS = {
  dsa: [
    { id: 1, q: "Time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], ans: "O(log n)" },
    { id: 2, q: "Which data structure is FIFO?", options: ["Queue", "Stack", "Tree", "Graph"], ans: "Queue" },
    { id: 3, q: "Worst case of QuickSort?", options: ["O(n log n)", "O(n)", "O(n^2)", "O(1)"], ans: "O(n^2)" },
    { id: 4, q: "Best for priority queue?", options: ["Array", "Linked List", "Heap", "BST"], ans: "Heap" },
    { id: 5, q: "Detect cycle in graph?", options: ["DFS", "BFS", "Both", "None"], ans: "Both" },
    { id: 6, q: "Stack uses which order?", options: ["LIFO", "FIFO", "FILO", "LILO"], ans: "LIFO" },
    { id: 7, q: "Searching in Hash Map?", options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], ans: "O(1)" },
    { id: 8, q: "BST Left child is?", options: ["Smaller", "Larger", "Equal", "Random"], ans: "Smaller" },
  ],
  oops: [
    { id: 9, q: "Polymorphism feature?", options: ["Overloading", "Encapsulation", "Hiding", "None"], ans: "Overloading" },
    { id: 10, q: "Not an OOPS concept?", options: ["Encapsulation", "Polymorphism", "Compilation", "Inheritance"], ans: "Compilation" },
    { id: 11, q: "Private members accessible where?", options: ["Same Class", "Sub Class", "Anywhere", "Package"], ans: "Same Class" },
    { id: 12, q: "Keyword for inheritance in Java?", options: ["extends", "implements", "inherits", "uses"], ans: "extends" },
    { id: 13, q: "Multiple inheritance in Java?", options: ["Class", "Interface", "Both", "None"], ans: "Interface" },
    { id: 14, q: "Constructor return type?", options: ["int", "void", "None", "class"], ans: "None" },
    { id: 15, q: "Static method access?", options: ["Class Name", "Object", "Both", "None"], ans: "Class Name" },
    { id: 16, q: "Abstract class object?", options: ["Possible", "Impossible", "Conditional", "None"], ans: "Impossible" },
  ],
  dbms: [
    { id: 17, q: "What is a Tuple?", options: ["Row", "Column", "Table", "Key"], ans: "Row" },
    { id: 18, q: "Unique identifier?", options: ["Primary Key", "Foreign Key", "Unique Key", "Check"], ans: "Primary Key" },
    { id: 19, q: "ACID 'A' stands for?", options: ["Atomicity", "Availability", "Accuracy", "Audit"], ans: "Atomicity" },
    { id: 20, q: "Command to remove table?", options: ["DELETE", "DROP", "REMOVE", "TRUNCATE"], ans: "DROP" },
    { id: 21, q: "Relation is?", options: ["Table", "Row", "Key", "Data"], ans: "Table" },
    { id: 22, q: "Normalization reduces?", options: ["Redundancy", "Dependency", "Inconsistency", "All"], ans: "All" },
    { id: 23, q: "SQL is?", options: ["Structured Query Lang", "Simple Query Lang", "Standard Query Lang", "None"], ans: "Structured Query Lang" },
    { id: 24, q: "Foreign key references?", options: ["Primary Key", "Unique Key", "Any Column", "None"], ans: "Primary Key" },
  ],
  cn: [
    { id: 25, q: "OSI Layer 1?", options: ["Physical", "Data", "Network", "Transport"], ans: "Physical" },
    { id: 26, q: "Protocol for web?", options: ["HTTP", "FTP", "SMTP", "TCP"], ans: "HTTP" },
    { id: 27, q: "IP Address length (v4)?", options: ["32 bits", "64 bits", "128 bits", "16 bits"], ans: "32 bits" },
    { id: 28, q: "Port 80 is?", options: ["HTTP", "HTTPS", "FTP", "SSH"], ans: "HTTP" },
    { id: 29, q: "Connection oriented?", options: ["TCP", "UDP", "IP", "Ethernet"], ans: "TCP" },
    { id: 30, q: "Ping uses?", options: ["ICMP", "TCP", "UDP", "ARP"], ans: "ICMP" },
    { id: 31, q: "DNS maps?", options: ["Name to IP", "IP to MAC", "MAC to IP", "Name to MAC"], ans: "Name to IP" },
    { id: 32, q: "Private IP start?", options: ["192.168", "172.16", "10.0", "All"], ans: "All" },
  ],
  os: [
    { id: 33, q: "Core of OS?", options: ["Kernel", "Shell", "GUI", "API"], ans: "Kernel" },
    { id: 34, q: "Thrashing occurs in?", options: ["Paging", "Segmentation", "Fragmenting", "Scheduling"], ans: "Paging" },
    { id: 35, q: "FIFO is a?", options: ["Scheduling Algo", "Memory Algo", "Both", "None"], ans: "Both" },
    { id: 36, q: "Deadlock condition?", options: ["Mutual Exclusion", "Hold & Wait", "No Preemption", "All"], ans: "All" },
    { id: 37, q: "Thread is?", options: ["Lightweight Process", "Heavy Process", "IO", "File"], ans: "Lightweight Process" },
    { id: 38, q: "Virtual Memory?", options: ["RAM", "HDD as RAM", "Cache", "ROM"], ans: "HDD as RAM" },
    { id: 39, q: "Semaphore used for?", options: ["Synchronization", "Deadlock", "Paging", "None"], ans: "Synchronization" },
    { id: 40, q: "Linux is?", options: ["Open Source", "Proprietary", "Paid", "None"], ans: "Open Source" },
  ],
};

const SECTIONS = [
  { key: "dsa", label: "DSA", icon: Code },
  { key: "oops", label: "OOPs", icon: Laptop },
  { key: "dbms", label: "DBMS", icon: Database },
  { key: "cn", label: "CN", icon: Globe },
  { key: "os", label: "OS", icon: Cpu },
];

const TOTAL_TIME_MIN = 20; 

// ✅ 1. Accept sessionId Prop
const TechnicalModule = ({ user, sessionId, onComplete, onCancel }) => {
  const [activeSection, setActiveSection] = useState("dsa");
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_MIN * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  useEffect(() => {
    if (showResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult]);

  const handleSelect = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  // ✅ 2. UPDATED SUBMIT LOGIC (Uses UPDATE)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Scoring Logic
    let totalCorrect = 0;
    let totalQuestions = 0;
    const sectionResults = {};
    let passedSections = 0;
    const TOTAL_SECTIONS = SECTIONS.length;

    SECTIONS.forEach((sec) => {
      const questions = MOCK_QUESTIONS[sec.key];
      let secCorrect = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.ans) secCorrect++;
      });
      
      const scorePercent = (secCorrect / questions.length) * 100;
      const isPass = scorePercent >= 40; 
      sectionResults[sec.key] = { score: scorePercent, passed: isPass };
      if (isPass) passedSections++;
      totalCorrect += secCorrect;
      totalQuestions += questions.length;
    });

    const overallPercent = (totalCorrect / totalQuestions) * 100;
    const overallPass = overallPercent >= 60; 
    const finalPass = overallPass && (passedSections === TOTAL_SECTIONS);

    const report = { overallScore: overallPercent, finalPass, sectionResults };
    setFinalReport(report);
    
    // ✅ Perform UPDATE on the active session
    try {
      await supabase.from("mock_interview_sessions")
        .update({
          technical_score: overallPercent,
          technical_passed: finalPass, // Critical for unlocking Round 3
          technical_data: report
        })
        .eq('id', sessionId); // Target the specific session ID
    } catch (err) {
      console.error("Save failed", err);
    }

    setIsSubmitting(false);
    setShowResult(true);
  };

  // --- RESULT VIEW ---
  if (showResult) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-[#111] rounded-2xl border border-gray-800 animate-in fade-in">
        <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${finalReport.finalPass ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {finalReport.finalPass ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
            </div>
            <h2 className="text-3xl font-bold">{finalReport.finalPass ? "Technical Round Cleared!" : "Assessment Failed"}</h2>
            <p className="text-gray-400 mt-2">
                Overall Score: <span className="text-white font-bold">{finalReport.overallScore.toFixed(1)}%</span> 
                (Req: 60%)
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {SECTIONS.map(sec => {
                const res = finalReport.sectionResults[sec.key];
                return (
                    <div key={sec.key} className={`p-4 rounded-xl border flex justify-between items-center ${res.passed ? 'border-green-900 bg-green-900/10' : 'border-red-900 bg-red-900/10'}`}>
                        <div className="flex items-center gap-3">
                            <sec.icon size={20} className={res.passed ? "text-green-500" : "text-red-500"}/>
                            <span className="font-bold uppercase">{sec.label}</span>
                        </div>
                        <div className="text-right">
                            <span className={`block font-mono font-bold ${res.passed ? "text-green-400" : "text-red-400"}`}>
                                {res.score.toFixed(0)}%
                            </span>
                            <span className="text-xs text-gray-500">Cutoff: 40%</span>
                        </div>
                    </div>
                )
            })}
        </div>

        <div className="flex justify-center gap-4">
            <button 
                onClick={onCancel}
                className="px-6 py-3 rounded-full border border-gray-700 hover:bg-gray-800"
            >
                Return Home
            </button>
            <button 
                onClick={() => onComplete(finalReport.finalPass)}
                className="px-6 py-3 rounded-full bg-[#FF4A1F] text-black font-bold hover:scale-105 transition-transform"
            >
                {finalReport.finalPass ? "Proceed to Coding Round" : "Retake Assessment"}
            </button>
        </div>
      </div>
    );
  }

  // --- QUIZ VIEW ---
  const currentQuestions = MOCK_QUESTIONS[activeSection];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#0A0A0A] rounded-2xl border border-gray-800 min-h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
        <div>
            <h2 className="text-xl font-bold">Technical Assessment</h2>
            <p className="text-gray-500 text-sm">40 Questions • Sectional Cutoff: 40%</p>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-900/20 text-red-500' : 'bg-gray-800 text-white'}`}>
            <Clock size={20} />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex flex-1 gap-6">
        <div className="w-1/4 space-y-2">
            {SECTIONS.map((sec) => (
                <button
                    key={sec.key}
                    onClick={() => setActiveSection(sec.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        activeSection === sec.key 
                        ? "bg-[#FF4A1F] text-black font-bold" 
                        : "bg-[#111] hover:bg-gray-800 text-gray-400"
                    }`}
                >
                    <sec.icon size={18} />
                    <span>{sec.label}</span>
                    <div className="ml-auto flex gap-1">
                       {MOCK_QUESTIONS[sec.key].map(q => (
                           <div key={q.id} className={`w-1.5 h-1.5 rounded-full ${answers[q.id] ? 'bg-white' : 'bg-gray-700'}`} />
                       ))}
                    </div>
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 max-h-[500px]">
            <h3 className="text-2xl font-bold mb-6 capitalize flex items-center gap-2">
                {activeSection} Section
                <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded">
                    {Object.keys(answers).filter(k => MOCK_QUESTIONS[activeSection].find(q => q.id === parseInt(k))).length} / 8 Answered
                </span>
            </h3>

            <div className="space-y-8">
                {currentQuestions.map((q, idx) => (
                    <div key={q.id} className="p-5 rounded-2xl bg-[#111] border border-gray-800 hover:border-gray-700 transition-colors">
                        <p className="font-medium text-lg mb-4 text-gray-200">
                            <span className="text-[#FF4A1F] font-bold mr-2">{idx + 1}.</span>
                            {q.q}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleSelect(q.id, opt)}
                                    className={`p-3 rounded-lg text-left text-sm transition-all border ${
                                        answers[q.id] === opt
                                        ? "bg-[#FF4A1F]/20 border-[#FF4A1F] text-[#FF4A1F]"
                                        : "bg-black border-gray-800 hover:bg-gray-900 text-gray-400"
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
        <p className="text-xs text-gray-500">
           *Warning: Assessment auto-submits when timer ends.
        </p>
        <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200"
        >
            {isSubmitting ? "Submitting..." : "Submit Assessment"} <Save size={18} />
        </button>
      </div>
    </div>
  );
};

export default TechnicalModule;