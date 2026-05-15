const { ActivityInstance, Activity, Facility } = require('../models');

const createActivityInstance = async (req, res, next) => {
  try {
    const {
      activity_id,
      facility_id,
      start_at,
      end_at,
      total_slots,
    } = req.body;

    const instance = await ActivityInstance.create({
      activity_id,
      facility_id,
      start_at,
      end_at,
      total_slots,
      available_slots: total_slots,
      status: 'scheduled',
    });

    res.status(201).json({ activityInstance: instance });
  } catch (error) {
    next(error);
  }
};

const listActivityInstances = async (req, res, next) => {
  try {
    const instances = await ActivityInstance.findAll({
      include: [
        { model: Activity, attributes: ['id', 'name'] },
        { model: Facility, attributes: ['id', 'name'] }
      ],
      order: [['start_at', 'ASC']]
    });
    res.json({ activityInstances: instances });
  } catch (error) {
    next(error);
  }
};

const getActivityInstance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instance = await ActivityInstance.findByPk(id, {
      include: [
        { model: Activity, attributes: ['id', 'name'] },
        { model: Facility, attributes: ['id', 'name'] }
      ]
    });
    if (!instance) {
      return res.status(404).json({ message: 'Activity instance not found' });
    }
    res.json({ activityInstance: instance });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivityInstance,
  listActivityInstances,
  getActivityInstance,
};