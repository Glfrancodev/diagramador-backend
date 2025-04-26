const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Proyecto = require('./proyecto.model');

const Pestana = sequelize.define('Pestana', {
  idPestana: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  idProyecto: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Proyecto,
      key: 'idProyecto'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'pestanas',
  timestamps: false
});

// Relación: Pestana pertenece a Proyecto
Pestana.belongsTo(Proyecto, { foreignKey: 'idProyecto' });
Proyecto.hasMany(Pestana, { foreignKey: 'idProyecto' });

module.exports = Pestana;
