import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
            required: true
        },
    customerPhone: String,
    query: String,
    // Lead.js model mein:
    type: {
            type: String,
            enum: ['appointment', 'order', 'general'],
            default: 'general'
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'done'],
        default: 'new'
    }
}, { timestamps: true });

// expire after 2 days
leadSchema.index({ createdAt: 1 }, { expireAfterSeconds: 172800 });

export const Lead = mongoose.model('Lead', leadSchema);

