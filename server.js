require("dotenv").config();
const app            = require("./src/app");
const http           = require("http");
const { Server }     = require("socket.io");
const { sequelize }  = require("./src/models");

/* ---------- HTTP ---------- */
const server = http.createServer(app);

/* ---------- socket.io ---------- */
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", socket => {
  console.log("🟢 Conectado:", socket.id);

  /* 1️⃣  el cliente indica a qué proyecto pertenece */
  socket.on("joinProject", ({ projectId }) => {
    if (!projectId) return;
    socket.join(projectId);
    console.log(`➕ ${socket.id} entró a sala ${projectId}`);
  });

  /* 2️⃣  snapshot de una pestaña (contenido html / css) */
  socket.on("editorUpdate", data => {
    const { projectId } = data;
    if (!projectId) return;
    socket.join(projectId);                 // por si acaso
    io.to(projectId).emit("editorUpdate", data);
    console.log(`🔄 snapshot difundido en ${projectId}`);
  });

  socket.on("tabsSnapshot", pkt => {
    if (!pkt.projectId) return;
    socket.join(pkt.projectId);
    io.to(pkt.projectId).emit("tabsSnapshot", pkt);
  });

  /* 3️⃣  alta / baja / rename de pestañas */
  socket.on("tabsUpdate", data => {
    const { projectId } = data;
    if (!projectId) return;
    socket.join(projectId);
    io.to(projectId).emit("tabsUpdate", data);
    console.log(`📑 tabsUpdate difundido en ${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Desconectado:", socket.id);
  });
});

/* ---------- levantar servidor ---------- */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 HTTP + WebSocket escuchando en puerto ${PORT}`)
);

/* ---------- base de datos ---------- */
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ DB conectada");
    return sequelize.sync({ alter: true });
  })
  .then(() => console.log("✅ Tablas listas"))
  .catch(err => console.error("❌ DB error:", err));
