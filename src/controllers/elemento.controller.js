const elementoService = require('../services/elemento.service');

class ElementoController {
  async crear(req, res) {
    try {
      const elemento = await elementoService.crear(req.body, req.usuario.idUsuario);
      res.status(201).json(elemento);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async listarPorPestana(req, res) {
    try {
      const elementos = await elementoService.listarPorPestana(req.params.idPestana, req.usuario.idUsuario);
      res.json(elementos);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }

  async obtener(req, res) {
    try {
      const elemento = await elementoService.obtenerPorId(req.params.id);
      res.json(elemento);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async actualizar(req, res) {
    try {
      const elemento = await elementoService.actualizar(req.params.id, req.usuario.idUsuario, req.body);
      res.json(elemento);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }

  async eliminar(req, res) {
    try {
      const resultado = await elementoService.eliminar(req.params.id, req.usuario.idUsuario);
      res.json(resultado);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }
}

module.exports = new ElementoController();
