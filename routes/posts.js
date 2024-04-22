const express = require('express');
const router = new express.Router();
const postsController = require('../controllers/posts');
const authMiddleware = require('../middleware/auth');
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/storage/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'attachments' || file.fieldname === 'excelFile' || file.fieldname === '') {
            cb(null, true);
        } else {
            cb(new Error('Unexpected field'));
        }
    }
});

const upload = multer({ storage: storage });

router.post('/show-posts', authMiddleware, upload.single('attachments'), postsController.createPost);
router.get('/posts/:postId', authMiddleware,  postsController.getPost);
router.put('/posts/:postId', authMiddleware, postsController.updatePost);
router.delete('/posts/:postId', authMiddleware, postsController.deletePost);

module.exports = router;
