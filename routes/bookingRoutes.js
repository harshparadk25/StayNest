import {Router} from "express";
import { body } from "express-validator";
import { createBooking, cancelBooking, getUserBookings, getBookingById, updateBooking, getHostBookings, updateBookingStatus } from "../controller/bookingController.js";
import {authMiddleware} from "../middlewear/authMiddlewear.js";

const router = Router();

router.post("/create",
    authMiddleware,
    [
        body("property").notEmpty().withMessage("Property is required"),
        body("startDate").isISO8601().withMessage("Invalid start date"),
        body("endDate").isISO8601().withMessage("Invalid end date"),
        body("rooms").isInt({ min: 1 }).withMessage("At least 1 room is required"),
        body("people").isInt({ min: 1 }).withMessage("At least 1 person is required"),
    ],
    createBooking
);

router.delete("/cancel/:id",
    authMiddleware,
    cancelBooking
);

router.get("/all",authMiddleware,getUserBookings);

router.get("/:id",authMiddleware,getBookingById);

router.put("/:id",
    authMiddleware,
    updateBooking
);

router.get("/host/bookings",authMiddleware,getHostBookings);

router.put("/:id/status",authMiddleware,updateBookingStatus);

export default router;
