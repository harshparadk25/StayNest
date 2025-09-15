import Booking from "../models/bookingmodule.js";
import Property from "../models/propertyModel.js";
import { validationResult } from "express-validator";

export const createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { property, startDate, endDate, rooms, people } = req.body;

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    const propertyData = await Property.findById(property);
    if (!propertyData) return res.status(404).json({ message: "Property not found" });

    const existingBookings = await Booking.find({
      property,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startDate: { $lt: new Date(endDate), $gte: new Date(startDate) } },
        { endDate: { $gt: new Date(startDate), $lte: new Date(endDate) } },
        { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(endDate) } },
      ],
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: "Selected dates are already booked" });
    }

    
    const newBooking = new Booking({
      user: req.user.id,
      property: propertyData._id,
      startDate,
      endDate,
      rooms,
      people,
      status: "pending",
    });

    await newBooking.save();

    res.status(201).json({ success: true, message: "Booking created", booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const updateBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { startDate, endDate, rooms, people } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Cannot update a cancelled booking" });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    
    const overlapping = await Booking.findOne({
      _id: { $ne: booking._id },
      property: booking.property,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startDate: { $lt: new Date(endDate), $gte: new Date(startDate) } },
        { endDate: { $gt: new Date(startDate), $lte: new Date(endDate) } },
        { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(endDate) } },
      ],
    });
    if (overlapping) return res.status(400).json({ message: "Selected dates are already booked" });


    booking.startDate = startDate;
    booking.endDate = endDate;
    booking.rooms = rooms;
    booking.people = people;
    await booking.save();

    res.status(200).json({ success: true, message: "Booking updated", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const cancelBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if(booking.status === "confirmed"){
      return res.status(400).json({ message: "Cannot cancel a confirmed booking. Please contact support." });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    const cancelledBooking = await Booking.findById(booking._id)
      .populate("property", "title location")
      .populate("user", "username email");

    res.status(200).json({ success: true, message: "Booking cancelled", booking: cancelledBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("property", "title location")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

export const getBookingById = async (req, res) => {
  try {
    
    const booking = await Booking.findById(req.params.id)
      .populate("property", "title location")
      .populate("user", "username email");
      if (booking.user._id.toString() !== req.user.id) {
  return res.status(403).json({ message: "Unauthorized" });
}
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

export const getHostBookings = async (req,res) =>{
  try {
    const properties = await Property.find({owner: req.user.id}).select('_id');
    const propertyIds = properties.map(prop => prop._id);

    if (propertyIds.length === 0) {
      return res.status(200).json({ success: true, bookings: [] });
    }

    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate("property", "title location")
      .populate("user", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
}

export const updateBookingStatus = async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { status } = req.body;
    if (!['confirmed', 'pending', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const booking = await Booking.findById(req.params.id).populate('property');
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Cannot update a cancelled booking" });
    } 
    booking.status = status;
    await booking.save();
    res.status(200).json({ success: true, message: "Booking status updated", booking });


  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
}

