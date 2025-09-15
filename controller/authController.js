import User from '../models/userModel.js';
import { validationResult } from 'express-validator';

export const Register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const { username, email, password, role, avatar, phone } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with this email or username already exists" });
        }
        const hashedPassword = await User.hashPassword(password);
        const seed = Math.random().toString(36).substring(2, 15);
        const avatarUrl = avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
            avatar: avatarUrl,
            phone
        });

        await newUser.save();
        const token = newUser.generateAuthToken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            success: true,
            token,
            message: "User registered successfully",
            user: {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                avatar: newUser.avatar,
                phone: newUser.phone
            }
        });

    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { email, password } = req.body;


        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isValid = await User.isValidPassword(password, user.password);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }


        const token = user.generateAuthToken();


        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            token,
            message: "Logged in successfully",
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone
            }
        });

    } catch (error) {
        next(error);
    }
};

export const getUserProfile = async (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user
    });
};

export const logout = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Already logged out"
        });
    }

    res.clearCookie("token");
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

