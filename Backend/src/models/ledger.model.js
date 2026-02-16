const mongoose =require("mongoose")

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Ledger must be associated with an account"],
        index:true,
        immutable:true,
    },
    amount:{
        type:Number,
        required:[true,"amount is required for creating an ledger entry"],
        immutable:true,
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"Ledger must be associated with an transaction"],
        index:true,
        immutable:true,
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"type can either be debit or credit"
        },
        required:[true,"ledger type is reqquired"],
        immutable:true,
    }
});

function preventLedgerModification() {
    throw new Error("Ledger Entry cannot be modified or deleted");
};

// Query hooks for all update variations
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('findByIdAndUpdate', preventLedgerModification);
ledgerSchema.pre('replaceOne', preventLedgerModification);

/** 
 * PREVENT DELETIONS 
 */
// Document hook
ledgerSchema.pre('remove', preventLedgerModification); // Deprecated in some versions but kept for safety
ledgerSchema.pre('deleteOne', { document: true, query: true }, preventLedgerModification);

// Query hooks
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findByIdAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndRemove', preventLedgerModification);

ledgerSchema.pre('bulkWrite', preventLedgerModification);

ledgerSchema.pre('findOneAndReplace', preventLedgerModification);
ledgerSchema.pre('replaceOne', preventLedgerModification);

const ledgerModel = mongoose.model('ledger',ledgerSchema);

module.exports = ledgerModel