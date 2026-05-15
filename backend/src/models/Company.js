const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Company = sequelize.define('Company', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('transport', 'facility', 'entertainment', 'events', 'outdoor', 'housing', 'sports'),
      allowNull: false,
      defaultValue: 'transport'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'suspended', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'companies',
    indexes: [
      { fields: ['owner_id'] },
      { fields: ['slug'] },
      { fields: ['category'] },
      { fields: ['status'] }
    ]
  });

  return Company;
};
