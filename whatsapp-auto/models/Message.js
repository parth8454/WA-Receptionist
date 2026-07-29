import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: true
    }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);    