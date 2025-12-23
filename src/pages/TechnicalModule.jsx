import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertCircle, Save, Code } from "lucide-react";
import { supabase } from "../supabaseClient";

// ✅ Accept 'questions' prop (List from DB)
const TechnicalModule = ({ user, sessionId, onComplete, onCancel, questions }) => {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 mins
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Safety fallback if no questions passed
  const questionList = (questions && questions.length > 0) ? questions : [
    { id: 1, q: "No questions found.", options: [], ans: "" }
  ];

  useEffect(() => {
    if (showResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult]);

  const handleSelect = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let correct = 0;
    
    questionList.forEach(q => {
      // Support DB fields (q.q or q.question_text) and (q.ans or q.correct_answer)
      const correctAns = q.ans || q.correct_answer;
      if(answers[q.id] === correctAns) correct++;
    });

    const scorePercent = Math.round((correct / questionList.length) * 100);
    const isPass = scorePercent >= 60; // 60% Passing

    try {
      await supabase.from("mock_interview_sessions")
        .update({
          technical_score: scorePercent,
          technical_passed: isPass,
          technical_data: { answers, score: scorePercent }
        })
        .eq('id', sessionId);
        
      setFinalScore(scorePercent);
      setShowResult(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResult) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-[#111] rounded-2xl border border-gray-800 text-center animate-in fade-in">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${finalScore >= 60 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {finalScore >= 60 ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
        </div>
        <h2 className="text-3xl font-bold">{finalScore >= 60 ? "Passed Technical Round" : "Assessment Failed"}</h2>
        <p className="text-gray-400 mt-2 mb-8 text-xl font-bold">Score: {finalScore}%</p>
        
        <button onClick={() => onComplete(finalScore >= 60, finalScore)} className="bg-[#FF4A1F] text-black px-8 py-3 rounded-full font-bold">
          {finalScore >= 60 ? "Proceed to Coding" : "Return to Dashboard"}
        </button>
      </div>
    );
  }

  // Quiz UI
  const currentQ = questionList[activeQuestionIdx];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#0A0A0A] rounded-2xl border border-gray-800 min-h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
        <div>
            <h2 className="text-xl font-bold">Technical Assessment</h2>
            <p className="text-gray-500 text-sm">Question {activeQuestionIdx + 1} of {questionList.length}</p>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-900/20 text-red-500' : 'bg-gray-800 text-white'}`}>
            <Clock size={20} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
         <h3 className="text-2xl font-bold mb-8 text-white">{currentQ.q || currentQ.question_text}</h3>
         
         <div className="grid grid-cols-1 gap-4">
            {(currentQ.options || []).map((opt, i) => (
               <button 
                 key={i}
                 onClick={() => handleSelect(currentQ.id, opt)}
                 className={`p-4 rounded-xl text-left border transition-all ${answers[currentQ.id] === opt ? 'bg-[#FF4A1F]/20 border-[#FF4A1F] text-white' : 'bg-[#111] border-gray-800 hover:bg-gray-900 text-gray-400'}`}
               >
                 <span className="font-bold mr-2">{String.fromCharCode(65+i)}.</span> {opt}
               </button>
            ))}
         </div>
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-800">
         <button 
           disabled={activeQuestionIdx === 0}
           onClick={() => setActiveQuestionIdx(p => p - 1)}
           className="px-6 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50"
         >
           Previous
         </button>

         {activeQuestionIdx < questionList.length - 1 ? (
            <button 
              onClick={() => setActiveQuestionIdx(p => p + 1)}
              className="px-6 py-2 rounded-lg bg-white text-black font-bold hover:bg-gray-200"
            >
              Next
            </button>
         ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 rounded-lg bg-[#FF4A1F] text-black font-bold hover:scale-105 transition-transform"
            >
              {isSubmitting ? "Submitting..." : "Submit All"}
            </button>
         )}
      </div>
    </div>
  );
};

export default TechnicalModule;