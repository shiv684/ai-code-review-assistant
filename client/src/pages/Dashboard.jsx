import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
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

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm('Delete this project and all its reviews? This cannot be undone.');
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
    }
  };

  // derive available languages from existing projects, for the filter dropdown
  const availableLanguages = [...new Set(projects.map((p) => p.language).filter(Boolean))];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.project_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLanguage =
      languageFilter === 'all' || project.language === languageFilter;
    return matchesSearch && matchesLanguage;
  });

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

      {/* Search and filter bar */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by project name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All languages</option>
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <p className="text-gray-500">
          {projects.length === 0
            ? 'No projects yet. Create your first review!'
            : 'No projects match your search.'}
        </p>
      ) : (
        <div className="grid gap-3">
          {filteredProjects.map((project) => (
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
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-sm px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}