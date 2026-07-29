import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';
import { createSession, getSession } from '../Services/baileyService.js';
import { handleIncomingMessage } from './webhookController.js';
import { Customer } from '../models/Customer.js';
import { Message } from '../models/Message.js';
import { sendMessage } from '../Services/baileyService.js';
import { Lead } from '../models/Lead.js';
import { deleteSession } from '../Services/baileyService.js';

// Called when a shop wants to connect their WhatsApp
export const connectWhatsApp = async (req, res) => {

    const { shopId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop){
        return res.status(404).json({ error: 'Shop not found' });
    }

    // If already connected
    if (getSession(shopId)) {
        return res.status(200).json({ status:'already_connected' });
    }

    // Start session, stream QR back
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.flushHeaders();

    await createSession(
        shopId,
        (customerPhone, text) => handleIncomingMessage(shopId, customerPhone, text),
            // onQR
        (qrDataURL)=>{
            console.log('yhan tk CHL rha h')
            res.write(`data: ${JSON.stringify({qr: qrDataURL})}\n\n`);
        },
            // onReady
        ()=>{
            res.write(`data: ${JSON.stringify({status:'connected'})}\n\n`);
            res.end();
        }
    );
};

// Update Meta Credentials & Groq Keys
export const updateShopSettings = async (req, res) => {
    try {
        const { 
            shopId, 
            clientGroqApiKey, 
            businessName,
            whatsappNumber,
            shopDetails 
        } = req.body;

        // Build update object — only include fields that were sent
        const updateData = {};
        if (clientGroqApiKey) updateData.clientGroqApiKey = clientGroqApiKey;
        if (businessName) updateData.businessName = businessName;
        if (whatsappNumber) updateData.whatsappNumber = whatsappNumber;
        if (shopDetails) updateData.shopDetails = shopDetails;

        const updatedShop = await Shop.findByIdAndUpdate(
            shopId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedShop) return res.status(404).json({ error: "Shop not found" });
        
        res.status(200).json({ 
            message: "Settings updated successfully",
            shop: updatedShop
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Catalog CRUD: Add Product to (idk what lol) *catalog*
export const addProduct = async (req, res) => {
    try {
            // ADD itemDescription to this destructuring line!
            const { shopId, itemName, price, itemDescription } = req.body; 

            // Now itemDescription is defined and can be saved
            const newProduct = await Product.create({ shopId, itemName, itemDescription, price });
            res.status(201).json({newProduct,message:"Added"});
        }catch (error){
            res.status(500).json({ error: error.message });
    }
};

// Catalog CRUD: Fetch Shop Inventory - our bhondu agent need catalog to anser queries
export const getShopCatalog = async (req, res) => {
    try {
        const { shopId } = req.params;
        const catalog = await Product.find({ shopId });
        res.status(200).json(catalog);
    }catch (error){
        res.status(500).json({ error: error.message });
    }
};

// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Product
export const updateProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const updated = await Product.findByIdAndUpdate(
            id,
            req.body,
            {new:true}
        );
        res.status(200).json(updated);
    }catch(error) {
        res.status(500).json({ error: error.message });
    }
};

// Send Broadcast
export const sendBroadcast = async (req, res) => {
    try {
        const { shopId, message } = req.body;

// Get all unique customers who messaged this shop -- to send them a brodcast message 
// Which they are definetly going to avoid
        const customers = await Customer.find({ shopId });

        if (customers.length === 0) {
            return res.status(400).json({ error: 'No customers found' });
        }

        // Send with delay between each to avoid ban
        let sent = 0;
        for (const customer of customers) {
            await sendMessage(shopId, customer.phone, message);
            sent++;
// 2 second delay between messages — antiban
            await new Promise(r => setTimeout(r, 2000));
        }

        res.status(200).json({ message: `Broadcast sent to ${sent} customers` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Stats
export const getStats = async (req, res) => {
    try {
        const { shopId } = req.params;

        const totalCustomers = await Customer.countDocuments({ shopId });
        const today = new Date();
        today.setHours(0,0,0,0);

        const messagesToday = await Message.countDocuments({
            shopId,
            createdAt: {$gte: today}
        });

        res.status(200).json({ totalCustomers, messagesToday });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getLeads = async (req, res) => {
    try {
        const { shopId } = req.params;
        const leads = await Lead.find({ shopId })
            .sort({ createdAt: -1 });
        res.status(200).json(leads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateLeadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await Lead.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );  
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// delete lead
export const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        await Lead.findByIdAndDelete(id);
        res.status(200).json({ message: 'Lead deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const disconnectWhatsApp = async (req, res) => {
    try {
        const { shopId } = req.body;
        await deleteSession(shopId);
        res.status(200).json({ message: 'WhatsApp disconnected' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};