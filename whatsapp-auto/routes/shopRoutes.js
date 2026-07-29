import express from 'express';
import { 
    updateShopSettings, 
    addProduct, 
    getShopCatalog,
    deleteProduct,
    updateProduct,
    connectWhatsApp,
    sendBroadcast,
    getStats
} from '../controllers/shopController.js';
import { requireAuth, requireSameShop } from '../Middle/auth.js';
import { getLeads, updateLeadStatus, deleteLead } from '../controllers/shopController.js';
import { disconnectWhatsApp } from '../controllers/shopController.js';



const router = express.Router();

router.delete('/leads/:id', requireAuth, deleteLead);
router.get('/connect/:shopId',  requireAuth, requireSameShop, connectWhatsApp);
router.put('/settings',         requireAuth, updateShopSettings);
router.get('/catalog/:shopId',  requireAuth, requireSameShop, getShopCatalog);
router.post('/products',        requireAuth, addProduct);
router.delete('/products/:id',  requireAuth, deleteProduct);
router.put('/products/:id',     requireAuth, updateProduct);
router.post('/broadcast',       requireAuth, sendBroadcast);
router.get('/stats/:shopId',    requireAuth, requireSameShop, getStats);

router.get('/leads/:shopId',      requireAuth, requireSameShop, getLeads);
router.put('/leads/:id',          requireAuth, updateLeadStatus);

router.post('/disconnect', requireAuth, disconnectWhatsApp);

export default router;