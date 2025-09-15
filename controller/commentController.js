import Comment from "../models/commentModel.js";
import { validationResult } from "express-validator";
import Property from "../models/propertyModel.js";
import User from "../models/userModel.js";

export const addComment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { propertyId, text, rating } = req.body;
        const userId = req.user.id;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const existingComment = await Comment.findOne({ property: propertyId, user: userId });
        if (existingComment) {
            return res.status(400).json({ success: false, message: "You have already commented on this property" });
        }


        const newComment = new Comment({
            property: propertyId,
            user: userId,
            text,
            rating
        });

        await newComment.save();
        const populatedComment = await newComment.populate("user", "username email");

        res.status(201).json({
            success: true,
            message: "Comment added",
            comment: populatedComment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getCommentsByProperty = async (req, res) => {
    try {
        const comments = await Comment.find({ property: req.params.propertyId })
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await comment.deleteOne();

        res.status(200).json({ success: true, message: "Comment deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
