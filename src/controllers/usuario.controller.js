const cors = require('cors');  // Importar cors
const usuarioService = require('../services/usuario.service');

class UsuarioController {
  async crear(req, res) {
    // Aplicamos CORS solo para esta ruta
    cors({
      origin: process.env.CORS_ORIGIN || '*', // Definir el origen en Railway
      methods: ["POST"], // Solo permitir el método POST
      credentials: true,
    })(req, res, async () => {
      try {
        const usuario = await usuarioService.crear(req.body);
        res.status(201).json(usuario);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });
  }

  async listar(req, res) {
    // Aplicamos CORS solo para esta ruta
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ["GET"], // Solo permitir el método GET
      credentials: true,
    })(req, res, async () => {
      const usuarios = await usuarioService.listar();
      res.json(usuarios);
    });
  }

  async obtener(req, res) {
    // Aplicamos CORS solo para esta ruta
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ["GET"], // Solo permitir el método GET
      credentials: true,
    })(req, res, async () => {
      try {
        const usuario = await usuarioService.obtenerPorId(req.params.id);
        res.json(usuario);
      } catch (err) {
        res.status(404).json({ error: err.message });
      }
    });
  }

  async actualizar(req, res) {
    // Aplicamos CORS solo para esta ruta
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ["PUT"], // Solo permitir el método PUT
      credentials: true,
    })(req, res, async () => {
      try {
        const usuario = await usuarioService.actualizar(req.params.id, req.body);
        res.json(usuario);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });
  }

  async cambiarEstado(req, res) {
    // Aplicamos CORS solo para esta ruta
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ["PATCH"], // Solo permitir el método PATCH
      credentials: true,
    })(req, res, async () => {
      try {
        const resultado = await usuarioService.cambiarEstado(req.params.id);
        res.json(resultado);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });
  }

  async listarActivos(req, res) {
    // Aplicamos CORS solo para esta ruta
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ["GET"], // Solo permitir el método GET
      credentials: true,
    })(req, res, async () => {
      const usuarios = await usuarioService.listarActivos();
      res.json(usuarios);
    });
  }

  async perfil(req, res) {
    // Aplicamos CORS solo para esta ruta
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ["GET"], // Solo permitir el método GET
      credentials: true,
    })(req, res, async () => {
      try {
        const usuario = await usuarioService.perfil(req.usuario.idUsuario);
        res.json(usuario);
      } catch (err) {
        res.status(404).json({ error: err.message });
      }
    });
  }
}

module.exports = new UsuarioController();
