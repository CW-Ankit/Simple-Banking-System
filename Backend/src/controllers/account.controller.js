const accountModel = require("../models/account.model")

function formatAccount(accountDoc) {
    const account = accountDoc.toObject ? accountDoc.toObject() : accountDoc

    if (account.user && typeof account.user === "object") {
        return {
            ...account,
            userId: account.user._id,
            userName: account.user.name,
            userEmail: account.user.email,
        }
    }

    return account
}

async function createAccountController(req, res) {
    const user = req.user

    const account = await accountModel.create({
        user: user._id
    })

    const populatedAccount = await accountModel.findById(account._id).populate("user", "name email")

    res.status(201).json({
        account: formatAccount(populatedAccount)
    })
}

async function getUserAccountController(req, res) {
    const accounts = await accountModel
        .find({ user: req.user._id })
        .populate("user", "name email")

    res.status(200).json({
        accounts: accounts.map(formatAccount)
    })
}

async function getBalanceController(req, res) {
    const { accountId } = req.params

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

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
    getBalanceController
}
