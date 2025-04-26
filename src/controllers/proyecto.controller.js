const proyectoService = require('../services/proyecto.service');

class ProyectoController {
  async crear(req, res) {
    try {
      const data = {
        ...req.body,
        idUsuario: req.usuario.idUsuario // Sacamos el id del token
      };
      const proyecto = await proyectoService.crear(data);
      res.status(201).json(proyecto);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async listar(req, res) {
    const proyectos = await proyectoService.listar();
    res.json(proyectos);
  }

  async listarPorUsuario(req, res) {
    const proyectos = await proyectoService.listarPorUsuario(req.usuario.idUsuario);
    res.json(proyectos);
  }

  async obtener(req, res) {
    try {
      const proyecto = await proyectoService.obtenerPorId(req.params.id);
      res.json(proyecto);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async actualizar(req, res) {
    try {
      const proyecto = await proyectoService.actualizar(req.params.id, req.usuario.idUsuario, req.body);
      res.json(proyecto);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }
  

  async eliminar(req, res) {
    try {
      const resultado = await proyectoService.eliminar(req.params.id, req.usuario.idUsuario);
      res.json(resultado);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }
  
}

module.exports = new ProyectoController();
