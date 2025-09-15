import { Router } from "express";
import { body } from "express-validator";
import { Register, login, logout, getUserProfile } from "../controller/authController.js";
import { authMiddleware } from "../middlewear/authMiddlewear.js";

const router = Router();

router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  Register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.get("/profile", authMiddleware, getUserProfile);

router.post("/logout", authMiddleware, logout);

export default router;
