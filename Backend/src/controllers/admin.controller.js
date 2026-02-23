const userModel = require("../models/user.model")
const accountModel = require("../models/account.model")

async function listUsersController(req, res) {
    const { search = "" } = req.query

    const text = search.trim()
    const filter = text
        ? {
            $or: [
                { name: { $regex: text, $options: "i" } },
                { email: { $regex: text, $options: "i" } },
            ],
        }
        : {}

    const users = await userModel.find(filter).select("name email createdAt")

    res.status(200).json({ users })
}

async function createUserController(req, res) {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ message: "name, email and password are required" })
    }

    const existing = await userModel.findOne({ email })
    if (existing) {
        return res.status(409).json({ message: "user already exists" })
    }

    const user = await userModel.create({ name, email, password })
    return res.status(201).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        }
    })
}

async function updateUserController(req, res) {
    const { userId } = req.params
    const { name, email } = req.body

    const user = await userModel.findById(userId).select("+systemUser")
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    if (user.systemUser) {
        return res.status(400).json({ message: "System user cannot be updated" })
    }

    if (typeof name === "string" && name.trim()) {
        user.name = name.trim()
    }

    if (typeof email === "string" && email.trim()) {
        user.email = email.trim().toLowerCase()
    }

    await user.save()

    return res.status(200).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        }
    })
}

async function deleteUserController(req, res) {
    const { userId } = req.params

    const user = await userModel.findById(userId).select("+systemUser")
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    if (user.systemUser) {
        return res.status(400).json({ message: "System user cannot be deleted" })
    }

    await accountModel.deleteMany({ user: user._id })
    await userModel.deleteOne({ _id: user._id })

    return res.status(200).json({ message: "User deleted successfully" })
}

module.exports = {
    listUsersController,
    createUserController,
    updateUserController,
    deleteUserController,
}
