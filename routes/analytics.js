const express = require('express');
const analyticsController = require('../controllers/analytics');
const authMiddleware = require('../middleware/auth');
const router = new express.Router();

router.get('/posts/:postId', authMiddleware, analyticsController.getPostAnalytics);

module.exports = router;