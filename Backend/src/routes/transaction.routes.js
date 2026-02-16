const express = require("express");
const { authMiddleware, authSystemUserMiddleware } = require("../middlewares/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

// (post) /api/transactions
router.post('/', authMiddleware, transactionController.createTransaction);

// (post) /system/initial-funds
router.post('/system/initial-funds', authSystemUserMiddleware, transactionController.createInitialFunds);

module.exports = router;