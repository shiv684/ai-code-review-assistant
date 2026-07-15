import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import Spinner from '../components/Spinner';

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

function getComplexityColor(value) {
  if (value > 10) return 'text-red-600';
  if (value > 5) return 'text-yellow-600';
  return 'text-green-600';
}

export default function Results() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [docs, setDocs] = useState(null);
  const [generatingDocs, setGeneratingDocs] = useState(false);

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

  const handleGenerateDocs = async () => {
    setGeneratingDocs(true);
    try {
      const res = await api.post(`/projects/${projectId}/generate-docs`);
      setDocs(res.data.documentation);
    } catch (err) {
      console.error(err);
      alert('Failed to generate documentation.');
    } finally {
      setGeneratingDocs(false);
    }
  };

  if (loading) return <Spinner label="Loading results..." />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const { review, findings } = data;
  const metrics = review.complexity_metrics;

  return (
    <div className="p-6 max-w-3xl">
      <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Back to Dashboard
      </Link>

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

      {metrics && !metrics.parseError && (
        <div className="mb-6 bg-white border rounded-lg p-6">
          <h2 className="text-md font-semibold mb-4">Complexity Metrics</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{metrics.linesOfCode}</div>
              <div className="text-xs text-gray-500">Lines of Code</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{metrics.functionCount}</div>
              <div className="text-xs text-gray-500">Functions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{metrics.classCount}</div>
              <div className="text-xs text-gray-500">Classes</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getComplexityColor(metrics.averageComplexity)}`}>
                {metrics.averageComplexity}
              </div>
              <div className="text-xs text-gray-500">Avg Complexity</div>
            </div>
          </div>

          {metrics.functions.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Per-Function Complexity</h3>
              <div className="flex flex-col gap-1">
                {metrics.functions.map((fn, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600">
                    <span>
                      {fn.name} {fn.line ? `(line ${fn.line})` : ''}
                    </span>
                    <span className={fn.complexity > 10 ? 'text-red-600 font-medium' : ''}>
                      Complexity: {fn.complexity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <h2 className="text-md font-semibold mb-3">Findings ({findings.length})</h2>

      {findings.length === 0 ? (
        <p className="text-gray-500">No issues found. Clean code!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {findings.map((finding) => {
            const style = severityStyles[finding.severity] || severityStyles.info;
            return (
              <div key={finding.id} className={`border rounded-lg p-4 ${style.bg} ${style.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-white text-xs px-2 py-0.5 rounded ${style.badge}`}>
                      {style.label}
                    </span>
                    <span className="font-mono text-sm font-medium">{finding.issue}</span>
                  </div>
                  {finding.line_number && (
                    <span className="text-xs text-gray-500">Line {finding.line_number}</span>
                  )}
                </div>
                <p className={`text-sm ${style.text}`}>{finding.explanation}</p>
                {finding.suggested_fix && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Suggested fix:</span> {finding.suggested_fix}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-md font-semibold">Generated Documentation</h2>
          <button
            onClick={handleGenerateDocs}
            disabled={generatingDocs}
            className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {generatingDocs ? 'Generating...' : 'Generate Documentation'}
          </button>
        </div>

        {docs && (
          <pre className="bg-gray-900 text-gray-100 text-xs p-4 rounded overflow-x-auto whitespace-pre-wrap">
            {docs}
          </pre>
        )}
      </div>
    </div>
  );
}