// backend/src/controllers/roleController.js
const { Role, UserRole, User } = require('../models');
const { Op } = require('sequelize');

const listRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      order: [['created_at', 'ASC']]
    });
    
    // Get user counts per role
    const counts = await UserRole.findAll({
      attributes: ['role_id', [require('sequelize').fn('COUNT', require('sequelize').col('role_id')), 'count']],
      group: ['role_id']
    });
    
    const countMap = counts.reduce((acc, record) => {
      acc[record.role_id] = Number(record.get('count'));
      return acc;
    }, {});
    
    res.json({
      roles: roles.map((role) => ({
        ...role.toJSON(),
        user_count: countMap[role.id] || 0
      }))
    });
  } catch (error) {
    next(error);
  }
};

const getRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    res.json({ role });
  } catch (error) {
    next(error);
  }
};

const createRole = async (req, res, next) => {
  try {
    const { name, slug, description, is_system } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ 
      where: { [Op.or]: [{ slug }, { name }] } 
    });
    
    if (existingRole) {
      return res.status(400).json({ message: 'Role with this name or slug already exists' });
    }
    
    const role = await Role.create({
      name,
      slug,
      description,
      is_system: is_system || false
    });
    
    res.status(201).json({ role });
  } catch (error) {
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, is_system } = req.body;
    
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Don't allow modification of system roles' slugs
    if (role.is_system && slug && slug !== role.slug) {
      return res.status(400).json({ message: 'Cannot change slug of system role' });
    }
    
    await role.update({
      name: name || role.name,
      slug: slug || role.slug,
      description: description !== undefined ? description : role.description,
      is_system: is_system !== undefined ? is_system : role.is_system
    });
    
    res.json({ role });
  } catch (error) {
    next(error);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if role is a system role
    if (role.is_system) {
      return res.status(400).json({ message: 'Cannot delete system role' });
    }
    
    // Check if role is assigned to any users
    const userCount = await UserRole.count({ where: { role_id: id } });
    if (userCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role - it is assigned to ${userCount} user(s)` 
      });
    }
    
    await role.destroy();
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole
};