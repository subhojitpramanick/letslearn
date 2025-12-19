import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
const AddQuestionPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    platform: 'LeetCode',
    difficulty: 'Easy',
    companyTags: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
        if (sessionError || !session) {
          throw new Error("No active session. Please log in.");
        }
        const token = session.access_token;
            const baseUrl = import.meta.env.VITE_MOTIA_URL || '';
            const apiUrl = `${baseUrl}/api/teacher/questions`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Send the raw question data; the backend will calculate rewards
        body: JSON.stringify({
          ...formData,
          companyTags: formData.companyTags.split(',').map(tag => tag.trim())
        })
      });

      if (response.status === 202) {
        setMessage({ type: 'success', text: 'Question received and is being processed!' });
        setFormData({ title: '', link: '', platform: 'LeetCode', difficulty: 'Easy', companyTags: '' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add question');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Add New Question</h2>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Question Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="e.g. Two Sum"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Question Link</label>
          <input
            type="url"
            name="link"
            required
            value={formData.link}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="https://leetcode.com/problems/..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Platform</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="LeetCode">LeetCode</option>
              <option value="GeeksforGeeks">GeeksforGeeks</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Company Tags (Optional)</label>
          <input
            type="text"
            name="companyTags"
            value={formData.companyTags}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Amazon, Google, Microsoft (comma separated)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-bold py-2 px-4 rounded transition ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loading ? 'Processing...' : 'Add Question'}
        </button>
      </form>
    </div>
  );
};

export default AddQuestionPage;