const Elemento = require('../models/elemento.model');
const Pestana = require('../models/pestana.model');
const Proyecto = require('../models/proyecto.model');
const Invitacion = require('../models/invitacion.model'); // ⚡ AGREGAR

async function tienePermisoProyecto(idUsuario, idProyecto) {
  const proyecto = await Proyecto.findByPk(idProyecto);
  if (!proyecto) throw new Error('Proyecto no encontrado');

  if (proyecto.idUsuario === idUsuario) {
    return true; // Es el dueño
  }

  const invitacion = await Invitacion.findOne({
    where: {
      idProyecto,
      idUsuario,
      estado: 'aceptada'
    }
  });

  return !!invitacion; // True si tiene invitación aceptada
}


class ElementoService {
  async crear(data, idUsuario) {
    const pestana = await Pestana.findByPk(data.idPestana);
    if (!pestana) throw new Error('Pestaña no encontrada');
    
    const permiso = await tienePermisoProyecto(idUsuario, pestana.idProyecto);
    if (!permiso) {
      throw new Error('No tienes permiso para agregar elementos a esta pestaña');
    }    

    return await Elemento.create(data);
  }

  async listarPorPestana(idPestana, idUsuario) {
    const pestana = await Pestana.findByPk(idPestana);
    if (!pestana) throw new Error('Pestaña no encontrada');
    
    const permiso = await tienePermisoProyecto(idUsuario, pestana.idProyecto);
    if (!permiso) {
      throw new Error('No tienes permiso para ver los elementos de esta pestaña');
    }
    

    return await Elemento.findAll({ where: { idPestana } });
  }

  async obtenerPorId(idElemento) {
    const elemento = await Elemento.findByPk(idElemento);
    if (!elemento) throw new Error('Elemento no encontrado');
    return elemento;
  }

  async actualizar(idElemento, idUsuario, data) {
    const elemento = await Elemento.findByPk(idElemento);
    if (!elemento) throw new Error('Elemento no encontrado');
    
    const pestana = await Pestana.findByPk(elemento.idPestana);
    if (!pestana) throw new Error('Pestaña no encontrada');
    
    const permiso = await tienePermisoProyecto(idUsuario, pestana.idProyecto);
    if (!permiso) {
      throw new Error('No tienes permiso para actualizar este elemento');
    }

    await elemento.update(data);
    return elemento;
  }

  async eliminar(idElemento, idUsuario) {
    const elemento = await Elemento.findByPk(idElemento);
    if (!elemento) throw new Error('Elemento no encontrado');
    
    const pestana = await Pestana.findByPk(elemento.idPestana);
    if (!pestana) throw new Error('Pestaña no encontrada');
    
    const permiso = await tienePermisoProyecto(idUsuario, pestana.idProyecto);
    if (!permiso) {
      throw new Error('No tienes permiso para eliminar este elemento');
    }    

    await elemento.destroy();
    return { mensaje: 'Elemento eliminado correctamente' };
  }
}

module.exports = new ElementoService();
