const pool = require('../db');
const fs = require('fs');

// CREATE PROJECT (paste code OR uploaded file)
exports.createProject = async (req, res) => {
  const { project_name, language, source_code } = req.body;
  const userId = req.userId; // authMiddleware se aata hai

  try {
    let finalCode = source_code;
    let fileName = null;

    // agar file upload hui hai (multer se req.file milega)
    if (req.file) {
      finalCode = fs.readFileSync(req.file.path, 'utf-8');
      fileName = req.file.originalname;
    }

    if (!finalCode || finalCode.trim() === '') {
      return res.status(400).json({ message: 'No code provided' });
    }

    const result = await pool.query(
      `INSERT INTO projects (user_id, project_name, language, source_code, file_name)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, project_name || 'Untitled Project', language, finalCode, fileName]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating project' });
  }
};

// GET ALL PROJECTS FOR LOGGED-IN USER
exports.getProjects = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, project_name, language, file_name, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const { generateDocumentation } = require('../services/generateDocs');

exports.generateDocs = async (req, res) => {
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
      return res.status(400).json({ message: 'No source code to document' });
    }

    const documentation = await generateDocumentation(
      project.source_code,
      project.language || 'javascript'
    );

    const updateResult = await pool.query(
      'UPDATE projects SET documentation = $1 WHERE id = $2 RETURNING *',
      [documentation, projectId]
    );

    res.json({ documentation: updateResult.rows[0].documentation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while generating documentation' });
  }
};
exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting project' });
  }
}; 