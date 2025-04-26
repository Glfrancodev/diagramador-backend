const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pestana = require('./pestana.model');

const Elemento = sequelize.define('Elemento', {
  idElemento: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  propiedades: {
    type: DataTypes.JSON,
    allowNull: true
  },
  idPestana: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Pestana,
      key: 'idPestana'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'elementos',
  timestamps: false
});

// Relación: Elemento pertenece a Pestaña
Elemento.belongsTo(Pestana, { foreignKey: 'idPestana' });
Pestana.hasMany(Elemento, { foreignKey: 'idPestana' });

module.exports = Elemento;
