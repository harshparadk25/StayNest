import Booking from "../models/bookingmodule.js";
import Property from "../models/propertymodel.js";
import { validationResult } from "express-validator";


export const createProperty = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try {
        const { title, description, location, images, pricePerNight, amenities } = req.body;

        const newProperty = new Property({
            title,
            description,
            location,
            images: images || [],
            pricePerNight,
            amenities: amenities || [],
            owner: req.user.id,
            bookedDates: []
        });

        await newProperty.save();
        res.status(201).json(newProperty);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};


export const getProperties = async (req, res) => {
  try {
    const { search, city, minPrice, maxPrice, amenities, sort, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (city) filter['location.city'] = city;

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    if (amenities) {
      const amenitiesArray = amenities.split(',').map(a => a.trim());
      filter.amenities = { $all: amenitiesArray };
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Sorting
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'nameAsc':
          sortOption.title = 1; // A → Z
          break;
        case 'nameDesc':
          sortOption.title = -1; // Z → A
          break;
        case 'priceAsc':
          sortOption.pricePerNight = 1; // low → high
          break;
        case 'priceDesc':
          sortOption.pricePerNight = -1; // high → low
          break;
        default:
          sortOption.createdAt = -1; // default: newest first
      }
    } else {
      sortOption.createdAt = -1; // default: newest first
    }

    const properties = await Property.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOption)
      .populate('owner', 'username email');

    const total = await Property.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      page: Number(page),
      totalPages,
      totalResults: total,
      results: properties
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};




export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'username email');
    if (!property) return res.status(404).json({ message: "Property not found" });

    
    const bookings = await Booking.find({
      property: property._id,
      status: { $in: ["pending", "confirmed"] }
    }).select("startDate endDate -_id");

    res.status(200).json({
      ...property.toObject(),
      bookedDates: bookings,  
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateProperty = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (property.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        
        property.title = req.body.title || property.title;
        property.description = req.body.description || property.description;
        property.location = req.body.location || property.location;
        property.pricePerNight = req.body.pricePerNight || property.pricePerNight;
        property.amenities = req.body.amenities || property.amenities;
        property.images = req.body.images || property.images;

        const updatedProperty = await property.save();
        res.status(200).json(updatedProperty);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deleteProperty = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        
        if (property.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await property.deleteOne();
        res.status(200).json({ message: "Property deleted successfully" });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};


export const getHostProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id }).populate('owner', 'username email');

    const enriched = await Promise.all(properties.map(async (property) => {
      const bookings = await Booking.find({
        property: property._id,
        status: { $in: ["pending", "confirmed"] }
      }).select("startDate endDate -_id");

      return {
        ...property.toObject(),
        bookedDates: bookings,
      };
    }));

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



