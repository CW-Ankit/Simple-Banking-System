const express = require("express");
const { authMiddleware, authSystemUserMiddleware } = require("../middlewares/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

// (get) /api/transactions
router.get('/', authMiddleware, transactionController.getTransactions);

// (post) /api/transactions
router.post('/', authMiddleware, transactionController.createTransaction);

// (post) /api/transactions/initial-funds
router.post('/initial-funds', authSystemUserMiddleware, transactionController.createInitialFunds);

// backward-compatible path
router.post('/system/initial-funds', authSystemUserMiddleware, transactionController.createInitialFunds);

module.exports = router;
