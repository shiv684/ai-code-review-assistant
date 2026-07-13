// src/pages/Results.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';

// severity ke hisaab se colors aur labels
const severityStyles = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-700',
    badge: 'bg-red-600',
    label: 'Critical',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    badge: 'bg-yellow-500',
    label: 'Warning',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    badge: 'bg-blue-500',
    label: 'Info',
  },
};

function getScoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

export default function Results() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReview();
  }, [projectId]);

  const fetchReview = async () => {
    try {
      const res = await api.get(`/reviews/${projectId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading results...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const { review, findings } = data;

  return (
    <div className="p-6 max-w-3xl">
      <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Back to Dashboard
      </Link>

      {/* Score summary card */}
      <div className="mt-4 mb-6 bg-white border rounded-lg p-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Review Summary</h1>
          <p className="text-sm text-gray-500 mt-1">{review.summary}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(review.created_at).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(review.overall_score)}`}>
            {review.overall_score}
          </div>
          <div className="text-xs text-gray-400">out of 100</div>
        </div>
      </div>

      {/* Findings list */}
      <h2 className="text-md font-semibold mb-3">
        Findings ({findings.length})
      </h2>

      {findings.length === 0 ? (
        <p className="text-gray-500">No issues found. Clean code! 🎉</p>
      ) : (
        <div className="flex flex-col gap-3">
          {findings.map((finding) => {
            const style = severityStyles[finding.severity] || severityStyles.info;
            return (
              <div
                key={finding.id}
                className={`border rounded-lg p-4 ${style.bg} ${style.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-white text-xs px-2 py-0.5 rounded ${style.badge}`}
                    >
                      {style.label}
                    </span>
                    <span className="font-mono text-sm font-medium">
                      {finding.issue}
                    </span>
                  </div>
                  {finding.line_number && (
                    <span className="text-xs text-gray-500">
                      Line {finding.line_number}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${style.text}`}>{finding.explanation}</p>
                {finding.suggested_fix && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Suggested fix:</span>{' '}
                    {finding.suggested_fix}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}