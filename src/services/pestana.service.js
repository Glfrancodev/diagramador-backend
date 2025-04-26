const Pestana = require('../models/pestana.model');
const Proyecto = require('../models/proyecto.model');

class PestanaService {
  async crear(data, idUsuario) {
    const proyecto = await Proyecto.findByPk(data.idProyecto);
    if (!proyecto) throw new Error('Proyecto no encontrado');
    if (proyecto.idUsuario !== idUsuario) throw new Error('No tienes permiso para agregar pestañas a este proyecto');

    return await Pestana.create(data);
  }

  async listarPorProyecto(idProyecto, idUsuario) {
    const proyecto = await Proyecto.findByPk(idProyecto);
    if (!proyecto) {
      throw new Error('Proyecto no encontrado');
    }
  
    if (proyecto.idUsuario !== idUsuario) {
      throw new Error('No tienes permiso para ver las pestañas de este proyecto');
    }
  
    return await Pestana.findAll({ where: { idProyecto } });
  }
  

  async obtenerPorId(idPestana) {
    const pestana = await Pestana.findByPk(idPestana);
    if (!pestana) throw new Error('Pestaña no encontrada');
    return pestana;
  }

  async actualizar(idPestana, idUsuario, data) {
    const pestana = await Pestana.findByPk(idPestana);
    if (!pestana) throw new Error('Pestaña no encontrada');

    const proyecto = await Proyecto.findByPk(pestana.idProyecto);
    if (!proyecto || proyecto.idUsuario !== idUsuario) {
      throw new Error('No tienes permiso para actualizar esta pestaña');
    }

    await pestana.update(data);
    return pestana;
  }

  async eliminar(idPestana, idUsuario) {
    const pestana = await Pestana.findByPk(idPestana);
    if (!pestana) throw new Error('Pestaña no encontrada');

    const proyecto = await Proyecto.findByPk(pestana.idProyecto);
    if (!proyecto || proyecto.idUsuario !== idUsuario) {
      throw new Error('No tienes permiso para eliminar esta pestaña');
    }

    await pestana.destroy();
    return { mensaje: 'Pestaña eliminada correctamente' };
  }
}

module.exports = new PestanaService();
