import { validationResult } from "express-validator";
import { client, paypalSdk } from "../utils/paypal.js";
import Booking from "../models/bookingmodule.js";
import Property from "../models/propertymodel.js";

export const createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate("property");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking is not in a payable state" });
    }

    const nights =
      (new Date(booking.endDate) - new Date(booking.startDate)) /
      (1000 * 60 * 60 * 24);

    const amount = booking.property.pricePerNight * nights * booking.rooms;

    const request = new paypalSdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: booking._id.toString(),
          amount: {
            currency_code: process.env.PAYPAL_CURRENCY || "USD",
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: process.env.APP_NAME || "StayNest",
        return_url: `${process.env.CLIENT_URL}/api/payments/capture`,
        cancel_url: `${process.env.CLIENT_URL}/api/payments/cancel`,
      },
    });

    const order = await client().execute(request);
    res.status(201).json({
      success: true,
      id: order.result.id,
      links: order.result.links,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: error.message });
  }
};

export const capturePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const request = new paypalSdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client().execute(request);

    const referenceId = capture.result.purchase_units[0].reference_id;
    const booking = await Booking.findById(referenceId);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "confirmed";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment captured successfully",
      capture,
      booking,
    });
  } catch (error) {
    console.error("Error capturing payment:", error);
    res.status(500).json({ message: error.message });
  }
};
