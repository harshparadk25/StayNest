import express from 'express';

import { createPayment , capturePayment } from '../controller/paymentController.js';
import {authMiddleware} from "../middlewear/authMiddlewear.js";

const router = express.Router();
router.post('/create', authMiddleware, createPayment);
router.post('/capture', authMiddleware, capturePayment);

export default router;