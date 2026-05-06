const { Booking, Payment } = require('../models');

const processPayment = async (req, res, next) => {
  try {
    const { booking_id, method, provider, amount } = req.body;
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const successRate = parseFloat(process.env.PAYMENT_STUB_SUCCESS_RATE || '0.8');
    const success = Math.random() < successRate;
    const transaction_reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const payment = await Payment.create({
      booking_id,
      transaction_reference,
      method,
      provider,
      amount: amount || booking.total_amount,
      currency_id: booking.currency_id,
      exchange_rate_snapshot: booking.exchange_rate_snapshot,
      response_json: { success },
      status: success ? 'completed' : 'failed',
      paid_at: success ? new Date() : null
    });

    if (success) {
      booking.status = 'confirmed';
      booking.confirmed_at = new Date();
      await booking.save();
    } else {
      booking.status = 'expired';
      await booking.save();
    }

    res.json({ payment, booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment
};
