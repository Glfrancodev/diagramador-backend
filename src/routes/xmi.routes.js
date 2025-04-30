const express = require('express');
const multer = require('multer');
const xmiController = require('../controllers/xmi.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 👇 Esta es la única ruta necesaria
router.post('/importar-xmi', upload.single('archivo'), xmiController.analizarXMI);

module.exports = router;
