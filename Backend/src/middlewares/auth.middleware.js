const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlackListModel = require("../models/blackList.model")

async function authMiddleware(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const isBlackListed = await tokenBlackListModel.findOne({ token: token })

    if (isBlackListed) {
        return res.status(401).json({
            message: "Unauthorized Acsess. Token is Invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("+systemUser");

        req.user = user;

        next();

    } catch (err) {

        return res.status(401).json({
            message: "Unauthorized: token is invalid",
        })
    }
};

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const isBlackListed = await tokenBlackListModel.findOne({ token: token })

    if (isBlackListed) {
        return res.status(401).json({
            message: "Unauthorized Acsess. Token is Invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("+systemUser")

        if (!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden Acsess"
            })
        }

        req.user = user

        return next()

    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized access. Token is invalid."
        })
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}
