const express = require('express');
const reactionController = require('../controllers/reactions'); // Adjust path as necessary
const authMiddleware = require('../middleware/auth'); // Authentication middleware

const router = new express.Router();

router.post('/', authMiddleware, reactionController.addReaction);
router.delete('/:reactionId', authMiddleware, reactionController.removeReaction);

module.exports = router;
