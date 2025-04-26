const express = require('express');
const router = express.Router();
const pestanaController = require('../controllers/pestana.controller');
const verificarToken = require('../middlewares/auth.middleware');

// Protegido con token
router.post('/', verificarToken, pestanaController.crear);
router.get('/proyecto/:idProyecto', verificarToken, pestanaController.listarPorProyecto);
router.get('/:id', verificarToken, pestanaController.obtener);
router.put('/:id', verificarToken, pestanaController.actualizar);
router.delete('/:id', verificarToken, pestanaController.eliminar);

module.exports = router;
