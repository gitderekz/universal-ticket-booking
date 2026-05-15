const { Activity, Facility } = require('../models');

const createActivity = async (req, res, next) => {
  try {
    const {
      facility_id,
      name,
      description,
      activity_type,
      duration_minutes,
      max_participants,
      base_price,
      category,
      requirements,
      status,
    } = req.body;

    const activity = await Activity.create({
      facility_id,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      activity_type,
      duration_minutes,
      max_participants: max_participants || 10,
      base_price: base_price || 0,
      category,
      requirements,
      status: status || 'active',
    });

    res.status(201).json({ activity });
  } catch (error) {
    next(error);
  }
};

const listActivities = async (req, res, next) => {
  try {
    const activities = await Activity.findAll({
      include: [{ model: Facility, attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ activities });
  } catch (error) {
    next(error);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findByPk(id, {
      include: [{ model: Facility, attributes: ['id', 'name'] }]
    });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ activity });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivity,
  listActivities,
  getActivity,
};