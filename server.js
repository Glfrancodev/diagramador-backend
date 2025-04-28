require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const { sequelize } = require('./src/models');

// Crear el servidor HTTP
const server = http.createServer(app);

// Levantar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});

// TEST: Intentamos conectar con la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos exitosa.');

    // Sincronizamos modelos con DB
    return sequelize.sync({ alter: true }); // Crea o actualiza las tablas
  })
  .then(() => {
    console.log('✅ Base de datos sincronizada.');
  })
  .catch((err) => {
    console.error('❌ Error al conectar la base de datos:', err);
  });