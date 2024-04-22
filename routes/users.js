const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const usersMiddleware = require('../middleware/users');
const checkAuth = require("../middleware/auth");
const rbacMiddleware = require("../middleware/rbacMiddleware");
const multer = require('multer');
const app = express();
const storage = multer.diskStorage({ // Set up multer for file uploads
    destination: function (req, file, cb) {
        cb(null, 'public/storage/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'avatar' || file.fieldname === 'excelFile') {
            cb(null, true);
        } else {
            cb(new Error('Unexpected field'));
        }
    }
});

const upload = multer({ storage: storage });

router.get('/', usersController.index );

router.post('/register', upload.single('avatar'), usersMiddleware.validateUser, usersController.create );
router.post('/login',  usersMiddleware.validateLogin , usersController.login );
router.post('/:username',  checkAuth, usersController.user );
router.put('/me', checkAuth, usersMiddleware.validateUser, rbacMiddleware.checkPermission('update_record') , usersController.update );
router.delete('delete/:id', checkAuth, rbacMiddleware.checkPermission('remove_record'), usersController.delete );
router.delete('/:id', checkAuth, rbacMiddleware.checkPermission('remove_record'), usersController.remove ); // soft Deletes

router.post('/add-bulk', checkAuth, upload.single('excelFile'), rbacMiddleware.checkPermission('create_record') , usersController.addBulkUser );

module.exports = router;
