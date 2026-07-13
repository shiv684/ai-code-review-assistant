const pool = require('../db');
const { runStaticAnalysis } = require('../services/staticAnalysis');
const { runAIReview } = require('../services/aiReview');
const { analyzeComplexity } = require('../services/complexityAnalysis');
const { calculateScore } = require('../utils/scoreCalculator');

exports.analyzeProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.userId;

  try {
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projectResult.rows[0];

    if (!project.source_code) {
      return res.status(400).json({ message: 'No source code to analyze' });
    }

    // Stage 1: static analysis
    const staticMessages = await runStaticAnalysis(project.source_code);

    // Stage 2: AI review
    const aiFindings = await runAIReview(project.source_code, project.language || 'javascript');

    // Stage 3: complexity metrics
    const complexityMetrics = analyzeComplexity(project.source_code);

    const staticFindings = staticMessages.map((msg) => ({
      severity: msg.severity === 2 ? 'critical' : 'warning',
      issue: msg.ruleId || 'unknown-rule',
      explanation: msg.message,
      suggested_fix: getSuggestedFix(msg.ruleId),
      line_number: msg.line,
    }));

    const allFindings = [...staticFindings, ...aiFindings];
    const score = calculateScore(allFindings);

    const reviewResult = await pool.query(
      `INSERT INTO reviews (project_id, review_type, overall_score, summary, complexity_metrics)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        projectId,
        'combined',
        score,
        `Found ${allFindings.length} issue(s): ${staticFindings.length} from static analysis, ${aiFindings.length} from AI review.`,
        JSON.stringify(complexityMetrics),
      ]
    );

    const review = reviewResult.rows[0];

    for (const finding of allFindings) {
      await pool.query(
        `INSERT INTO review_findings 
         (review_id, severity, issue, explanation, suggested_fix, file_name, line_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          review.id,
          finding.severity,
          finding.issue,
          finding.explanation,
          finding.suggested_fix,
          project.file_name || 'pasted-code',
          finding.line_number || null,
        ]
      );
    }

    const findingsResult = await pool.query(
      'SELECT * FROM review_findings WHERE review_id = $1 ORDER BY line_number NULLS LAST',
      [review.id]
    );

    res.status(201).json({
      review,
      findings: findingsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during analysis' });
  }
};

exports.getReview = async (req, res) => {
  const { projectId } = req.params;
  try {
    const reviewResult = await pool.query(
      'SELECT * FROM reviews WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1',
      [projectId]
    );
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ message: 'No review found' });
    }
    const review = reviewResult.rows[0];
    const findingsResult = await pool.query(
      'SELECT * FROM review_findings WHERE review_id = $1 ORDER BY line_number NULLS LAST',
      [review.id]
    );
    res.json({ review, findings: findingsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

function getSuggestedFix(ruleId) {
  const suggestions = {
    'no-unused-vars': 'Remove the unused variable or use it somewhere in the code.',
    'no-undef': 'Make sure the variable is declared before use.',
    'no-var': 'Replace "var" with "let" or "const".',
    eqeqeq: 'Use "===" instead of "==" for strict comparison.',
    semi: 'Add a semicolon at the end of the statement.',
    quotes: 'Use single quotes for string literals.',
  };
  return suggestions[ruleId] || 'Review this issue and refactor accordingly.';
}