const { Booking, BookingItem, Journey, Currency } = require('../models');
const { generateBookingCode } = require('../utils/codeGenerator');

const listBookings = async (req, res, next) => {
  try {
    const where = {};
    if (req.user?.id) {
      where.user_id = req.user.id;
    }
    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Journey, attributes: ['id', 'journey_date', 'departure_at', 'arrival_at'] },
        { model: Currency, attributes: ['id', 'code', 'symbol'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const {
      company_id,
      journey_id,
      booking_type,
      items,
      total_amount,
      currency_id,
      passenger_count,
      contact_name,
      contact_phone,
      contact_email,
      notes
    } = req.body;

    const booking = await Booking.create({
      booking_code: generateBookingCode(),
      user_id: req.user?.id || null,
      company_id,
      booking_type: booking_type || 'transport',
      journey_id: journey_id || null,
      status: 'holding',
      total_amount: total_amount || 0,
      currency_id: currency_id || null,
      exchange_rate_snapshot: 1.0,
      passenger_count: passenger_count || 1,
      contact_name,
      contact_phone,
      contact_email,
      notes,
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    });

    if (Array.isArray(items) && items.length > 0) {
      const bookingItems = items.map((item) => ({
        ...item,
        booking_id: booking.id
      }));
      await BookingItem.bulkCreate(bookingItems);
    }

    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBookings,
  createBooking
};
