const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required for creating a user account"],
        trim: true,
        lowercase: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please enter a valid email address.'
        ],
        unique: [true, "email already exist"]
    },
    name: {
        type: String,
        required: [true, "name is required for creating a user account"]
    },
    password: {
        type: String,
        required: [true, "password is required for creating a user account"],
        minlength: [6, "password should be more than 6 charcters"],
        select: false,
    },
    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false,
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    return
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("user", userSchema)

module.exports = userModel