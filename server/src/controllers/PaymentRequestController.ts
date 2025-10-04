import { Request, Response, NextFunction } from 'express';
import PaymentRequest from '../models/PaymentRequest';
import Project from '../models/Project';
import Donation from '../models/Donation';
import User from '../models/User';
import { ResponseUtils, ValidationUtils } from '../utils';
import { PaymentRequestStatus, PaymentStatus } from '../types';

class PaymentRequestController {
  /**
   * POST /api/payment-requests
   * Create payment request (creator only)
   * this payment request is the creator of the project sending a request to the masteradmin for withdrawal of money
   */
  async createPaymentRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId, requestedAmount, bankDetails } = req.body;
      const cognitoId = req.user?.id;

      if (!cognitoId) {
        res.status(401).json(ResponseUtils.error('Authentication required'));
        return;
      }

      // Get MongoDB user ID from Cognito ID
      const user = await User.findOne({ cognitoId });
      if (!user) {
        res.status(404).json(ResponseUtils.error('User not found'));
        return;
      }

      // Validate project
      if (!ValidationUtils.isValidObjectId(projectId)) {
        res.status(400).json(ResponseUtils.error('Invalid project ID'));
        return;
      }

      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json(ResponseUtils.error('Project not found'));
        return;
      }

      // Check project ownership
      if (project.creator.toString() !== user._id.toString()) {
        res.status(403).json(ResponseUtils.error('You do not own this project'));
        return;
      }

      // Get total raised and available amount
      const donationStats = await Donation.aggregate([
        {
          $match: {
            project: project._id,
            paymentStatus: PaymentStatus.SUCCESS
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalNetAmount: { $sum: '$netAmount' }, // Amount after 5% fee
            totalAdminFee: { $sum: '$adminFee' }
          }
        }
      ]);

      const availableAmount = donationStats[0]?.totalNetAmount || 0;

      // Validate requested amount
      if (requestedAmount <= 0) {
        res.status(400).json(ResponseUtils.error('Requested amount must be greater than 0'));
        return;
      }

      if (requestedAmount > availableAmount) {
        res.status(400).json(ResponseUtils.error(
          `Requested amount (BDT ${requestedAmount}) exceeds available funds (BDT ${availableAmount})`
        ));
        return;
      }

      // Check for pending requests
      const pendingRequest = await PaymentRequest.findOne({
        project: projectId,
        status: PaymentRequestStatus.PENDING
      });

      if (pendingRequest) {
        res.status(400).json(ResponseUtils.error(
          'You already have a pending payment request for this project'
        ));
        return;
      }

      // Validate bank details
      if (!bankDetails.accountHolder || !bankDetails.bankName || 
          !bankDetails.accountNumber || !bankDetails.branchName) {
        res.status(400).json(ResponseUtils.error(
          'Complete bank details required: accountHolder, bankName, accountNumber, branchName'
        ));
        return;
      }

      // Calculate admin fee (already deducted in donations, but track it)
      const adminFeeDeducted = donationStats[0]?.totalAdminFee || 0;

      // Create payment request
      const paymentRequest = new PaymentRequest({
        creator: user._id,
        project: projectId,
        requestedAmount,
        adminFeeDeducted,
        netAmount: requestedAmount, // Creator requests the net amount
        status: PaymentRequestStatus.PENDING,
        bankDetails: {
          accountHolder: bankDetails.accountHolder.trim(),
          bankName: bankDetails.bankName.trim(),
          accountNumber: bankDetails.accountNumber.trim(),
          routingNumber: bankDetails.routingNumber?.trim() || '',
          branchName: bankDetails.branchName.trim()
        }
      });

      await paymentRequest.save();

      res.status(201).json(ResponseUtils.success(
        'Payment request submitted successfully. Admin will review your request.',
        {
          paymentRequest : paymentRequest.toObject(),
          availableAmount
        }
      ));

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payment-requests/project/:projectId
   * Get payment requests for a project (creator only)  ----->>> project wise payment requests for withdraw
   */
  async getProjectPaymentRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId } = req.params;
      const cognitoId = req.user?.id;

      if (!cognitoId) {
        res.status(401).json(ResponseUtils.error('Authentication required'));
        return;
      }

      const user = await User.findOne({ cognitoId });
      if (!user) {
        res.status(404).json(ResponseUtils.error('User not found'));
        return;
      }

      if (!ValidationUtils.isValidObjectId(projectId)) {
        res.status(400).json(ResponseUtils.error('Invalid project ID'));
        return;
      }

      // Verify ownership
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json(ResponseUtils.error('Project not found'));
        return;
      }

      if (project.creator.toString() !== user._id.toString()) {
        res.status(403).json(ResponseUtils.error('Access denied'));
        return;
      }

      const paymentRequests = await PaymentRequest.find({ project: projectId })
        .sort({ createdAt: -1 })
        .populate('project', 'title slug');

      res.json(ResponseUtils.success(
        'Payment requests retrieved successfully',
        paymentRequests
      ));

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payment-requests/creator
   * Get all payment requests for logged-in creator   ------>>> all withdrawal requests of creator
   */
  async getCreatorPaymentRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cognitoId = req.user?.id;

      if (!cognitoId) {
        res.status(401).json(ResponseUtils.error('Authentication required'));
        return;
      }

      const user = await User.findOne({ cognitoId });
      if (!user) {
        res.status(404).json(ResponseUtils.error('User not found'));
        return;
      }

      const { page = 1, limit = 20, status } = req.query;

      const query: any = { creator: user._id };
      if (status) {
        query.status = status;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [requests, total] = await Promise.all([
        PaymentRequest.find(query)
          .populate('project', 'title slug')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        PaymentRequest.countDocuments(query)
      ]);

      const meta = ResponseUtils.createPaginationMeta(total, Number(page), Number(limit));

      res.json(ResponseUtils.success(
        'Payment requests retrieved successfully',
        requests,
        meta
      ));

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payment-requests/:id
   * Get single payment request details ----->>> single withdrawal request of creators
   */
  async getPaymentRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const cognitoId = req.user?.id;

      if (!cognitoId) {
        res.status(401).json(ResponseUtils.error('Authentication required'));
        return;
      }

      if (!ValidationUtils.isValidObjectId(id)) {
        res.status(400).json(ResponseUtils.error('Invalid payment request ID'));
        return;
      }

      const paymentRequest = await PaymentRequest.findById(id)
        .populate('project', 'title slug currentAmount');

      if (!paymentRequest) {
        res.status(404).json(ResponseUtils.error('Payment request not found'));
        return;
      }

      res.json(ResponseUtils.success(
        'Payment request retrieved successfully',
        paymentRequest
      ));

    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentRequestController();