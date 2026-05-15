const axios = require('axios');

/**
 * M-Pesa Payment Gateway Integration
 * This service handles payment processing through Daraja API
 */

const MPESA_ENDPOINT = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || '';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'http://localhost:5000/api/payments/callback/mpesa';

let accessToken = null;
let tokenExpiry = 0;

const getAccessToken = async () => {
  try {
    // Check if token is still valid
    if (accessToken && tokenExpiry > Date.now()) {
      return accessToken;
    }

    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(
      `${MPESA_ENDPOINT}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error.message);
    throw error;
  }
};

const generateTimestamp = () => {
  const now = new Date();
  return now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
};

const generatePassword = (shortcode, passkey, timestamp) => {
  const payload = shortcode + passkey + timestamp;
  return Buffer.from(payload).toString('base64');
};

const initiateSTKPush = async (phoneNumber, amount, accountReference, transactionDescription) => {
  try {
    const token = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(MPESA_SHORTCODE, MPESA_PASSKEY, timestamp);

    const response = await axios.post(
      `${MPESA_ENDPOINT}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: phoneNumber.startsWith('+') ? phoneNumber.replace('+', '') : parseInt(phoneNumber),
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phoneNumber.startsWith('+') ? phoneNumber.replace('+', '') : parseInt(phoneNumber),
        CallBackURL: CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: transactionDescription,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      checkoutRequestId: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      customerMessage: response.data.CustomerMessage,
    };
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

const queryPaymentStatus = async (checkoutRequestId) => {
  try {
    const token = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(MPESA_SHORTCODE, MPESA_PASSKEY, timestamp);

    const response = await axios.post(
      `${MPESA_ENDPOINT}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: response.data.ResultCode === '0',
      resultCode: response.data.ResultCode,
      resultDescription: response.data.ResultDesc,
      checkoutRequestId: response.data.CheckoutRequestID,
    };
  } catch (error) {
    console.error('Error querying payment status:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

const validateCallback = (data) => {
  // Verify the callback is from M-Pesa
  // In production, you should verify the signature
  return {
    merchantRequestId: data.Body?.stkCallback?.MerchantRequestID,
    checkoutRequestId: data.Body?.stkCallback?.CheckoutRequestID,
    resultCode: data.Body?.stkCallback?.ResultCode,
    resultDescription: data.Body?.stkCallback?.ResultDesc,
    amount: data.Body?.stkCallback?.CallbackMetadata?.Item?.find(
      (item) => item.Name === 'Amount'
    )?.Value,
    transactionReference: data.Body?.stkCallback?.CallbackMetadata?.Item?.find(
      (item) => item.Name === 'MpesaReceiptNumber'
    )?.Value,
    phoneNumber: data.Body?.stkCallback?.CallbackMetadata?.Item?.find(
      (item) => item.Name === 'PhoneNumber'
    )?.Value,
    transactionDate: data.Body?.stkCallback?.CallbackMetadata?.Item?.find(
      (item) => item.Name === 'TransactionDate'
    )?.Value,
  };
};

module.exports = {
  initiateSTKPush,
  queryPaymentStatus,
  validateCallback,
  getAccessToken,
};
