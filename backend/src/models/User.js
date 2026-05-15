const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    preferred_language: {
      type: DataTypes.STRING(5),
      defaultValue: 'sw'
    },
    preferred_currency_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'currencies',
        key: 'id'
      }
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    phone_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'banned'),
      defaultValue: 'active'
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_login_ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'users',
    indexes: [
      { fields: ['status'] }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash && !user.password_hash.startsWith('$2a$')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash') && user.password_hash && !user.password_hash.startsWith('$2a$')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      }
    }
  });

  // Instance methods
  User.prototype.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  return User;
};