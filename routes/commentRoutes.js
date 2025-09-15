import {Router} from 'express';
import {body} from 'express-validator';
import {authMiddleware} from "../middlewear/authMiddlewear.js";
import { addComment, deleteComment, getCommentsByProperty } from '../controller/commentController.js';
const router = Router();

router.post("/add",
    authMiddleware,
    body("propertyId").notEmpty().withMessage("Property ID is required"),
    body("text").notEmpty().withMessage("Comment text is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    addComment
);

router.get("/:propertyId", authMiddleware, getCommentsByProperty);

router.delete("/delete/:id", authMiddleware, deleteComment);



export default router;