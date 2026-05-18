const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('SystemLog', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('success', 'error', 'warning', 'info'),
      allowNull: false,
      defaultValue: 'info'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mac_address: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'system_logs',
    indexes: [
      { fields: ['user_id'] },
    ],
    // timestamps: false,
  });
};
