const express = require('express');
const productsController = require("../controllers/products");
const productsMiddleware = require("../middleware/products");
const checkAuth = require("../middleware/auth");
const rbacMiddleware = require("../middleware/rbacMiddleware");
const router = express.Router();
const multer = require("multer");
const upload = multer({
    dest: 'public/uploads',
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'avatar') {
            cb(null, true);
        } else {
            cb(new Error('Unexpected field'));
        }
    }
});


router.get('/', productsController.index );
router.post('/create', checkAuth, rbacMiddleware.checkPermission('create_record'),upload.single('avatar'), productsController.create );
router.patch('/:id', checkAuth, rbacMiddleware.checkPermission('update_record'), productsMiddleware.validateProduct, productsController.update );
router.delete('/delete/:id', checkAuth, rbacMiddleware.checkPermission('delete_record'), productsController.delete ); // Permanent delete
router.delete('/:id', checkAuth, rbacMiddleware.checkPermission('remove_record'), productsController.remove ); // soft delete


router.get('/search', checkAuth, rbacMiddleware.checkPermission('read_record'), productsController.search ); // soft delete


module.exports = router