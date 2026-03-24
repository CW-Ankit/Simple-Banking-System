const accountModel = require("../models/account.model")
const userModel = require("../models/user.model")
const mongoose = require("mongoose")

function generateAccountNumber() {
    const partA = Math.floor(100000 + Math.random() * 900000)
    const partB = Date.now().toString().slice(-6)
    return `${partA}${partB}`
}

async function assignAccountNumberIfMissing(accountDoc) {
    if (accountDoc.accountNumber) {
        return accountDoc
    }

    let attempts = 0
    while (attempts < 5) {
        try {
            accountDoc.accountNumber = generateAccountNumber()
            await accountDoc.save()
            return accountDoc
        } catch (error) {
            if (error?.code !== 11000) {
                throw error
            }
            attempts += 1
        }
    }

    throw new Error("Unable to generate unique account number")
}

function formatAccount(accountDoc) {
    const account = accountDoc.toObject ? accountDoc.toObject() : accountDoc

    if (account.user && typeof account.user === "object") {
        return {
            ...account,
            accountNumber: account.accountNumber || account._id?.toString(),
            userId: account.user._id,
            userName: account.user.name,
            userEmail: account.user.email,
            userSystemUser: Boolean(account.user.systemUser),
        }
    }

    return {
        ...account,
        accountNumber: account.accountNumber || account._id?.toString(),
    }
}

async function createAccountController(req, res) {
    const { userId, name, currency } = req.body

    const ownerId = req.user.systemUser && userId ? userId : req.user._id

    const owner = await userModel.findById(ownerId)
    if (!owner) {
        return res.status(404).json({ message: "Owner user not found" })
    }

    let account = await accountModel.create({
        user: ownerId,
        name: name?.trim() || "Primary Account",
        currency: currency || "INR",
    })

    account = await assignAccountNumberIfMissing(account)
    const populatedAccount = await accountModel.findById(account._id).populate("user", "name email")

    res.status(201).json({
        account: formatAccount(populatedAccount)
    })
}

async function getUserAccountController(req, res) {
    const { search = "", all = "false" } = req.query

    const shouldListAll = req.user.systemUser && all === "true"
    const filter = shouldListAll ? {} : { user: req.user._id }

    const accounts = await accountModel
        .find(filter)
        .populate("user", "name email")

    for (const account of accounts) {
        await assignAccountNumberIfMissing(account)
    }

    const searchText = search.trim().toLowerCase()
    const mapped = accounts.map(formatAccount)

    const filtered = searchText
        ? mapped.filter((account) => {
            return [
                account.name,
                account.userName,
                account.userEmail,
                account.accountNumber,
                account._id?.toString(),
            ]
                .filter(Boolean)
                .some((item) => item.toLowerCase().includes(searchText))
        })
        : mapped

    res.status(200).json({
        accounts: filtered
    })
}

async function getTransferTargetsController(req, res) {
    const { search = "" } = req.query

    const allActiveAccounts = await accountModel.find({ status: "ACTIVE" }).populate("user", "name email +systemUser")

    for (const account of allActiveAccounts) {
        await assignAccountNumberIfMissing(account)
    }

    const mapped = allActiveAccounts.map(formatAccount)
    const visible = req.user.systemUser
        ? mapped
        : mapped.filter((account) => !account.userSystemUser)

    const searchText = search.trim().toLowerCase()
    const filtered = searchText
        ? visible.filter((account) => {
            return [account.name, account.userName, account.userEmail, account.accountNumber, account._id?.toString()]
                .filter(Boolean)
                .some((item) => item.toLowerCase().includes(searchText))
        })
        : visible

    return res.status(200).json({ accounts: filtered })
}

async function updateAccountController(req, res) {
    const { accountId } = req.params
    const { name, status } = req.body

    const account = await accountModel.findById(accountId)
    if (!account) {
        return res.status(404).json({ message: "Account not found" })
    }

    if (!req.user.systemUser && account.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden access" })
    }

    if (typeof name === "string" && name.trim()) {
        account.name = name.trim()
    }

    if (req.user.systemUser && status) {
        account.status = status
    }

    await account.save()

    const populatedAccount = await accountModel.findById(account._id).populate("user", "name email")

    return res.status(200).json({ account: formatAccount(populatedAccount) })
}

async function deleteAccountController(req, res) {
    const { accountId } = req.params

    const account = await accountModel.findById(accountId)
    if (!account) {
        return res.status(404).json({ message: "Account not found" })
    }

    if (!req.user.systemUser && account.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden access" })
    }

    await accountModel.deleteOne({ _id: accountId })

    return res.status(200).json({ message: "Account deleted successfully" })
}

async function getBalanceController(req, res) {
    const { accountId } = req.params

    if (!mongoose.isValidObjectId(accountId)) {
        return res.status(400).json({ message: "Invalid account number format" })
    }

    const filter = req.user.systemUser
        ? { _id: accountId }
        : { _id: accountId, user: req.user._id }

    const account = await accountModel.findOne(filter)

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}

module.exports = {
    createAccountController,
    getUserAccountController,
    getTransferTargetsController,
    updateAccountController,
    deleteAccountController,
    getBalanceController
}
