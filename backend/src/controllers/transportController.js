const { Transport, TransportType, Company } = require('../models');
const { Op } = require('sequelize');

const listTransportTypes = async (req, res, next) => {
  try {
    const transportTypes = await TransportType.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });

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

const listTransports = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.company_id) {
      where.company_id = req.query.company_id;
    }
    if (req.query.transport_type_slug) {
      const transportType = await TransportType.findOne({ where: { slug: req.query.transport_type_slug } });
      if (transportType) {
        where.transport_type_id = transportType.id;
      }
    }
    if (req.query.transport_type_id) {
      where.transport_type_id = req.query.transport_type_id;
    }
    const transports = await Transport.findAll({
      where,
      include: [
        { model: TransportType, attributes: ['id', 'name', 'slug'] },
        { model: Company, attributes: ['id', 'name', 'slug'] },
        { model: require('../models').SeatLayout, as: 'seatLayout', attributes: ['pattern', 'rows', 'total_units', 'config'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ transports });
  } catch (error) {
    next(error);
  }
};

const createTransport = async (req, res, next) => {
  try {
    const { transport_type_id, name, registration_number, description, capacity, sittingPlan, sittingLength, images, features, status } = req.body;
    const transport = await Transport.create({
      company_id: req.body.company_id || req.user.company_id || null,
      transport_type_id,
      name,
      registration_number,
      description,
      capacity,
      sittingPlan: sittingPlan || null,
      sittingLength: sittingLength || 0,
      images: images || [],
      features: features || {},
      status: status || 'draft'
    });
    res.status(201).json({ transport });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTransports,
  createTransport,
  listTransportTypes
};
