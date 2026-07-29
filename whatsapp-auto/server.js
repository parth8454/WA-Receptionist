import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from '../whatsapp-auto/db.js';
import webhookRoutes from '../whatsapp-auto/routes/webhookRoutes.js';
import authRoutes from '../whatsapp-auto/routes/authRoutes.js';
import shopRoutes from '../whatsapp-auto/routes/shopRoutes.js';
import {restoreAllSessions} from './Services/baileyService.js';
import {handleIncomingMessage } from './controllers/webhookController.js';
import {startHealthCheck} from './Services/baileyService.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/shop', shopRoutes);

app.get('/', (req, res) => {
    res.status(200).send('WhatsApp SaaS Engine Server is Live 🚀');
});

restoreAllSessions((shopId, customerPhone, text)=>{
    handleIncomingMessage(shopId, customerPhone, text)      
    }
);

startHealthCheck((shopId) => {
// Reconnect dead sessions and old sessions
    createSession(
        shopId,
        (customerPhone, text) => handleIncomingMessage(shopId, customerPhone, text),
        () => {},
        () => console.log(`Revived session for shop ${shopId}`)
    );
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server configuration deployed successfully on port ${PORT}`);
});