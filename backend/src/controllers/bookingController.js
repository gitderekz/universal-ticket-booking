const { Booking, BookingItem, Journey, ActivityInstance, Activity, Facility, Currency, SeatHold, Route, Transport, Company, Station, Payment } = require('../models');
const { generateBookingCode } = require('../utils/codeGenerator');
const seatHoldService = require('../services/seatHoldService');

const listBookings = async (req, res, next) => {
  try {
    const where = {};
    const userRoles = req.user?.roles || [];
    const isSuper = userRoles.includes('super_admin') || userRoles.includes('developer');
    const isCompanyAdmin = userRoles.includes('company_admin') || userRoles.includes('staff');

    // Role-based filtering
    if (isSuper) {
      // no extra where - super users see all bookings
    } else if (isCompanyAdmin) {
      // company admins and staff see bookings for their companies only
      const companyIds = req.user?.company_ids || [];
      if (companyIds.length > 0) {
        where.company_id = companyIds;
      } else {
        // no company association, return empty
        return res.json({ bookings: [] });
      }
    } else {
      // default: customers see only their bookings
      if (req.user?.id) {
        where.user_id = req.user.id;
      } else {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const bookings = await Booking.findAll({
      where,
      include: [
        {
          model: Journey,
          attributes: ['id', 'journey_date', 'departure_at', 'arrival_at'],
          include: [
            {
              model: Route,
              attributes: ['id', 'name'],
              include: [
                {
                  model: Station,
                  as: 'originStation',
                  attributes: ['id', 'name', 'city']
                },
                {
                  model: Station,
                  as: 'destinationStation',
                  attributes: ['id', 'name', 'city']
                }
              ]
            },
            {
              model: Transport,
              attributes: ['id', 'name', 'registration_number'],
              include: [
                {
                  model: Company,
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        },
        {
          model: ActivityInstance,
          include: [
            {
              model: Activity,
              attributes: ['id', 'name']
            },
            {
              model: Facility,
              attributes: ['id', 'name'],
              include: [
                {
                  model: Company,
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        },
        { model: Currency, attributes: ['id', 'code', 'symbol'] },
        { model: SeatHold, attributes: ['id', 'seat_code', 'status'] },
        { model: BookingItem, attributes: ['id', 'item_code', 'passenger_name'] },
        { model: Payment, attributes: ['id', 'method', 'status'] }
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
      journey_id,
      activity_instance_id,
      seat_codes = [],
      booking_type = 'transport',
      items = [],
      total_amount = 0,
      currency_id = null,
      passenger_count = 1,
      contact_name,
      contact_phone,
      contact_email,
      notes
    } = req.body;

    const userId = req.user?.id || null;
    const sessionId = req.headers['x-socket-id'] || 'unknown';

    // First, hold the seats for transport or facility bookings
    if (seat_codes.length > 0) {
      const holdTarget = {
        journeyId: journey_id || null,
        activityInstanceId: activity_instance_id || null
      };
      const holds = await seatHoldService.holdSeats(holdTarget, seat_codes, userId, sessionId);
      if (!holds || holds.length === 0) {
        return res.status(400).json({ message: 'Failed to hold seats. They may be unavailable.' });
      }
    }

    // Create the booking
    const booking = await Booking.create({
      booking_code: generateBookingCode(),
      user_id: userId,
      journey_id: journey_id || null,
      activity_instance_id: activity_instance_id || null,
      booking_type,
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

    // Link seat holds to booking
    if (seat_codes.length > 0) {
      await SeatHold.update(
        { booking_id: booking.id },
        {
          where: {
            journey_id: journey_id || null,
            activity_instance_id: activity_instance_id || null,
            seat_code: seat_codes,
            user_id: userId,
            status: 'holding'
          }
        }
      );
    }

    // Create booking items (passenger details)
    if (Array.isArray(items) && items.length > 0) {
      const bookingItems = items.map((item, index) => ({
        booking_id: booking.id,
        item_type: item.item_type || 'seat',
        item_code: seat_codes[index] || `item-${index + 1}`,
        passenger_name: item.passenger_name || `Passenger ${index + 1}`,
        passenger_type: item.passenger_type || 'adult',
        unit_price: item.unit_price || total_amount / items.length,
        details: item.details || {}
      }));
      await BookingItem.bulkCreate(bookingItems);
    }

    // Fetch the complete booking with associations
    const completeBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Journey },
        { model: Currency },
        { model: BookingItem },
        { model: SeatHold }
      ]
    });

    res.status(201).json({
      booking: completeBooking,
      message: 'Booking created and seats held successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const allowedStatuses = ['pending', 'holding', 'confirmed', 'cancelled', 'completed', 'expired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    booking.status = status;
    if (status === 'confirmed') {
      booking.confirmed_at = new Date();
      await seatHoldService.confirmHoldsForBooking(booking.id, booking.journey_id, booking.activity_instance_id);

      // Create Payment record if one doesn't exist (for manual cash confirmation)
      const existingPayment = await Payment.findOne({ where: { booking_id: booking.id } });
      if (!existingPayment) {
        await Payment.create({
          booking_id: booking.id,
          transaction_reference: `MANUAL-${booking.id}-${Date.now()}`,
          method: 'cash',
          provider: 'manual',
          amount: booking.total_amount,
          currency_id: booking.currency_id,
          exchange_rate_snapshot: booking.exchange_rate_snapshot,
          status: 'completed',
          paid_at: new Date(),
          response_json: { type: 'manual_cash_confirmation', confirmedBy: req.user?.id }
        });
      }
    }
    if (status === 'cancelled') {
      booking.cancelled_at = new Date();
      await seatHoldService.releaseHoldsForBooking(booking.id, booking.journey_id, booking.activity_instance_id);
    }
    if (status === 'expired') {
      await seatHoldService.releaseHoldsForBooking(booking.id, booking.journey_id, booking.activity_instance_id);
    }

    await booking.save();
    return res.json({ booking, message: `Booking status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBookings,
  createBooking,
  updateBookingStatus
};
