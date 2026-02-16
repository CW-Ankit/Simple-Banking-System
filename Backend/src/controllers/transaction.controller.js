const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const mailService = require("../services/email.service")
const mongoose = require("mongoose")
// const transactionRoutes = require("../routes/transaction.routes")

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */
async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount: rawAmount, idempotencyKey } = req.body;

    // Validate Request
    if (!fromAccount || !toAccount || !rawAmount || !idempotencyKey) {
        return res.status(400).json({ message: "Missing Fields" });
    }

    // parse and validate amount
    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
    }

    if (fromAccount === toAccount) {
        return res.status(400).json({ message: "fromAccount and toAccount must be different" });
    }

    // Load accounts (ensure these return the mongoose documents)
    const fromUserAccount = await accountModel.findById(fromAccount);
    const toUserAccount = await accountModel.findById(toAccount);

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({ message: "Invalid fromAccount or toAccount" });
    }

    // Validate Idempotency (use canonical status values)
    const existing = await transactionModel.findOne({ idempotencyKey });
    if (existing) {
        switch (existing.status) {
            case "COMPLETE":
                return res.status(200).json({ message: "Transaction already processed", transaction: existing });
            case "PENDING":
                return res.status(202).json({ message: "Transaction still processing" }); // 202 = accepted
            case "FAILED":
                return res.status(500).json({ message: "Transaction processing failed. Please retry." });
            case "REVERSED":
                return res.status(409).json({ message: "Transaction was reversed. Please retry." });
            default:
                return res.status(200).json({ message: "Transaction exists", transaction: existing });
        }
    }

    // Check Account Status
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({ message: "Both accounts must be ACTIVE" });
    }

    // Derive Sender Balance from Ledger
    const balance = await fromUserAccount.getBalance();
    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient Balance. Current Balance: ${balance}. Requested Amount: ${amount}`
        });
    }

    // Start transaction session
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Create Transaction (PENDING)
        const [transaction] = await transactionModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING",
        }], { session });

        // Ledger entries — always use the canonical ObjectId from fetched documents
        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT",
        }, {
            account: toUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "CREDIT",
        }], { session, ordered: true });

        // Optionally update account balances here if you use a denormalized balance
        // e.g. fromUserAccount.balance -= amount; await fromUserAccount.save({ session });

        // Mark transaction completed
        transaction.status = "COMPLETE";
        await transaction.save({ session });

        // Commit
        await session.commitTransaction();
        // session.endSession() will happen in finally

        // Send emails but do NOT treat mail failures as DB failures.
        // Failures here will be logged and returned as warnings, but DB is committed.
        const mailErrors = [];
        try {
            // prefer to fetch real user contact info; if account has no email, this can be undefined
            if (fromUserAccount.email) {
                await mailService.sendTransactionEmail(
                    fromUserAccount.email,
                    fromUserAccount.name || "",
                    "DEBIT",
                    amount,
                    transaction._id
                );
            }
        } catch (err) {
            console.error("Mail send error (debit):", err);
            mailErrors.push({ to: fromUserAccount.email, error: err.message });
        }

        try {
            if (toUserAccount.email) {
                await mailService.sendTransactionEmail(
                    toUserAccount.email,
                    toUserAccount.name || "",
                    "CREDIT",
                    amount,
                    transaction._id
                );
            }
        } catch (err) {
            console.error("Mail send error (credit):", err);
            mailErrors.push({ to: toUserAccount.email, error: err.message });
        }

        const responsePayload = {
            message: "Transaction completed successfully",
            transaction
        };
        if (mailErrors.length) {
            responsePayload.mailWarnings = mailErrors;
        }

        return res.status(201).json(responsePayload);

    } catch (error) {
        // If we're still in a transaction, abort it
        try {
            if (session.inTransaction()) await session.abortTransaction();
        } catch (abortErr) {
            console.error("Abort failed:", abortErr);
        }

        // Try to notify sender about failure, but don't treat that as rollback success
        try {
            if (fromUserAccount && fromUserAccount.email) {
                await mailService.sendTransactionFailureEmail(
                    fromUserAccount.email,
                    fromUserAccount.name || "",
                    amount,
                    "Internal Processing Error"
                );
            }
        } catch (mailErr) {
            console.error("Failure-notify mail error:", mailErr);
        }

        console.error("Transaction failed:", error);
        return res.status(500).json({
            message: "Transaction failed and rolled back.",
            error: error.message
        });
    } finally {
        // ensure session closed exactly once
        session.endSession();
    }
}


async function createInitialFunds(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing Fields"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System User Account Not Found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        status: "PENDING",
        idempotencyKey,
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
    }], { session })

    transaction.status = "COMPLETE"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transferred successfully",
        transaction: transaction,
    })
}

module.exports = { createTransaction, createInitialFunds };