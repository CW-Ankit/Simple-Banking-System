const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const mailService = require("../services/email.service")
const mongoose = require("mongoose")

function buildAccountSummary(account) {
    if (!account) {
        return null
    }

    const normalized = account.toObject ? account.toObject() : account
    const user = normalized.user && typeof normalized.user === "object" ? normalized.user : null

    return {
        _id: normalized._id,
        accountNumber: normalized.accountNumber || normalized._id?.toString(),
        status: normalized.status,
        currency: normalized.currency,
        userId: user ? user._id : normalized.user,
        userName: user ? user.name : undefined,
        userEmail: user ? user.email : undefined,
        userSystemUser: Boolean(user?.systemUser),
        name: normalized.name,
    }
}

function maskSystemAccountForRegularUser(accountSummary, requester) {
    if (!accountSummary || requester?.systemUser || !accountSummary.userSystemUser) {
        return accountSummary
    }

    return {
        ...accountSummary,
        userId: undefined,
        userName: "Cash Deposit",
        userEmail: undefined,
        accountNumber: "Cash Deposit",
        name: "Cash Deposit",
    }
}

async function findAccountByNumberOrId(accountInput) {
    if (!accountInput) return null

    let account = await accountModel.findOne({ accountNumber: accountInput }).populate("user", "name email")
    if (account) return account

    if (mongoose.isValidObjectId(accountInput)) {
        account = await accountModel.findById(accountInput).populate("user", "name email")
        if (account) return account
    }

    return null
}

async function getTransactions(req, res) {
    const userAccounts = await accountModel.find({ user: req.user._id }).select("_id")
    const userAccountIds = userAccounts.map((account) => account._id)

    if (!req.user.systemUser && !userAccountIds.length) {
        return res.status(200).json({ transactions: [] })
    }

    const query = req.user.systemUser
        ? {}
        : {
            $or: [
                { fromAccount: { $in: userAccountIds } },
                { toAccount: { $in: userAccountIds } },
            ],
        }

    const transactions = await transactionModel
        .find(query)
        .sort({ createdAt: -1 })
        .lean()

    const allAccountIds = [
        ...new Set(
            transactions
                .flatMap((transaction) => [transaction.fromAccount, transaction.toAccount])
                .map((id) => id.toString())
        ),
    ]

    const relatedAccounts = await accountModel
        .find({ _id: { $in: allAccountIds } })
        .populate("user", "name email +systemUser")

    const accountMap = new Map(relatedAccounts.map((account) => [account._id.toString(), account]))

    const enrichedTransactions = transactions.map((transaction) => ({
        ...transaction,
        fromAccount: maskSystemAccountForRegularUser(
            buildAccountSummary(accountMap.get(transaction.fromAccount.toString())),
            req.user
        ),
        toAccount: maskSystemAccountForRegularUser(
            buildAccountSummary(accountMap.get(transaction.toAccount.toString())),
            req.user
        ),
    }))

    return res.status(200).json({ transactions: enrichedTransactions })
}

async function createTransaction(req, res) {
    const { fromAccount, toAccount: toAccountInput, amount: rawAmount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccountInput || !rawAmount || !idempotencyKey) {
        return res.status(400).json({ message: "Missing Fields" });
    }

    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
    }

    if (!mongoose.isValidObjectId(fromAccount)) {
        return res.status(400).json({ message: "Invalid sender account" });
    }

    const fromUserAccount = await accountModel.findById(fromAccount).populate("user", "name email");
    const toUserAccount = await findAccountByNumberOrId(String(toAccountInput).trim());

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({ message: "Invalid fromAccount or toAccount" });
    }

    if (fromUserAccount._id.toString() === toUserAccount._id.toString()) {
        return res.status(400).json({ message: "fromAccount and toAccount must be different" });
    }

    const fromOwnerId = fromUserAccount.user?._id ? fromUserAccount.user._id.toString() : fromUserAccount.user.toString()
    if (!req.user.systemUser && fromOwnerId !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only transfer funds from your own account" });
    }

    const existing = await transactionModel.findOne({ idempotencyKey });
    if (existing) {
        switch (existing.status) {
            case "COMPLETE":
                return res.status(200).json({ message: "Transaction already processed", transaction: existing });
            case "PENDING":
                return res.status(202).json({ message: "Transaction still processing" });
            case "FAILED":
                return res.status(500).json({ message: "Transaction processing failed. Please retry." });
            case "REVERSED":
                return res.status(409).json({ message: "Transaction was reversed. Please retry." });
            default:
                return res.status(200).json({ message: "Transaction exists", transaction: existing });
        }
    }

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({ message: "Both accounts must be ACTIVE" });
    }

    const balance = await fromUserAccount.getBalance();
    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient Balance. Current Balance: ${balance}. Requested Amount: ${amount}`
        });
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const [transaction] = await transactionModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING",
        }], { session });

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

        transaction.status = "COMPLETE";
        await transaction.save({ session });

        await session.commitTransaction();

        const mailErrors = [];
        try {
            if (fromUserAccount.user?.email) {
                await mailService.sendTransactionEmail(
                    fromUserAccount.user.email,
                    fromUserAccount.user.name || "",
                    "DEBIT",
                    amount,
                    transaction._id
                );
            }
        } catch (err) {
            mailErrors.push({ to: fromUserAccount.user?.email, error: err.message });
        }

        try {
            if (toUserAccount.user?.email) {
                await mailService.sendTransactionEmail(
                    toUserAccount.user.email,
                    toUserAccount.user.name || "",
                    "CREDIT",
                    amount,
                    transaction._id
                );
            }
        } catch (err) {
            mailErrors.push({ to: toUserAccount.user?.email, error: err.message });
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
        try {
            if (session.inTransaction()) await session.abortTransaction();
        } catch (abortErr) {
            console.error("Abort failed:", abortErr);
        }

        try {
            if (fromUserAccount?.user?.email) {
                await mailService.sendTransactionFailureEmail(
                    fromUserAccount.user.email,
                    fromUserAccount.user.name || "",
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
        session.endSession();
    }
}


async function createInitialFunds(req, res) {
    const { toAccount: toAccountInput, amount, idempotencyKey } = req.body

    if (!toAccountInput || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing Fields"
        })
    }

    const existing = await transactionModel.findOne({ idempotencyKey })
    if (existing) {
        return res.status(200).json({
            message: "Initial funds transaction already processed",
            transaction: existing,
        })
    }

    const toUserAccount = await findAccountByNumberOrId(String(toAccountInput).trim())

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

    try {
        session.startTransaction()

        const transaction = await transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            amount,
            status: "PENDING",
            idempotencyKey,
        })

        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT",
        }], { session })

        await ledgerModel.create([{
            account: toUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT",
        }], { session })

        transaction.status = "COMPLETE"
        await transaction.save({ session })

        await session.commitTransaction()

        return res.status(201).json({
            message: "Initial funds transferred successfully",
            transaction: transaction,
        })
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction()
        }

        return res.status(500).json({
            message: "Initial funds transfer failed",
            error: error.message,
        })
    } finally {
        session.endSession()
    }
}

module.exports = { getTransactions, createTransaction, createInitialFunds };
