const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./usuario.routes');
const authRoutes = require('./auth.routes');

router.use('/api/usuarios', usuarioRoutes);
router.use('/api/auth', authRoutes);

module.exports = router;
