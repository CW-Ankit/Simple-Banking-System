const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "transaction must be taken place from an account"],
        index: true,
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "transaction must end to an account"],
        index: true,
    },
    status: {
        type: String,
        enum: {
            uppercase: true,
            values: ["PENDING", "COMPLETE", "FAILED", "REVERSED"],
            message: "Status can be pending,complete,failed or reverse",
        },
        default: "PENDING",
    },
    amount: {
        type: Number,
        required: [true, "amount is required to creating a transaction"],
        min: [0.01, "transaction amount cannot be negative or zero"]
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required for creating a transaction"],
        index: true,
        unique: true,
    },
}, {
    timestamps: true
});

const transactionModel = mongoose.model("transaction", transactionSchema)

module.exports = transactionModel
