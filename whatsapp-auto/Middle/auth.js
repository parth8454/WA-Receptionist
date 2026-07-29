import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token && req.query.token) {
        token = req.query.token;
    }
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.shopId = decoded.shopId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireSameShop = (req, res, next) => {
    const shopId = req.params.shopId;
    if (shopId && shopId !== req.shopId) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};