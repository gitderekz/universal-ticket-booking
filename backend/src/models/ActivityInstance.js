const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ActivityInstance = sequelize.define('ActivityInstance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    activity_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'activities',
        key: 'id'
      }
    },
    facility_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'facilities',
        key: 'id'
      }
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total_slots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    available_slots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    price_modifier: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    special_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'open', 'closed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
  }, {
    tableName: 'activity_instances',
    indexes: [
      { fields: ['activity_id'] },
      { fields: ['facility_id'] },
      { fields: ['start_at'] },
      { fields: ['status'] }
    ]
  });

  return ActivityInstance;
};