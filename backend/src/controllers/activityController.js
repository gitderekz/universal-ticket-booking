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

const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
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
      status
    } = req.body;

    const activity = await Activity.findByPk(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const updateData = {};
    if (facility_id !== undefined) updateData.facility_id = facility_id;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (activity_type !== undefined) updateData.activity_type = activity_type;
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;
    if (max_participants !== undefined) updateData.max_participants = max_participants;
    if (base_price !== undefined) updateData.base_price = base_price;
    if (category !== undefined) updateData.category = category;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (status !== undefined) updateData.status = status;

    if (name) {
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    await activity.update(updateData);
    res.json({ activity });
  } catch (error) {
    next(error);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findByPk(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    await activity.destroy();
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivity,
  listActivities,
  getActivity,
  updateActivity,
  deleteActivity,
};