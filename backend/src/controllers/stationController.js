// backend/src/controllers/stationController.js
const { Station, Company } = require('../models');

const listStations = async (req, res, next) => {
  try {
    const { company_id, search } = req.query;
    const where = {};
    
    if (company_id) {
      where.company_id = company_id;
    }
    
    if (search) {
      where.name = { [require('sequelize').Op.like]: `%${search}%` };
    }
    
    const stations = await Station.findAll({
      where,
      include: [{ model: Company, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });
    
    res.json({ stations });
  } catch (error) {
    next(error);
  }
};

const getStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const station = await Station.findByPk(id, {
      include: [{ model: Company, attributes: ['id', 'name'] }]
    });
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    res.json({ station });
  } catch (error) {
    next(error);
  }
};

const createStation = async (req, res, next) => {
  try {
    const { company_id, name, code, description, address, city, country, latitude, longitude, type, facilities } = req.body;
    
    const station = await Station.create({
      company_id,
      name,
      code: code || name.substring(0, 3).toUpperCase(),
      description,
      address,
      city,
      country: country || 'Tanzania',
      latitude,
      longitude,
      type: type || 'intermediate',
      facilities: facilities || {}
    });
    
    res.status(201).json({ station });
  } catch (error) {
    next(error);
  }
};

const updateStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const station = await Station.findByPk(id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    await station.update(req.body);
    res.json({ station });
  } catch (error) {
    next(error);
  }
};

const deleteStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const station = await Station.findByPk(id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    await station.destroy();
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listStations,
  getStation,
  createStation,
  updateStation,
  deleteStation
};