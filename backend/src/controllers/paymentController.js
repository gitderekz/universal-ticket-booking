const { Booking, Payment } = require('../models');
const seatHoldService = require('../services/seatHoldService');
const paymentGateway = require('../services/paymentGateway');

const processPayment = async (req, res, next) => {
  try {
    const { booking_id, method, provider, amount, phone_number } = req.body;
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    let payment;
    let transactionReference;
    let status = 'pending';
    let responseData = {};

    // Handle M-Pesa payments
    if (provider === 'mpesa' && phone_number) {
      try {
        const mpesaResult = await paymentGateway.initiateSTKPush(
          phone_number,
          amount || booking.total_amount,
          booking.booking_code,
          `Payment for booking ${booking.booking_code}`
        );

        if (mpesaResult.success) {
          transactionReference = mpesaResult.checkoutRequestId;
          status = 'processing';
          responseData = mpesaResult;
        } else {
          status = 'failed';
          responseData = { error: mpesaResult.error };
        }
      } catch (error) {
        console.error('M-Pesa payment error:', error);
        status = 'failed';
        responseData = { error: error.message };
      }
    } else {
      // Stub processor for development/testing
      const successRate = parseFloat(process.env.PAYMENT_STUB_SUCCESS_RATE || '0.8');
      const success = Math.random() < successRate;
      transactionReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      status = success ? 'completed' : 'failed';
      responseData = { success, stub: true };
    }

    // Create payment record
    payment = await Payment.create({
      booking_id,
      transaction_reference: transactionReference,
      method,
      provider,
      amount: amount || booking.total_amount,
      currency_id: booking.currency_id,
      exchange_rate_snapshot: booking.exchange_rate_snapshot,
      response_json: responseData,
      status,
      paid_at: status === 'completed' ? new Date() : null,
    });

    // Update booking status
    if (status === 'completed') {
      booking.status = 'confirmed';
      booking.confirmed_at = new Date();
      await booking.save();

      // Convert seat holds to confirmed bookings
      if (booking.journey_id) {
        await seatHoldService.convertHoldsToBooking(booking_id);
      }
    } else if (status === 'failed') {
      booking.status = 'expired';
      await booking.save();

      // Release seat holds on payment failure
      if (booking.journey_id) {
        await seatHoldService.releaseSeats(booking.journey_id, [], req.user?.id);
      }
    }

    res.status(status === 'failed' ? 400 : 201).json({ payment, booking, message: `Payment ${status}` });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { transactionReference } = req.params;
    const payment = await Payment.findOne({ where: { transaction_reference: transactionReference } });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // If payment is still processing, query M-Pesa for status
    if (payment.status === 'processing' && payment.provider === 'mpesa') {
      try {
        const result = await paymentGateway.queryPaymentStatus(transactionReference);
        if (result.success) {
          payment.status = 'completed';
          payment.paid_at = new Date();
          await payment.save();

          // Update booking status
          const booking = await Booking.findByPk(payment.booking_id);
          if (booking) {
            booking.status = 'confirmed';
            booking.confirmed_at = new Date();
            await booking.save();

            // Convert seat holds
            if (booking.journey_id) {
              await seatHoldService.convertHoldsToBooking(payment.booking_id);
            }
          }
        }
      } catch (error) {
        console.error('Error verifying M-Pesa payment:', error);
      }
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
};

const getPaymentByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const payment = await Payment.findOne({ where: { booking_id: bookingId } });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
};

const handleMPesaCallback = async (req, res, next) => {
  try {
    const callbackData = paymentGateway.validateCallback(req.body);
    
    // Find the payment by checkout request ID
    const payment = await Payment.findOne({
      where: { transaction_reference: callbackData.checkoutRequestId },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (callbackData.resultCode === '0') {
      // Payment successful
      payment.status = 'completed';
      payment.paid_at = new Date();
      payment.response_json = callbackData;
      await payment.save();

      // Update booking
      const booking = await Booking.findByPk(payment.booking_id);
      if (booking) {
        booking.status = 'confirmed';
        booking.confirmed_at = new Date();
        await booking.save();

        // Convert seat holds
        if (booking.journey_id) {
          await seatHoldService.convertHoldsToBooking(payment.booking_id);
        }
      }
    } else {
      // Payment failed
      payment.status = 'failed';
      payment.response_json = callbackData;
      await payment.save();

      // Release seats
      const booking = await Booking.findByPk(payment.booking_id);
      if (booking && booking.journey_id) {
        booking.status = 'expired';
        await booking.save();
        await seatHoldService.releaseSeats(booking.journey_id, [], booking.user_id);
      }
    }

    // Return success to M-Pesa
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Error handling M-Pesa callback:', error);
    res.json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
};

module.exports = {
  processPayment,
  verifyPayment,
  getPaymentByBooking,
  handleMPesaCallback,
};
