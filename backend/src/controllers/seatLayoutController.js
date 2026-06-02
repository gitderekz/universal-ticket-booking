// backend/src/controllers/seatLayoutController.js
const { SeatLayout, Transport, Facility } = require('../models');
const { Op } = require('sequelize');

const listSeatLayouts = async (req, res, next) => {
  try {
    const { layoutable_type, layoutable_id } = req.query;
    
    const where = {};
    if (layoutable_type) {
      where.layoutable_type = layoutable_type;
    }
    if (layoutable_id) {
      where.layoutable_id = layoutable_id;
    }
    
    const seatLayouts = await SeatLayout.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    
    // Enrich with entity names
    const enrichedLayouts = await Promise.all(seatLayouts.map(async (layout) => {
      let entityName = '';
      if (layout.layoutable_type === 'transport') {
        const transport = await Transport.findByPk(layout.layoutable_id);
        entityName = transport?.name || 'Unknown Transport';
      } else if (layout.layoutable_type === 'facility') {
        const facility = await Facility.findByPk(layout.layoutable_id);
        entityName = facility?.name || 'Unknown Facility';
      }
      
      return {
        ...layout.toJSON(),
        entity_name: entityName
      };
    }));
    
    res.json({ seat_layouts: enrichedLayouts });
  } catch (error) {
    next(error);
  }
};

const getSeatLayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seatLayout = await SeatLayout.findByPk(id);
    
    if (!seatLayout) {
      return res.status(404).json({ message: 'Seat layout not found' });
    }
    
    res.json({ seat_layout: seatLayout });
  } catch (error) {
    next(error);
  }
};

const createSeatLayout = async (req, res, next) => {
  try {
    const {
      layoutable_id,
      layoutable_type,
      pattern,
      rows,
      layout_type,
      config,
      status
    } = req.body;
    
    // Calculate total units
    const seatsPerRow = pattern.split('-').reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    const total_units = seatsPerRow * rows;
    
    const seatLayout = await SeatLayout.create({
      layoutable_id,
      layoutable_type,
      layout_type: layout_type || 'seat',
      pattern,
      rows,
      total_units,
      config: config || { layout_pattern: pattern, rows, seats_per_row: seatsPerRow },
      status: status || 'active'
    });
    
    res.status(201).json({ seat_layout: seatLayout });
  } catch (error) {
    next(error);
  }
};

const updateSeatLayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      pattern,
      rows,
      config,
      status
    } = req.body;
    
    const seatLayout = await SeatLayout.findByPk(id);
    if (!seatLayout) {
      return res.status(404).json({ message: 'Seat layout not found' });
    }
    
    const updateData = {};
    if (pattern) {
      updateData.pattern = pattern;
      const seatsPerRow = pattern.split('-').reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      updateData.total_units = seatsPerRow * (rows || seatLayout.rows);
      updateData.config = { layout_pattern: pattern, rows: rows || seatLayout.rows, seats_per_row: seatsPerRow };
    }
    if (rows) {
      updateData.rows = rows;
      const seatsPerRow = (pattern || seatLayout.pattern).split('-').reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      updateData.total_units = seatsPerRow * rows;
      if (!updateData.config) {
        updateData.config = { layout_pattern: pattern || seatLayout.pattern, rows, seats_per_row: seatsPerRow };
      } else {
        updateData.config.rows = rows;
      }
    }
    if (config) updateData.config = config;
    if (status) updateData.status = status;
    
    await seatLayout.update(updateData);
    res.json({ seat_layout: seatLayout });
  } catch (error) {
    next(error);
  }
};

const deleteSeatLayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seatLayout = await SeatLayout.findByPk(id);
    
    if (!seatLayout) {
      return res.status(404).json({ message: 'Seat layout not found' });
    }
    
    await seatLayout.destroy();
    res.json({ message: 'Seat layout deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSeatLayouts,
  getSeatLayout,
  createSeatLayout,
  updateSeatLayout,
  deleteSeatLayout
};