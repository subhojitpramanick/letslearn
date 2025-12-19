import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // 1. Get the session directly from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("No active session. Please log in.");
    }

    // 2. Access the access_token (JWT)
    const token = session.access_token;
        // FIX 1: Use backticks for the template literal
        // FIX 2: Ensure path matches your api/students/list-questions.step.js config
        // VITE SYNTAX: Use import.meta.env.VITE_NAME
        const baseUrl = import.meta.env.VITE_MOTIA_URL || '';
        const apiUrl = `${baseUrl}/api/student/questions`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // If the server returns HTML (like a 404), this check will catch it
        if (!response.ok) {
           const errorText = await response.text();
           console.error("Server returned non-ok status:", errorText);
           throw new Error(`Server Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Match the body structure from your list-questions.step.js
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-600">Loading your questions...</div>;
  if (error) return (
    <div className="p-8 text-center text-red-500">
      <p className="font-bold">Failed to load questions</p>
      <p className="text-sm">{error}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Available Practice Problems</h1>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          {questions.length} Questions Found
        </span>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Problem</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rewards</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {questions.map((q) => (
              <tr key={q._id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <a 
                      href={q.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
                    >
                      {q.title}
                    </a>
                    <span className="text-xs text-gray-400 mt-1 uppercase font-medium">{q.platform}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getDifficultyColor(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col text-sm space-y-1">
                    <span className="flex items-center text-amber-600 font-medium">
                      <span className="mr-1.5">🪙</span> {q.coinReward} Coins
                    </span>
                    <span className="flex items-center text-purple-600 font-medium">
                      <span className="mr-1.5">⭐</span> {q.xpReward} XP
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={q.status || 'Unsolved'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {questions.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg italic">No questions have been assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const getDifficultyColor = (level) => {
  switch (level) {
    case 'Easy': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'Medium': return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'Hard': return 'bg-rose-100 text-rose-700 border border-rose-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const StatusBadge = ({ status }) => {
  const styles = {
    'Solved': 'bg-emerald-500 text-white shadow-emerald-200',
    'Attempted': 'bg-sky-500 text-white shadow-sky-200',
    'Unsolved': 'bg-slate-200 text-slate-500'
  };
  return (
    <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm ${styles[status] || styles['Unsolved']}`}>
      {status}
    </span>
  );
};

export default QuestionList;