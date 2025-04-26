const express = require('express');
const router = express.Router();
const proyectoController = require('../controllers/proyecto.controller');
const verificarToken = require('../middlewares/auth.middleware');

// Protegidos
router.post('/', verificarToken, proyectoController.crear);
router.get('/', verificarToken, proyectoController.listar);
router.get('/mis-proyectos', verificarToken, proyectoController.listarPorUsuario);
router.get('/:id', verificarToken, proyectoController.obtener);
router.put('/:id', verificarToken, proyectoController.actualizar);
router.delete('/:id', verificarToken, proyectoController.eliminar);

module.exports = router;
