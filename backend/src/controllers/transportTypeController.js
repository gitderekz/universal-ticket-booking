// backend/src/controllers/transportTypeController.js
const { TransportType, Transport } = require('../models');
const { Op } = require('sequelize');

const listTransportTypes = async (req, res, next) => {
  try {
    const transportTypes = await TransportType.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });

    // Get counts of transports per type
    const counts = await Transport.findAll({
      attributes: ['transport_type_id', [require('sequelize').fn('COUNT', require('sequelize').col('transport_type_id')), 'count']],
      where: { transport_type_id: { [Op.ne]: null } },
      group: ['transport_type_id']
    });

    const countMap = counts.reduce((acc, record) => {
      acc[record.transport_type_id] = Number(record.get('count'));
      return acc;
    }, {});

    res.json({
      transport_types: transportTypes.map((type) => ({
        ...type.toJSON(),
        transport_count: countMap[type.id] || 0
      }))
    });
  } catch (error) {
    next(error);
  }
};

const createTransportType = async (req, res, next) => {
  try {
    const { name, slug, category, description, requires_routes, requires_layout, active } = req.body;
    
    const transportType = await TransportType.create({
      name,
      slug,
      category: category || 'land',
      description,
      requires_routes: requires_routes !== undefined ? requires_routes : true,
      requires_layout: requires_layout !== undefined ? requires_layout : true,
      active: active !== undefined ? active : true
    });
    
    res.status(201).json({ transport_type: transportType });
  } catch (error) {
    next(error);
  }
};

const updateTransportType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, category, description, requires_routes, requires_layout, active } = req.body;
    
    const transportType = await TransportType.findByPk(id);
    if (!transportType) {
      return res.status(404).json({ message: 'Transport type not found' });
    }
    
    await transportType.update({
      name: name || transportType.name,
      slug: slug || transportType.slug,
      category: category || transportType.category,
      description: description !== undefined ? description : transportType.description,
      requires_routes: requires_routes !== undefined ? requires_routes : transportType.requires_routes,
      requires_layout: requires_layout !== undefined ? requires_layout : transportType.requires_layout,
      active: active !== undefined ? active : transportType.active
    });
    
    res.json({ transport_type: transportType });
  } catch (error) {
    next(error);
  }
};

const deleteTransportType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transportType = await TransportType.findByPk(id);
    
    if (!transportType) {
      return res.status(404).json({ message: 'Transport type not found' });
    }
    
    await transportType.destroy();
    res.json({ message: 'Transport type deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTransportTypes,
  createTransportType,
  updateTransportType,
  deleteTransportType
};