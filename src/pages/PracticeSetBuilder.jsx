import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Save, Plus, Trash2, Search, Database, Code, 
  Mic, BookOpen, Key, CheckSquare, Loader2, Volume2, X 
} from 'lucide-react';

export default function PracticeSetBuilder() {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  const [setData, setSetData] = useState({
    title: "",
    accessKey: "",
    communication: {
      reading: ["", "", "", ""], 
      repetition: ["", "", "", ""], 
      comprehension: { story: "", questions: [{q:"", opt:["",""], ans:""}] } 
    },
    technical: [], 
    coding: []     
  });

  // --- QUESTION SOURCES (NOW ALL SUPABASE) ---
  const [dbQuestions, setDbQuestions] = useState([]); // Technical MCQs
  const [codingBank, setCodingBank] = useState([]);   // Coding Questions (New!)
  
  const [techSearch, setTechSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");

  // --- MANUAL ENTRY STATE ---
  const [manualTech, setManualTech] = useState({ q: "", options: ["", "", "", ""], ans: "" });
  const [manualCode, setManualCode] = useState({ title: "", difficulty: "Easy", desc: "" });

  // --- FETCHING ---
  useEffect(() => {
    // 1. Fetch Technical MCQs
    const fetchSupabaseTech = async () => {
      const { data } = await supabase
        .from('module_questions')
        .select('*')
        .eq('question_type', 'MCQ')
        .limit(200); 
      if(data) setDbQuestions(data);
    };

    // 2. Fetch Coding Problems (FROM SUPABASE NOW, NOT MONGO)
    const fetchSupabaseCoding = async () => {
      const { data } = await supabase
        .from('coding_questions') // <--- Your new table
        .select('*')
        .order('created_at', { ascending: false });
      if(data) setCodingBank(data);
    };

    if(step === 3) fetchSupabaseTech();
    if(step === 4) fetchSupabaseCoding();
  }, [step]);

  // --- HANDLERS ---

  // 1. Add Custom MCQ
  const addManualTechQuestion = () => {
    if(!manualTech.q || !manualTech.ans || manualTech.options.some(o => !o)) {
      return alert("Please fill all fields.");
    }
    const newQ = {
      id: `manual-${Date.now()}`,
      q: manualTech.q,
      options: manualTech.options,
      ans: manualTech.options.find(o => o.trim() === manualTech.ans.trim()) || manualTech.ans,
      topic: 'Custom'
    };
    setSetData(prev => ({...prev, technical: [...prev.technical, newQ]}));
    setManualTech({ q: "", options: ["", "", "", ""], ans: "" });
  };

  // 2. Add Custom Coding Problem
  const addManualCodingQuestion = () => {
    if(!manualCode.title || !manualCode.desc) return alert("Title and Description required.");
    const newProb = {
      id: `manual-${Date.now()}`,
      title: manualCode.title,
      difficulty: manualCode.difficulty,
      description: manualCode.desc,
      starterCode: { java: "// Code here" },
      testCases: [] 
    };
    setSetData(prev => ({...prev, coding: [...prev.coding, newProb]}));
    setManualCode({ title: "", difficulty: "Easy", desc: "" });
  };

  // 3. Save Entire Set
  const handleSaveSet = async () => {
    if(!setData.title) return alert("Please enter a title");
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = {
      created_by: user.id,
      title: setData.title,
      access_key: setData.accessKey || null,
      data: {
        communication: setData.communication,
        technical: setData.technical,
        coding: setData.coding
      }
    };

    const { error } = await supabase.from('practice_sets').insert(payload);
    setLoading(false);
    
    if(error) alert("Error: " + error.message);
    else {
      alert("Practice Set Published! 🎉");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6 text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold">Practice Set Builder</h1>
        <div className="flex gap-2">
          {[1,2,3,4].map(s => (
            <div key={s} onClick={() => setStep(s)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${step === s ? 'bg-[#FF4A1F] text-black' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: INFO */}
      {step === 1 && (
        <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Set Title</label>
            <input className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl text-white focus:border-[#FF4A1F] outline-none" placeholder="e.g. Full Stack Mock Test 1" value={setData.title} onChange={e => setSetData({...setData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2"><Key size={14}/> Access Key (Optional)</label>
            <input className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl text-white focus:border-[#FF4A1F] outline-none" placeholder="e.g. CLASS-A (Leave empty for Random/Public)" value={setData.accessKey} onChange={e => setSetData({...setData, accessKey: e.target.value})} />
          </div>
          <button onClick={() => setStep(2)} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200">Next: Communication</button>
        </div>
      )}

      {/* STEP 2: COMMUNICATION */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Mic size={18} className="text-blue-500"/> Reading (4 Items)</h3>
              {setData.communication.reading.map((text, i) => (
                <textarea key={i} className="w-full bg-black border border-gray-700 rounded p-2 mb-2 text-sm text-gray-300 focus:border-blue-500 outline-none" rows={2} placeholder={`Reading Sentence ${i+1}`} value={text} onChange={e => {
                    const newArr = [...setData.communication.reading];
                    newArr[i] = e.target.value;
                    setSetData(prev => ({...prev, communication: {...prev.communication, reading: newArr}}));
                  }} />
              ))}
            </div>
            <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Volume2 size={18} className="text-purple-500"/> Repetition (4 Items)</h3>
              {setData.communication.repetition.map((text, i) => (
                <textarea key={i} className="w-full bg-black border border-gray-700 rounded p-2 mb-2 text-sm text-gray-300 focus:border-purple-500 outline-none" rows={2} placeholder={`Repetition Sentence ${i+1}`} value={text} onChange={e => {
                    const newArr = [...setData.communication.repetition];
                    newArr[i] = e.target.value;
                    setSetData(prev => ({...prev, communication: {...prev.communication, repetition: newArr}}));
                  }} />
              ))}
            </div>
          </div>
          <button onClick={() => setStep(3)} className="float-right bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200">Next: Technical</button>
        </div>
      )}

      {/* STEP 3: TECHNICAL */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in h-[80vh] flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Database className="text-green-500"/> Select 40 Technical Questions
              <span className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-400">Selected: {setData.technical.length}</span>
            </h2>
            <input className="bg-[#111] border border-gray-800 px-3 py-2 rounded-lg text-sm text-white focus:border-green-500 outline-none" placeholder="Search DB..." value={techSearch} onChange={e => setTechSearch(e.target.value)} />
          </div>

          <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
            {/* LIST */}
            <div className="col-span-7 bg-[#111] border border-gray-800 rounded-2xl overflow-y-auto p-4 custom-scrollbar">
                {dbQuestions.filter(q => (q.question_text || "").toLowerCase().includes(techSearch.toLowerCase())).map(q => {
                  const isSelected = setData.technical.find(item => item.id === q.id);
                  return (
                    <div key={q.id} className={`p-3 mb-2 rounded border flex justify-between items-center cursor-pointer transition-all ${isSelected ? 'bg-green-900/10 border-green-500' : 'bg-black border-gray-800 hover:border-gray-600'}`}
                      onClick={() => {
                        if(isSelected) setSetData(prev => ({...prev, technical: prev.technical.filter(i => i.id !== q.id)}));
                        else setSetData(prev => ({...prev, technical: [...prev.technical, { id: q.id, q: q.question_text, options: q.options, ans: q.correct_answer, topic: q.topic }]}));
                      }}
                    >
                      <p className="text-sm font-medium text-white truncate w-4/5">{q.question_text}</p>
                      {isSelected ? <CheckSquare size={18} className="text-green-500"/> : <div className="w-4 h-4 border border-gray-600 rounded"/>}
                    </div>
                  )
                })}
            </div>
            
            {/* MANUAL */}
            <div className="col-span-5 bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col">
               <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Add Custom Question</h3>
               <div className="space-y-4 flex-1 overflow-y-auto">
                  <textarea className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none resize-none" rows={3} placeholder="Type question here..." value={manualTech.q} onChange={e => setManualTech({...manualTech, q: e.target.value})} />
                  <div className="grid grid-cols-2 gap-3">
                    {manualTech.options.map((opt, i) => (
                      <input key={i} className="bg-black border border-gray-700 rounded p-2 text-xs focus:border-green-500 outline-none" placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                          const newOpts = [...manualTech.options]; newOpts[i] = e.target.value;
                          setManualTech({...manualTech, options: newOpts});
                      }} />
                    ))}
                  </div>
                  <input className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none" placeholder="Correct Answer" value={manualTech.ans} onChange={e => setManualTech({...manualTech, ans: e.target.value})} />
                  <button onClick={addManualTechQuestion} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"><Plus size={16}/> Add to List</button>
               </div>
               
               <div className="mt-4 pt-4 border-t border-gray-700 h-1/3 overflow-y-auto">
                  <p className="text-xs text-gray-400 mb-2">Review Selected ({setData.technical.length})</p>
                  {setData.technical.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-black p-2 mb-1 rounded border border-gray-800">
                       <span className="truncate w-4/5">{t.q}</span>
                       <button onClick={() => setSetData(prev => ({...prev, technical: prev.technical.filter(i => i.id !== t.id)}))}><X size={14} className="text-red-500"/></button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
          <button onClick={() => setStep(4)} className="float-right bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200">Next: Coding</button>
        </div>
      )}

      {/* STEP 4: CODING (SUPABASE + MANUAL) */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in h-[80vh] flex flex-col">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold flex items-center gap-2">
               <Code className="text-yellow-500"/> Select 2 Coding Questions
               <span className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-400">Selected: {setData.coding.length} / 2</span>
             </h2>
             <input className="bg-[#111] border border-gray-800 px-3 py-2 rounded-lg text-sm text-white focus:border-yellow-500 outline-none" placeholder="Search Problems..." value={codeSearch} onChange={e => setCodeSearch(e.target.value)} />
           </div>

           <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
              {/* LEFT: SUPABASE BANK */}
              <div className="col-span-7 bg-[#111] border border-gray-800 rounded-2xl flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 sticky top-0 bg-[#111] py-2">From Question Bank</h3>
                  {codingBank.filter(q => q.title.toLowerCase().includes(codeSearch.toLowerCase())).map(q => {
                    const isSelected = setData.coding.find(item => item.id === q.id);
                    return (
                      <div key={q.id} className={`p-4 mb-2 rounded border flex justify-between items-center cursor-pointer transition-colors ${isSelected ? 'bg-yellow-900/10 border-yellow-500' : 'bg-black border-gray-800 hover:border-gray-600'}`}
                        onClick={() => {
                            if(isSelected) setSetData(prev => ({...prev, coding: prev.coding.filter(i => i.id !== q.id)}));
                            else if(setData.coding.length < 2) setSetData(prev => ({...prev, coding: [...prev.coding, q]}));
                        }}
                      >
                          <div>
                            <h4 className="font-bold text-white">{q.title}</h4>
                            <div className="flex gap-2 mt-1"><span className="text-[10px] bg-gray-800 px-2 rounded">{q.difficulty}</span></div>
                          </div>
                          {isSelected ? <CheckSquare className="text-yellow-500"/> : <Plus className="text-gray-600"/>}
                      </div>
                    )
                  })}
              </div>

              {/* RIGHT: MANUAL ENTRY */}
              <div className="col-span-5 bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Add Custom Problem</h3>
                  <div className="space-y-4">
                     <input className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-yellow-500 outline-none" placeholder="Problem Title" value={manualCode.title} onChange={e => setManualCode({...manualCode, title: e.target.value})} />
                     <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-yellow-500 outline-none" value={manualCode.difficulty} onChange={e => setManualCode({...manualCode, difficulty: e.target.value})}>
                        <option>Easy</option> <option>Medium</option> <option>Hard</option>
                     </select>
                     <textarea className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-yellow-500 outline-none resize-none h-32" placeholder="Problem Description..." value={manualCode.desc} onChange={e => setManualCode({...manualCode, desc: e.target.value})} />
                     <button onClick={addManualCodingQuestion} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg flex items-center justify-center gap-2"><Plus size={16}/> Add Problem</button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700 h-1/3 overflow-y-auto">
                      <p className="text-xs text-gray-400 mb-2">Selected Problems</p>
                      {setData.coding.map((c, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-black p-2 mb-1 rounded border border-gray-800">
                          <span className="truncate w-4/5 font-bold text-white">{c.title}</span>
                          <button onClick={() => setSetData(prev => ({...prev, coding: prev.coding.filter(i => i.id !== c.id)}))}><X size={14} className="text-red-500"/></button>
                        </div>
                      ))}
                  </div>
              </div>
           </div>

           <div className="flex justify-end gap-4 border-t border-gray-800 pt-4">
              <button onClick={() => setStep(3)} className="text-gray-400 hover:text-white px-4">Back</button>
              <button onClick={handleSaveSet} disabled={loading} className="bg-[#FF4A1F] text-black px-10 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform">
                {loading ? <Loader2 className="animate-spin"/> : <Save/>} Publish Set
              </button>
           </div>
        </div>
      )}

    </div>
  );
}