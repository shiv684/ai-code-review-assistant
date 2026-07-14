const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  generateDocs,
  deleteProject,
} = require('../controllers/projectController');

router.post('/', authMiddleware, upload.single('file'), createProject);
router.get('/', authMiddleware, getProjects);
router.post('/:projectId/generate-docs', authMiddleware, generateDocs);
router.delete('/:projectId', authMiddleware, deleteProject);

module.exports = router;