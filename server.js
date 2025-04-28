require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./src/models'); // ⬅️ Importamos conexión a DB

const server = http.createServer(app);
process.on('uncaughtException', (err) => {
  console.error('🔥 uncaughtException detectado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 unhandledRejection detectado:', reason);
});

// ⬇️ AUMENTAMOS EL TIMEOUT A 5 MINUTOS
server.setTimeout(5 * 60 * 1000); // 5 minutos

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// TEST: Intentamos conectar con la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos exitosa.');

    // Sincronizamos modelos con DB
    return sequelize.sync({ alter: true }); // Crea o actualiza las tablas
  })
  .then(() => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar la base de datos:', err);
  });
