const express = require('express');
const reactionController = require('../controllers/reactions'); // Adjust path as necessary
const multer = require('multer')
const authMiddleware = require('../middleware/auth'); // Authentication middleware
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
const router = new express.Router();

router.post('/', upload.single(''), authMiddleware, reactionController.addReaction);
router.delete('/:reactionId', authMiddleware, reactionController.removeReaction);

module.exports = router;
