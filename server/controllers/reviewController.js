const pool = require('../db');
const { runStaticAnalysis } = require('../services/staticAnalysis');
const { calculateScore } = require('../utils/scoreCalculator');

exports.analyzeProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.userId;

  try {
    // pehle confirm karo project isi user ka hai (security check)
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

    // Stage 1: static analysis chalao
    const messages = await runStaticAnalysis(project.source_code);
    const score = calculateScore(messages);

    // review record banao
    const reviewResult = await pool.query(
      `INSERT INTO reviews (project_id, review_type, overall_score, summary)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        projectId,
        'static',
        score,
        `Found ${messages.length} issue(s) via static analysis.`,
      ]
    );

    const review = reviewResult.rows[0];

    // har issue ko review_findings mein insert karo
    for (const msg of messages) {
      await pool.query(
        `INSERT INTO review_findings 
         (review_id, severity, issue, explanation, suggested_fix, file_name, line_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          review.id,
          msg.severity === 2 ? 'critical' : 'warning',
          msg.ruleId || 'unknown-rule',
          msg.message,
          getSuggestedFix(msg.ruleId), // helper function niche
          project.file_name || 'pasted-code',
          msg.line,
        ]
      );
    }

    // saari findings wapas fetch karke bhejo response mein
    const findingsResult = await pool.query(
      'SELECT * FROM review_findings WHERE review_id = $1 ORDER BY line_number',
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

// GET past review for a project
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
      'SELECT * FROM review_findings WHERE review_id = $1 ORDER BY line_number',
      [review.id]
    );

    res.json({ review, findings: findingsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// chhota helper — kuch common rules ke liye generic suggestion
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