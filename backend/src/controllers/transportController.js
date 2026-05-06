const { Transport, TransportType, Company } = require('../models');

const listTransports = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.company_id) {
      where.company_id = req.query.company_id;
    }
    const transports = await Transport.findAll({
      where,
      include: [
        { model: TransportType, attributes: ['id', 'name', 'slug'] },
        { model: Company, attributes: ['id', 'name', 'slug'] }
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
    const { transport_type_id, name, registration_number, description, capacity, images, features, status } = req.body;
    const transport = await Transport.create({
      company_id: req.body.company_id || req.user.company_id || null,
      transport_type_id,
      name,
      registration_number,
      description,
      capacity,
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
  createTransport
};
