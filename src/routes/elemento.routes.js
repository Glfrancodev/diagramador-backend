const express = require('express');
const router = express.Router();
const elementoController = require('../controllers/elemento.controller');
const verificarToken = require('../middlewares/auth.middleware');

// Protegido con token
router.post('/', verificarToken, elementoController.crear);
router.get('/pestana/:idPestana', verificarToken, elementoController.listarPorPestana);
router.get('/:id', verificarToken, elementoController.obtener);
router.put('/:id', verificarToken, elementoController.actualizar);
router.delete('/:id', verificarToken, elementoController.eliminar);

module.exports = router;
