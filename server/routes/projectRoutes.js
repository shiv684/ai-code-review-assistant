const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const { createProject, getProjects } = require('../controllers/projectController');

// upload.single('file') → optional file field, agar paste kiya hai to file nahi aayegi
router.post('/', authMiddleware, upload.single('file'), createProject);
router.get('/', authMiddleware, getProjects);

module.exports = router;