const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Facility = sequelize.define('Facility', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    facility_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'facility_types',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    category: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    base_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    sittingPlan: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'sitting_plan'
    },
    sittingLength: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sitting_length'
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'suspended', 'inactive'),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    tableName: 'facilities',
    indexes: [
      { fields: ['company_id'] },
      { fields: ['facility_type_id'] },
      { fields: ['category'] },
      { fields: ['status'] }
    ]
  });

  return Facility;
};