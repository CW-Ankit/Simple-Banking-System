const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const accountController = require("../controllers/account.controller")

const router = express.Router()

// (post) /api/accounts/
// Protected

router.post("/", authMiddleware.authMiddleware,accountController.createAccountController)

// (get) /api/accounts/
// Protected

router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountController)

// (get) /api/accounts/balance/:accountId
router.get("/balance/:accountId",authMiddleware.authMiddleware, accountController.getBalanceController)

module.exports = router