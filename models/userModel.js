import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'host'],
        default: 'user',
        required: true
    },
    avatar: {
        type: String,
        default: function () {
            return `https://api.dicebear.com/7.x/identicon/svg?seed=${this.username}`;
        }
    },
    phone: {
        type: String,
        match: [/^[0-9]{10}$/, "Please enter a valid phone number"]
    }

}, { timestamps: true });

userSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

userSchema.statics.isValidPassword = async function (password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}


userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id, role: this.role, email: this.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

const User = mongoose.model('User', userSchema);

export default User;