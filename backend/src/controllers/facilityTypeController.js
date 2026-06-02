// backend/src/controllers/facilityTypeController.js
const { FacilityType } = require('../models');

const listFacilityTypes = async (req, res, next) => {
  try {
    const facilityTypes = await FacilityType.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });

    // Get counts of facilities per type
    const { Facility } = require('../models');
    const counts = await Facility.findAll({
      attributes: ['facility_type_id', [require('sequelize').fn('COUNT', require('sequelize').col('facility_type_id')), 'count']],
      where: { facility_type_id: { [require('sequelize').Op.ne]: null } },
      group: ['facility_type_id']
    });

    const countMap = counts.reduce((acc, record) => {
      acc[record.facility_type_id] = Number(record.get('count'));
      return acc;
    }, {});

    res.json({
      facility_types: facilityTypes.map((type) => ({
        ...type.toJSON(),
        facility_count: countMap[type.id] || 0
      }))
    });
  } catch (error) {
    next(error);
  }
};

const createFacilityType = async (req, res, next) => {
  try {
    const { name, slug, category, description, active } = req.body;
    
    const facilityType = await FacilityType.create({
      name,
      slug,
      category: category || name,
      description,
      active: active !== undefined ? active : true
    });
    
    res.status(201).json({ facility_type: facilityType });
  } catch (error) {
    next(error);
  }
};

const updateFacilityType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, category, description, active } = req.body;
    
    const facilityType = await FacilityType.findByPk(id);
    if (!facilityType) {
      return res.status(404).json({ message: 'Facility type not found' });
    }
    
    await facilityType.update({
      name: name || facilityType.name,
      slug: slug || facilityType.slug,
      category: category || facilityType.category,
      description: description !== undefined ? description : facilityType.description,
      active: active !== undefined ? active : facilityType.active
    });
    
    res.json({ facility_type: facilityType });
  } catch (error) {
    next(error);
  }
};

const deleteFacilityType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facilityType = await FacilityType.findByPk(id);
    
    if (!facilityType) {
      return res.status(404).json({ message: 'Facility type not found' });
    }
    
    await facilityType.destroy();
    res.json({ message: 'Facility type deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listFacilityTypes,
  createFacilityType,
  updateFacilityType,
  deleteFacilityType
};