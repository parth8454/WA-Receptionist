import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        default: 'Customer'
    },
    lastMessage: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Prevent duplicate customers per shop
customerSchema.index({ shopId: 1, phone: 1 }, { unique: true });

export const Customer = mongoose.model('Customer', customerSchema);