import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        country: { type: String, required: true },
    },
    images: [
        { type: String }
    ],
    pricePerNight: {
        type: Number,
        required: true,
        min: [1, "Price per night must be at least 1"]
    }
    ,
    amenities: [{
        type: String,
        enum: ["WiFi", "AC", "TV", "Parking", "Pool", "Gym"]
    }]
    ,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });

propertySchema.index({ "location.city": 1 });
propertySchema.index({ pricePerNight: 1 });

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

export default Property;