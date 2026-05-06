const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transport = sequelize.define('Transport', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    transport_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'transport_types',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    registration_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'maintenance', 'retired'),
      allowNull: false,
      defaultValue: 'draft'
    }
  }, {
    tableName: 'transports',
    indexes: [
      { fields: ['company_id'] },
      { fields: ['transport_type_id'] },
      { fields: ['registration_number'] },
      { fields: ['status'] }
    ]
  });

  return Transport;
};
