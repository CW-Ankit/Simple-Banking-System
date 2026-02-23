const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const accountController = require("../controllers/account.controller")

const router = express.Router()

// (post) /api/accounts/
router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)

// (get) /api/accounts/
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountController)

// preferred: (get) /api/accounts/:accountId/balance
router.get("/:accountId/balance", authMiddleware.authMiddleware, accountController.getBalanceController)

// backward-compatible: (get) /api/accounts/balance/:accountId
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getBalanceController)

module.exports = router
