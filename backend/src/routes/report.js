const express = require('express');
const { Op, QueryTypes } = require('sequelize');
const router = express.Router();
const { sequelize, Booking, BookingItem, Payment, Journey, Route, Activity, ActivityInstance } = require('../models');

// Get booking analytics for a date range
router.get('/bookings/analytics', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const where = {};

    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      where.created_at = {
        [Op.between]: [startDate, endDate]
      };
    }


    // Get all bookings in the date range
    const bookings = await Booking.findAll({
      where,
      include: [
        {
          model: BookingItem,
          attributes: ['unit_price']
        },
        {
          model: Journey,
          attributes: ['id', 'journey_date'],
          include: [{
            model: Route,
            attributes: ['id', 'name', 'base_price']
          }]
        },
        {
          model: ActivityInstance,
          attributes: ['id'],
          include: [{
            model: Activity,
            attributes: ['id', 'name', 'base_price']
          }]
        }
      ]
    });

    // Calculate statistics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b) => b.status === 'confirmed').length;
    const activeBookings = bookings.filter((b) => b.status === 'holding').length;

    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (Number(booking.total_amount) || 0);
    }, 0);

    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

    const categoryCounts = {
      Transport: 0,
      Entertainment: 0,
      Sports: 0,
      Events: 0,
      Outdoor: 0,
      Housing: 0,
      Other: 0,
    };

    bookings.forEach((booking) => {
      if (booking.Journey?.Route) {
        categoryCounts.Transport += 1;
        return;
      }

      const activity = booking.ActivityInstance?.Activity;
      if (activity) {
        const activityType = (activity.activity_type || activity.category || '').toLowerCase();

        if (activityType.includes('entertainment')) {
          categoryCounts.Entertainment += 1;
        } else if (activityType.includes('sport')) {
          categoryCounts.Sports += 1;
        } else if (activityType.includes('event')) {
          categoryCounts.Events += 1;
        } else if (activityType.includes('outdoor')) {
          categoryCounts.Outdoor += 1;
        } else if (activityType.includes('house') || activityType.includes('housing') || activityType.includes('accommodation') || activityType.includes('lodging')) {
          categoryCounts.Housing += 1;
        } else {
          categoryCounts.Other += 1;
        }
        return;
      }

      categoryCounts.Other += 1;
    });

    const categoryBreakdown = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    res.json({
      totalBookings,
      completedBookings,
      activeBookings,
      totalRevenue,
      avgBookingValue,
      categoryBreakdown,
      bookings: bookings.map((b) => ({
        id: b.id,
        status: b.status,
        reference: b.reference,
        created_at: b.created_at,
        route: b.Journey?.Route?.name || '',
        activity: b.ActivityInstance?.Activity?.name || '',
        total_amount: b.total_amount
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking analytics', error: error.message });
  }
});

// Get revenue trend data
router.get('/revenue-trend', async (req, res) => {
  try {
    const { fromDate, toDate, groupBy = 'day' } = req.query;
    const where = {};

    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      where.created_at = {
        [Op.between]: [startDate, endDate]
      };
    }

    const bookings = await Booking.findAll({
      where,
      order: [['created_at', 'ASC']],
      attributes: ['created_at', 'total_amount'],
      raw: true
    });

    // Group by date
    const trendData = {};
    bookings.forEach((booking) => {
      let dateKey;
      const date = new Date(booking.created_at || booking.createdAt);

      if (groupBy === 'day') {
        dateKey = date.toLocaleDateString('en-US');
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else if (groupBy === 'month') {
        dateKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      if (!trendData[dateKey]) {
        trendData[dateKey] = { revenue: 0, bookings: 0 };
      }
      trendData[dateKey].bookings += 1;
      trendData[dateKey].revenue += Number(booking.total_amount) || 0;
    });

    const data = Object.entries(trendData).map(([date, values]) => ({
      date,
      revenue: values.revenue,
      bookings: values.bookings
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue trend', error: error.message });
  }
});

// Get top routes and activities
router.get('/top-items', async (req, res) => {
  try {
    const { fromDate, toDate, limit = 10 } = req.query;
    const where = {};

    let rangeStart;
    let rangeEnd;
    if (fromDate && toDate) {
      rangeStart = new Date(fromDate);
      rangeEnd = new Date(toDate);
      rangeEnd.setHours(23, 59, 59, 999);
      where.created_at = {
        [Op.between]: [rangeStart, rangeEnd]
      };
    } else {
      rangeStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      rangeEnd = new Date();
    }

    let topRoutes = await sequelize.query(`
      SELECT 
        r.id, r.name, 
        COUNT(DISTINCT b.id) AS bookings,
        COALESCE(SUM(CAST(b.total_amount AS DECIMAL(15,2))), 0) AS revenue
      FROM bookings b
      JOIN journeys j ON b.journey_id = j.id
      JOIN routes r ON j.route_id = r.id
      WHERE b.created_at BETWEEN ? AND ?
      GROUP BY r.id, r.name
      ORDER BY revenue DESC
      LIMIT ?
    `, {
      replacements: [rangeStart, rangeEnd, parseInt(limit, 10)],
      type: QueryTypes.SELECT
    });

    let topActivities = await sequelize.query(`
      SELECT 
        a.id, a.name,
        COUNT(DISTINCT b.id) AS bookings,
        COALESCE(SUM(CAST(b.total_amount AS DECIMAL(15,2))), 0) AS revenue
      FROM bookings b
      JOIN activity_instances ai ON b.activity_instance_id = ai.id
      JOIN activities a ON ai.activity_id = a.id
      WHERE b.created_at BETWEEN ? AND ?
      GROUP BY a.id, a.name
      ORDER BY revenue DESC
      LIMIT ?
    `, {
      replacements: [rangeStart, rangeEnd, parseInt(limit, 10)],
      type: QueryTypes.SELECT
    });

    topRoutes = topRoutes.map((row) => ({
      ...row,
      bookings: Number(row.bookings) || 0,
      revenue: Number(row.revenue) || 0,
    }));

    topActivities = topActivities.map((row) => ({
      ...row,
      bookings: Number(row.bookings) || 0,
      revenue: Number(row.revenue) || 0,
    }));

    res.json({
      topRoutes,
      topActivities
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top items', error: error.message });
  }
});

module.exports = router;
