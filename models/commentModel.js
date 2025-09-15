import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    property:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text:{
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    rating:{
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;