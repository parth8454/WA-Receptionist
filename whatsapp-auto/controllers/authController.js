import { Shop } from '../models/Shop.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerShop = async (req, res) => {
    try {

// i got an invite code concept - because my main focus was to sell this thing to local shop
// i wanted to prevent them to register any new shop or number, hence i created an invite code that
// only i know and its required during registration.

        const { businessName, email, password, inviteCode } = req.body;

        const existingShop = await Shop.findOne({ email });
        if (existingShop) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newShop = await Shop.create({
            businessName,
            email,
            passwordHash
        });

        res.status(201).json({
            message: "Shop profile created successfully",
            shopId: newShop._id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN -------------------------------------------------------------------------------------------------

export const loginShop = async (req, res) => {
    try {
        const { email, password } = req.body;

        const shop = await Shop.findOne({ email });
        if (!shop) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, shop.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT token signed with your secret key
        const token = jwt.sign(
            { shopId: shop._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            shop: {
                id: shop._id,
                businessName: shop.businessName,
                shopDetails: shop.shopDetails  // ← add this
    }
});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};