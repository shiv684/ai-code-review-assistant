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