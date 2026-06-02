// backend/src/controllers/currencyController.js
const { Currency } = require('../models');
const { Op } = require('sequelize');

const listCurrencies = async (req, res, next) => {
  try {
    const currencies = await Currency.findAll({
      order: [['is_base', 'DESC'], ['code', 'ASC']]
    });
    
    res.json({ currencies });
  } catch (error) {
    next(error);
  }
};

const getCurrency = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currency = await Currency.findByPk(id);
    
    if (!currency) {
      return res.status(404).json({ message: 'Currency not found' });
    }
    
    res.json({ currency });
  } catch (error) {
    next(error);
  }
};

const createCurrency = async (req, res, next) => {
  try {
    const { code, name, symbol, exchange_rate, is_base, active } = req.body;
    
    // Check if currency already exists
    const existingCurrency = await Currency.findOne({ 
      where: { [Op.or]: [{ code }, { name }] } 
    });
    
    if (existingCurrency) {
      return res.status(400).json({ message: 'Currency with this code or name already exists' });
    }
    
    // If this is set as base, unset any existing base currency
    if (is_base) {
      await Currency.update({ is_base: false }, { where: { is_base: true } });
    }
    
    const currency = await Currency.create({
      code: code.toUpperCase(),
      name,
      symbol,
      exchange_rate,
      is_base: is_base || false,
      active: active !== undefined ? active : true
    });
    
    res.status(201).json({ currency });
  } catch (error) {
    next(error);
  }
};

const updateCurrency = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, symbol, exchange_rate, is_base, active } = req.body;
    
    const currency = await Currency.findByPk(id);
    if (!currency) {
      return res.status(404).json({ message: 'Currency not found' });
    }
    
    // If this is set as base, unset any existing base currency
    if (is_base && !currency.is_base) {
      await Currency.update({ is_base: false }, { where: { is_base: true, id: { [Op.ne]: id } } });
    }
    
    await currency.update({
      code: code || currency.code,
      name: name || currency.name,
      symbol: symbol || currency.symbol,
      exchange_rate: exchange_rate !== undefined ? exchange_rate : currency.exchange_rate,
      is_base: is_base !== undefined ? is_base : currency.is_base,
      active: active !== undefined ? active : currency.active
    });
    
    res.json({ currency });
  } catch (error) {
    next(error);
  }
};

const deleteCurrency = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currency = await Currency.findByPk(id);
    
    if (!currency) {
      return res.status(404).json({ message: 'Currency not found' });
    }
    
    // Prevent deletion of base currency
    if (currency.is_base) {
      return res.status(400).json({ message: 'Cannot delete base currency' });
    }
    
    await currency.destroy();
    res.json({ message: 'Currency deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCurrencies,
  getCurrency,
  createCurrency,
  updateCurrency,
  deleteCurrency
};