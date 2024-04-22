const express = require('express');
const ordersController = require("../controllers/orders");
const ordersMiddleware = require("../middleware/orders");
const checkAuth = require("../middleware/auth");
const rbacMiddleware = require("../middleware/rbacMiddleware");
const router = express.Router();

router.get('/', checkAuth, ordersController.index );
router.post('/create/:id', checkAuth, rbacMiddleware.checkPermission('create_record'), ordersMiddleware.validateOrder, ordersController.create );
router.patch('/:id', checkAuth, rbacMiddleware.checkPermission('update_record'), ordersMiddleware.validateOrder, ordersController.update );
router.delete('delete/:id', checkAuth, rbacMiddleware.checkPermission('delete_record'), ordersController.delete ); // Permanent delete
router.delete('/:id', checkAuth, rbacMiddleware.checkPermission('remove_record'), ordersController.remove ); // soft delete


module.exports = router;
