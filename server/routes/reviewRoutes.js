const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { analyzeProject, getReview } = require('../controllers/reviewController');

router.post('/analyze/:projectId', authMiddleware, analyzeProject);
router.get('/:projectId', authMiddleware, getReview);

module.exports = router;