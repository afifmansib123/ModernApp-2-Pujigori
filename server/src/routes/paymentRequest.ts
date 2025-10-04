import { Router } from "express";
import PaymentRequestController from '../controllers/PaymentRequestController';
import { creatorMiddleware } from '../middleware/auth';
import { validateObjectId } from '../middleware/validation';

const router = Router();

// All routes require creator authentication
router.post(
  '/',
  creatorMiddleware,
  PaymentRequestController.createPaymentRequest
);

router.get(
  '/creator',
  creatorMiddleware,
  PaymentRequestController.getCreatorPaymentRequests
);

router.get(
  '/project/:projectId',
  creatorMiddleware,
  validateObjectId('projectId'),
  PaymentRequestController.getProjectPaymentRequests
);

router.get(
  '/:id',
  creatorMiddleware,
  validateObjectId('id'),
  PaymentRequestController.getPaymentRequest
);

export default router;