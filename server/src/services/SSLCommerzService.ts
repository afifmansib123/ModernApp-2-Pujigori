import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { ISSLCommerzPayment, ISSLCommerzResponse, ISSLCommerzIPN, IDonation } from '../types';

class SSLCommerzService {
  private readonly storeId: string;
  private readonly storePassword: string;
  private readonly isSandbox: boolean;
  private readonly baseUrl: string;
  private readonly validationUrl: string;

  constructor() {
    this.storeId = process.env.SSLCOMMERZ_STORE_ID || '';
    this.storePassword = process.env.SSLCOMMERZ_STORE_PASS || '';
    this.isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX === 'true';
    
    if (!this.storeId || !this.storePassword) {
      throw new Error('SSLCommerz store ID and password are required');
    }

    // Set URLs based on sandbox/live environment
    this.baseUrl = this.isSandbox 
      ? 'https://sandbox.sslcommerz.com'
      : 'https://securepay.sslcommerz.com';
    
    this.validationUrl = this.isSandbox
      ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';
  }

  /**
   * Initialize payment session with SSLCommerz
   */
  public async initiatePayment(paymentData: {
    transactionId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    productName: string;
    productCategory: string;
    successUrl?: string;
    failUrl?: string;
    cancelUrl?: string;
    ipnUrl?: string;
  }): Promise<ISSLCommerzResponse> {
    try {
      const sslData: ISSLCommerzPayment = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        total_amount: paymentData.amount,
        currency: 'BDT',
        tran_id: paymentData.transactionId,
        success_url: paymentData.successUrl || process.env.SSLCOMMERZ_SUCCESS_URL || '',
        fail_url: paymentData.failUrl || process.env.SSLCOMMERZ_FAIL_URL || '',
        cancel_url: paymentData.cancelUrl || process.env.SSLCOMMERZ_CANCEL_URL || '',
        ipn_url: paymentData.ipnUrl || process.env.SSLCOMMERZ_IPN_URL || '',
        cus_name: paymentData.customerName,
        cus_email: paymentData.customerEmail,
        cus_add1: paymentData.customerAddress,
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
        cus_phone: paymentData.customerPhone,
        shipping_method: 'NO',
        product_name: paymentData.productName,
        product_category: paymentData.productCategory,
        product_profile: 'general'
      };

      const response: AxiosResponse<ISSLCommerzResponse> = await axios.post(
        `${this.baseUrl}/gwprocess/v4/api.php`,
        sslData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000
        }
      );

      if (response.data.status === 'SUCCESS') {
        return response.data;
      } else {
        throw new Error(response.data.failedreason || 'Payment initiation failed');
      }

    } catch (error) {
      console.error('SSLCommerz initiation error:', error);
      throw new Error(
        axios.isAxiosError(error) 
          ? `Payment gateway error: ${error.message}`
          : 'Failed to initiate payment'
      );
    }
  }

  /**
   * Validate payment transaction
   */
  public async validateTransaction(
    validationId: string,
    transactionId: string,
    amount: number
  ): Promise<{
    status: string;
    transactionId: string;
    amount: number;
    currency: string;
    bankTransactionId?: string;
    cardType?: string;
    cardNumber?: string;
    validatedOn: Date;
  }> {
    try {
      const validationData = {
        val_id: validationId,
        store_id: this.storeId,
        store_passwd: this.storePassword,
        v1: transactionId,
        v2: amount.toString(),
        format: 'json'
      };

      const response = await axios.post(this.validationUrl, validationData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      });

      const validationResult = response.data;

      if (validationResult.status === 'VALID') {
        return {
          status: 'VALID',
          transactionId: validationResult.tran_id,
          amount: parseFloat(validationResult.amount),
          currency: validationResult.currency,
          bankTransactionId: validationResult.bank_tran_id,
          cardType: validationResult.card_type,
          cardNumber: validationResult.card_no,
          validatedOn: new Date()
        };
      } else if (validationResult.status === 'VALIDATED') {
        return {
          status: 'ALREADY_VALIDATED',
          transactionId: validationResult.tran_id,
          amount: parseFloat(validationResult.amount),
          currency: validationResult.currency,
          bankTransactionId: validationResult.bank_tran_id,
          cardType: validationResult.card_type,
          cardNumber: validationResult.card_no,
          validatedOn: new Date()
        };
      } else {
        throw new Error(`Transaction validation failed: ${validationResult.status}`);
      }

    } catch (error) {
      console.error('Transaction validation error:', error);
      throw new Error(
        axios.isAxiosError(error)
          ? `Validation service error: ${error.message}`
          : 'Transaction validation failed'
      );
    }
  }

  /**
   * Process IPN (Instant Payment Notification) from SSLCommerz
   */
  public async processIPN(ipnData: any): Promise<{
    isValid: boolean;
    transactionId: string;
    status: string;
    amount: number;
    currency: string;
    validationId: string;
    bankTransactionId?: string;
    cardInfo?: {
      type: string;
      number: string;
      issuer: string;
      brand: string;
    };
  }> {
    try {
      // Validate IPN data structure
      if (!this.isValidIPNData(ipnData)) {
        throw new Error('Invalid IPN data structure');
      }

      const ipn: ISSLCommerzIPN = ipnData;

      // Verify the hash
      if (!this.verifyIPNHash(ipn)) {
        throw new Error('IPN hash verification failed');
      }

      // Additional validation with SSLCommerz
      const validation = await this.validateTransaction(
        ipn.val_id,
        ipn.tran_id,
        ipn.amount
      );

      return {
        isValid: validation.status === 'VALID' || validation.status === 'ALREADY_VALIDATED',
        transactionId: ipn.tran_id,
        status: ipn.status,
        amount: ipn.amount,
        currency: ipn.currency,
        validationId: ipn.val_id,
        bankTransactionId: ipn.bank_tran_id,
        cardInfo: {
          type: ipn.card_type,
          number: ipn.card_no,
          issuer: ipn.card_issuer,
          brand: ipn.card_brand
        }
      };

    } catch (error) {
      console.error('IPN processing error:', error);
      return {
        isValid: false,
        transactionId: ipnData.tran_id || 'unknown',
        status: 'FAILED',
        amount: 0,
        currency: 'BDT',
        validationId: ipnData.val_id || 'unknown'
      };
    }
  }

  /**
   * Refund transaction
   */
  public async refundTransaction(
    bankTransactionId: string,
    refundAmount: number,
    refundReason: string
  ): Promise<{
    success: boolean;
    refundRefId?: string;
    message: string;
  }> {
    try {
      const refundData = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        bank_tran_id: bankTransactionId,
        refund_amount: refundAmount,
        refund_remarks: refundReason,
        refe_id: this.generateRefundReferenceId(),
        format: 'json'
      };

      const refundUrl = this.isSandbox
        ? 'https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php'
        : 'https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php';

      const response = await axios.post(refundUrl, refundData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      });

      if (response.data.status === 'SUCCESS') {
        return {
          success: true,
          refundRefId: response.data.refund_ref_id,
          message: 'Refund processed successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.errorReason || 'Refund failed'
        };
      }

    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        message: 'Refund processing failed'
      };
    }
  }

  /**
   * Query transaction status
   */
  public async queryTransaction(transactionId: string): Promise<{
    status: string;
    amount?: number;
    currency?: string;
    bankTransactionId?: string;
    cardType?: string;
    riskLevel?: string;
  }> {
    try {
      const queryData = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        tran_id: transactionId
      };

      const queryUrl = this.isSandbox
        ? 'https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php'
        : 'https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php';

      const response = await axios.post(queryUrl, queryData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      });

      return {
        status: response.data.status || 'UNKNOWN',
        amount: response.data.amount ? parseFloat(response.data.amount) : undefined,
        currency: response.data.currency,
        bankTransactionId: response.data.bank_tran_id,
        cardType: response.data.card_type,
        riskLevel: response.data.risk_level
      };

    } catch (error) {
      console.error('Transaction query error:', error);
      return {
        status: 'ERROR'
      };
    }
  }

  /**
   * Generate secure transaction ID
   */
  public generateTransactionId(prefix = 'PG'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Generate refund reference ID
   */
  private generateRefundReferenceId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `REF_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Validate IPN data structure
   */
  private isValidIPNData(data: any): boolean {
    const requiredFields = [
      'val_id', 'store_id', 'amount', 'currency', 'tran_id', 
      'status', 'verify_sign', 'verify_key'
    ];

    return requiredFields.every(field => data && data[field] !== undefined);
  }

  /**
   * Verify IPN hash signature
   */
  private verifyIPNHash(ipn: ISSLCommerzIPN): boolean {
    try {
      // Create verification string
      const verifyString = `${this.storePassword}${ipn.val_id}${ipn.store_id}${ipn.amount}${ipn.currency}${ipn.tran_id}${ipn.status}`;
      
      // Generate hash
      const generatedHash = crypto
        .createHash('md5')
        .update(verifyString)
        .digest('hex');

      // Compare with received hash
      return generatedHash.toLowerCase() === ipn.verify_sign.toLowerCase();

    } catch (error) {
      console.error('Hash verification error:', error);
      return false;
    }
  }

  /**
   * Get payment gateway information
   */
  public getGatewayInfo(): {
    environment: 'sandbox' | 'live';
    storeId: string;
    baseUrl: string;
  } {
    return {
      environment: this.isSandbox ? 'sandbox' : 'live',
      storeId: this.storeId,
      baseUrl: this.baseUrl
    };
  }

  /**
   * Format amount for SSLCommerz (must be in BDT with 2 decimal places)
   */
  public formatAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  /**
   * Validate amount for SSLCommerz (minimum 10 BDT)
   */
  public isValidAmount(amount: number): boolean {
    return amount >= 10 && amount <= 500000; // SSLCommerz limits
  }
}

// Export singleton instance
const sslCommerzService = new SSLCommerzService();
export default sslCommerzService;

// Export class for testing
export { SSLCommerzService };