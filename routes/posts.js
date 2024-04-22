// postRoutes.js
const express = require('express');
const router = new express.Router();
const postController = require('../controllers/posts'); // Adjust path as necessary
const authMiddleware = require('../middleware/auth'); // Assuming you have authentication middleware


router.post('/posts', authMiddleware, postController.createPost);
router.get('/posts/:postId', authMiddleware, postController.getPost);
router.put('/posts/:postId', authMiddleware, postController.updatePost);
router.delete('/posts/:postId', authMiddleware, postController.deletePost);

module.exports = router;
