const express = require("express")
const { authSystemUserMiddleware } = require("../middlewares/auth.middleware")
const adminController = require("../controllers/admin.controller")

const router = express.Router()

router.use(authSystemUserMiddleware)

router.get('/users', adminController.listUsersController)
router.post('/users', adminController.createUserController)
router.patch('/users/:userId', adminController.updateUserController)
router.delete('/users/:userId', adminController.deleteUserController)

module.exports = router
