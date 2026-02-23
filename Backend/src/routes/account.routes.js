const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const accountController = require("../controllers/account.controller")

const router = express.Router()

router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountController)
router.patch("/:accountId", authMiddleware.authMiddleware, accountController.updateAccountController)
router.delete("/:accountId", authMiddleware.authMiddleware, accountController.deleteAccountController)

router.get("/:accountId/balance", authMiddleware.authMiddleware, accountController.getBalanceController)
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getBalanceController)

module.exports = router
