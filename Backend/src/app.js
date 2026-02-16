const express = require("express");

const cookieParser = require("cookie-parser")

// Middlewares
const app = express();
app.use(express.json())
app.use(cookieParser())

// Routes Imported
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes")

// User Routes
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRoutes)

module.exports = app;