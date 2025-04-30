const express = require('express');
const router = express.Router();
const proyectoController = require('../controllers/proyecto.controller');
const verificarToken = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Carpeta temporal

// Protegidos
router.post('/', verificarToken, proyectoController.crear);
router.get('/', verificarToken, proyectoController.listar);
router.get('/permisos', verificarToken, proyectoController.listarPermitidos);
router.get('/invitados', verificarToken, proyectoController.listarInvitados);
router.post('/importar-boceto', upload.single('imagen'), proyectoController.importarBoceto);
router.post('/crear-desde-imagen', verificarToken, proyectoController.crearDesdeImagen); // ✅ NUEVA RUTA
router.get('/exportar/:id', verificarToken, proyectoController.exportar);

// ⬇⬇ NUEVO: Ruta para exportar el CRUD simulado
router.post('/exportar-crud-simulado', verificarToken, proyectoController.exportarCrudSimulado);

router.get('/mis-proyectos', verificarToken, proyectoController.listarPorUsuario);
router.get('/:id', verificarToken, proyectoController.obtener);
router.put('/:id', verificarToken, proyectoController.actualizar);
router.delete('/:id', verificarToken, proyectoController.eliminar);

module.exports = router;
