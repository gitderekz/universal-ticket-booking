const { Op } = require('sequelize');
const { Facility, FacilityType, Company, Activity, ActivityInstance } = require('../models');

const createFacility = async (req, res, next) => {
  try {
    const {
      facility_type_id,
      name,
      description,
      location,
      capacity,
      base_price,
      sittingPlan,
      sittingLength,
      features,
      images,
      company_id,
    } = req.body;

    const facility = await Facility.create({
      company_id,
      facility_type_id,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      location,
      capacity,
      base_price,
      sittingPlan: sittingPlan || null,
      sittingLength: sittingLength || 0,
      features,
      images,
      status: 'pending',
    });

    res.status(201).json({ facility });
  } catch (error) {
    next(error);
  }
};

const listFacilities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, facility_type_id, company_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (facility_type_id) {
      where.facility_type_id = facility_type_id;
    }
    if (company_id) {
      where.company_id = company_id;
    }

    const facilities = await Facility.findAndCountAll({
      where,
      include: [
        { model: FacilityType, attributes: ['id', 'name', 'slug'] },
        { model: Company, attributes: ['id', 'name', 'slug'] },
        { model: require('../models').SeatLayout, as: 'seatLayout', attributes: ['pattern', 'rows', 'total_units', 'config'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      facilities: facilities.rows,
      pagination: {
        total: facilities.count,
        page: parseInt(page),
        pages: Math.ceil(facilities.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getFacility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facility = await Facility.findByPk(id, {
      include: [
        { model: FacilityType, attributes: ['id', 'name', 'slug'] },
        { model: Company, attributes: ['id', 'name', 'slug'] },
        { model: require('../models').SeatLayout, as: 'seatLayout', attributes: ['pattern', 'rows', 'total_units', 'config'] },
        {
          model: Activity,
          include: [ActivityInstance]
        }
      ]
    });

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.json({ facility });
  } catch (error) {
    next(error);
  }
};

const updateFacility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      location,
      capacity,
      base_price,
      sittingPlan,
      sittingLength,
      features,
      images,
      status
    } = req.body;

    const facility = await Facility.findByPk(id);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (location) updateData.location = location;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (base_price !== undefined) updateData.base_price = base_price;
    if (sittingPlan !== undefined) updateData.sittingPlan = sittingPlan;
    if (sittingLength !== undefined) updateData.sittingLength = sittingLength;
    if (features) updateData.features = features;
    if (images) updateData.images = images;
    if (status) updateData.status = status;

    await facility.update(updateData);

    res.json({ facility });
  } catch (error) {
    next(error);
  }
};

const deleteFacility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facility = await Facility.findByPk(id);

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    await facility.destroy();
    res.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Activity Controllers
const createActivity = async (req, res, next) => {
  try {
    const {
      facility_id,
      name,
      description,
      duration_minutes,
      max_participants,
      base_price,
      category,
      requirements
    } = req.body;

    const activity = await Activity.create({
      facility_id,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      duration_minutes,
      max_participants,
      base_price,
      category,
      requirements,
      status: 'active'
    });

    res.status(201).json({ activity });
  } catch (error) {
    next(error);
  }
};

const listActivities = async (req, res, next) => {
  try {
    const { facility_id } = req.query;

    const where = {};
    if (facility_id) {
      where.facility_id = facility_id;
    }

    const activities = await Activity.findAll({
      where,
      include: [{
        model: Facility,
        attributes: ['id', 'name', 'slug']
      }],
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
      include: [{
        model: Facility,
        attributes: ['id', 'name', 'slug']
      }, {
        model: ActivityInstance
      }]
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
      name,
      description,
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
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;
    if (max_participants !== undefined) updateData.max_participants = max_participants;
    if (base_price !== undefined) updateData.base_price = base_price;
    if (category) updateData.category = category;
    if (requirements) updateData.requirements = requirements;
    if (status) updateData.status = status;

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

// Activity Instance Controllers
const createActivityInstance = async (req, res, next) => {
  try {
    const {
      activity_id,
      facility_id,
      start_at,
      end_at,
      total_slots,
      available_slots,
      price_modifier,
      special_notes,
      status
    } = req.body;

    const activityInstance = await ActivityInstance.create({
      activity_id,
      facility_id,
      start_at,
      end_at,
      total_slots: total_slots || available_slots || 0,
      available_slots: available_slots !== undefined ? available_slots : total_slots || 0,
      price_modifier: price_modifier || 0,
      special_notes,
      status: status || 'scheduled'
    });

    res.status(201).json({ activityInstance });
  } catch (error) {
    next(error);
  }
};

const listActivityInstances = async (req, res, next) => {
  try {
    const { activity_id, date } = req.query;

    const where = {};
    if (activity_id) {
      where.activity_id = activity_id;
    }
    if (date) {
      where.start_at = {
        [Op.gte]: new Date(`${date}T00:00:00`),
        [Op.lt]: new Date(`${date}T23:59:59`)
      };
    }

    const activityInstances = await ActivityInstance.findAll({
      where,
      include: [{
        model: Activity,
        attributes: ['id', 'name', 'slug', 'base_price']
      }],
      order: [['start_at', 'ASC']]
    });

    res.json({ activityInstances });
  } catch (error) {
    next(error);
  }
};

const getActivityInstance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activityInstance = await ActivityInstance.findByPk(id, {
      include: [{
        model: Activity,
        attributes: ['id', 'name', 'slug', 'base_price', 'facility_id']
      }]
    });

    if (!activityInstance) {
      return res.status(404).json({ message: 'Activity instance not found' });
    }
    res.json({ activityInstance });
  } catch (error) {
    next(error);
  }
};

const updateActivityInstance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      start_at,
      end_at,
      available_slots,
      price_modifier,
      special_notes,
      status
    } = req.body;

    const activityInstance = await ActivityInstance.findByPk(id);
    if (!activityInstance) {
      return res.status(404).json({ message: 'Activity instance not found' });
    }

    const updateData = {};
    if (start_at) updateData.start_at = start_at;
    if (end_at) updateData.end_at = end_at;
    if (available_slots !== undefined) updateData.available_slots = available_slots;
    if (price_modifier !== undefined) updateData.price_modifier = price_modifier;
    if (special_notes !== undefined) updateData.special_notes = special_notes;
    if (status) updateData.status = status;

    await activityInstance.update(updateData);

    res.json({ activityInstance });
  } catch (error) {
    next(error);
  }
};

const deleteActivityInstance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activityInstance = await ActivityInstance.findByPk(id);

    if (!activityInstance) {
      return res.status(404).json({ message: 'Activity instance not found' });
    }

    await activityInstance.destroy();
    res.json({ message: 'Activity instance deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFacility,
  listFacilities,
  getFacility,
  updateFacility,
  deleteFacility,
  createActivity,
  listActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  createActivityInstance,
  listActivityInstances,
  getActivityInstance,
  updateActivityInstance,
  deleteActivityInstance
};