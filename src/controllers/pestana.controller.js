const pestanaService = require('../services/pestana.service');

class PestanaController {
  async crear(req, res) {
    try {
      const pestana = await pestanaService.crear(req.body, req.usuario.idUsuario);
      res.status(201).json(pestana);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async listarPorProyecto(req, res) {
    try {
      const pestanas = await pestanaService.listarPorProyecto(req.params.idProyecto, req.usuario.idUsuario);
      res.json(pestanas);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }
  

  async obtener(req, res) {
    try {
      const pestana = await pestanaService.obtenerPorId(req.params.id);
      res.json(pestana);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async actualizar(req, res) {
    try {
      const pestana = await pestanaService.actualizar(req.params.id, req.usuario.idUsuario, req.body);
      res.json(pestana);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }

  async eliminar(req, res) {
    try {
      const resultado = await pestanaService.eliminar(req.params.id, req.usuario.idUsuario);
      res.json(resultado);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }
}

module.exports = new PestanaController();
