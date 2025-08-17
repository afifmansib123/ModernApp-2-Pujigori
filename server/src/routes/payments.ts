import { Router } from 'express';
import PaymentController from '../controllers/PaymentController';
// import { authMiddleware, adminMiddleware } from '../middleware/auth'; // TODO: Implement auth middleware
// import { validatePaymentInitiate } from '../middleware/validation'; // TODO: Implement validation

const router = Router();

// Public payment routes
router.post('/initiate', PaymentController.initiatePayment);
router.get('/methods', PaymentController.getPaymentMethods);
router.get('/:transactionId/status', PaymentController.getPaymentStatus);

// SSLCommerz callback routes (webhooks)
router.post('/success', PaymentController.handlePaymentSuccess);
router.post('/fail', PaymentController.handlePaymentFail);
router.post('/cancel', PaymentController.handlePaymentCancel);
router.post('/webhook', PaymentController.handleWebhook);

// Admin routes (require admin authentication)
// router.get('/statistics', adminMiddleware, PaymentController.getPaymentStatistics);
// router.post('/:transactionId/refund', adminMiddleware, PaymentController.initiateRefund);
// router.post('/verify', adminMiddleware, PaymentController.verifyPayment);

// Temporary admin routes for development (remove when auth is integrated)
router.get('/statistics', PaymentController.getPaymentStatistics);
router.post('/:transactionId/refund', PaymentController.initiateRefund);
router.post('/verify', PaymentController.verifyPayment);

export default router;