import { useState } from 'react';
import api from '../api/axiosInstance';

export default function NewReview() {
  const [mode, setMode] = useState('paste');
  const [projectName, setProjectName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'paste' && !code.trim()) {
      setMessage('Please paste some code before submitting.');
      return;
    }
    if (mode === 'upload' && !file) {
      setMessage('Please select a file before submitting.');
      return;
    }
    if (!projectName.trim()) {
      setMessage('Please enter a project name.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('project_name', projectName);
      formData.append('language', language);

      if (mode === 'paste') {
        formData.append('source_code', code);
      } else if (file) {
        formData.append('file', file);
      }

      const res = await api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Project submitted successfully!');
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">New Review</h1>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${mode === 'paste' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('paste')}
        >
          Paste Code
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === 'upload' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('upload')}
        >
          Upload File
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>

        {mode === 'paste' ? (
          <textarea
            rows={12}
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border rounded px-3 py-2 font-mono text-sm"
          />
        ) : (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="border rounded px-3 py-2"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>

        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}