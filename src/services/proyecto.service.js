const Proyecto = require('../models/proyecto.model');

class ProyectoService {
  async crear(data) {
    return await Proyecto.create(data);
  }

  async listar() {
    return await Proyecto.findAll();
  }

  async listarPorUsuario(idUsuario) {
    return await Proyecto.findAll({ where: { idUsuario } });
  }

  async obtenerPorId(idProyecto) {
    const proyecto = await Proyecto.findByPk(idProyecto);
    if (!proyecto) throw new Error('Proyecto no encontrado');
    return proyecto;
  }

  async actualizar(idProyecto, idUsuario, data) {
    const proyecto = await Proyecto.findByPk(idProyecto);
    if (!proyecto) throw new Error('Proyecto no encontrado');
  
    if (proyecto.idUsuario !== idUsuario) {
      throw new Error('No tienes permiso para actualizar este proyecto');
    }
  
    await proyecto.update(data);
    return proyecto;
  }
  

  async eliminar(idProyecto, idUsuario) {
    const proyecto = await Proyecto.findByPk(idProyecto);
    if (!proyecto) throw new Error('Proyecto no encontrado');
  
    if (proyecto.idUsuario !== idUsuario) {
      throw new Error('No tienes permiso para eliminar este proyecto');
    }
  
    await proyecto.destroy();
    return { mensaje: 'Proyecto eliminado correctamente' };
  }
  
}

module.exports = new ProyectoService();
