import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
    businessName: { 
        type: String, 
        required: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: { 
        type: String, 
        required: true 
    },
    // instead of meta-api i am using bailey
    whatsappNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
    },

    isWhatsappConnected: {
    type: Boolean,
    default: false
    },
    // Isolated Client-Billed AI Key
    clientGroqApiKey: { 
        type: String, 
        default: null,
        trim: true
    },
    // Add to shopSchema:
    shopDetails: {
    address: { type: String, default: '' },
    openingHours: { type: String, default: '9AM - 9PM' },
    closingDays: { type: String, default: 'None' },
    receptionNumber: { type: String, default: '' },
    about: { type: String, default: '' },
    instagram: { type: String, default: '' },
}
}, { timestamps: true });

export const Shop = mongoose.model('Shop', shopSchema);