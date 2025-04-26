const Pestana = require('../models/pestana.model');
const Proyecto = require('../models/proyecto.model');
const Invitacion = require('../models/invitacion.model');


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


class PestanaService {
  
  async crear(data, idUsuario) {
    const permiso = await tienePermisoProyecto(idUsuario, data.idProyecto);
    if (!permiso) throw new Error('No tienes permiso para agregar pestañas a este proyecto');    

    return await Pestana.create(data);
  }
  
  async listarPorProyecto(idProyecto, idUsuario) {
    const permiso = await tienePermisoProyecto(idUsuario, idProyecto);
    if (!permiso) throw new Error('No tienes permiso para ver las pestañas de este proyecto');    
  
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

    const permiso = await tienePermisoProyecto(idUsuario, pestana.idProyecto);
    if (!permiso) throw new Error('No tienes permiso para actualizar esta pestaña');
    

    await pestana.update(data);
    return pestana;
  }

  async eliminar(idPestana, idUsuario) {
    const pestana = await Pestana.findByPk(idPestana);
    if (!pestana) throw new Error('Pestaña no encontrada');

    const permiso = await tienePermisoProyecto(idUsuario, pestana.idProyecto);
    if (!permiso) throw new Error('No tienes permiso para eliminar esta pestaña');    

    await pestana.destroy();
    return { mensaje: 'Pestaña eliminada correctamente' };
  }

}

module.exports = new PestanaService();
