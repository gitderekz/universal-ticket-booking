const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Timetable = sequelize.define('Timetable', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    route_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'routes',
        key: 'id'
      }
    },
    transport_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'transports',
        key: 'id'
      }
    },
    departure_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    arrival_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    frequency_type: {
      type: DataTypes.ENUM('once', 'daily', 'weekly', 'custom'),
      allowNull: false,
      defaultValue: 'once'
    },
    frequency_config: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    effective_from: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    effective_until: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive'),
      allowNull: false,
      defaultValue: 'draft'
    }
  }, {
    tableName: 'timetables',
    indexes: [
      { fields: ['route_id'] },
      { fields: ['transport_id'] },
      { fields: ['frequency_type'] },
      { fields: ['status'] }
    ]
  });

  return Timetable;
};
