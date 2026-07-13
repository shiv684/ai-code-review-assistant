// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (projectId) => {
    setAnalyzingId(projectId);
    try {
      await api.post(`/reviews/analyze/${projectId}`);
      navigate(`/results/${projectId}`);
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Check console for details.');
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading projects...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Your Projects</h1>
        <button
          onClick={() => navigate('/new-review')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Review
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-500">No projects yet. Create your first review!</p>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <h3 className="font-medium">{project.project_name}</h3>
                <p className="text-sm text-gray-500">
                  {project.language} · {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/results/${project.id}`)}
                  className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50"
                >
                  View Results
                </button>
                <button
                  onClick={() => handleAnalyze(project.id)}
                  disabled={analyzingId === project.id}
                  className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {analyzingId === project.id ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}