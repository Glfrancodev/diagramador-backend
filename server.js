require("dotenv").config();
const app           = require("./src/app");
const http          = require("http");
const { Server }    = require("socket.io");
const { sequelize } = require("./src/models");

/* ---------- HTTP ---------- */
const server = http.createServer(app);

/* ---------- socket.io ---------- */
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", socket => {
  console.log("🟢 Conectado:", socket.id);

  /* ---------- proyecto (sala) ---------- */
  socket.on("joinProject", ({ projectId }) => {
    if (!projectId) return;
    socket.join(projectId);
    console.log(`➕ ${socket.id} entró a sala ${projectId}`);
  });

  /* ---------- editor (html / css snapshot) ---------- */
  socket.on("editorUpdate", data => {
    if (!data.projectId) return;
    io.to(data.projectId).emit("editorUpdate", data);
  });

  /* ---------- pestañas: altas / renombres / lista ---------- */
  socket.on("tabsSnapshot", pkt => {
    if (!pkt.projectId) return;
    io.to(pkt.projectId).emit("tabsSnapshot", pkt);
  });

  socket.on("tabsUpdate", data => {
    if (!data.projectId) return;
    io.to(data.projectId).emit("tabsUpdate", data);
  });

  /* ---------- CURSORES colaborativos ---------- */
  socket.on("cursorMove", pkt => {
    if (!pkt.projectId) return;
    socket.to(pkt.projectId).emit("cursorMove", { ...pkt, socketId: socket.id });
  });

  socket.on("cursorLeave", ({ projectId, socketId }) => {
    if (projectId) io.to(projectId).emit("cursorLeave", { socketId });
  });

  /* ---------- desconexión ---------- */
  socket.on("disconnect", () => {
    console.log("🔴 Desconectado:", socket.id);
    // avisar a todas las rooms en las que estaba
    socket.rooms.forEach(room => {
      if (room !== socket.id) io.to(room).emit("cursorLeave", { socketId: socket.id });
    });
  });
});

/* ---------- levantar servidor ---------- */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 HTTP + WebSocket escuchando en puerto ${PORT}`)
);

/* ---------- base de datos ---------- */
sequelize.authenticate()
  .then(() => {
    console.log("✅ DB conectada");
    return sequelize.sync({ alter: true });
  })
  .then(() => console.log("✅ Tablas listas"))
  .catch(err => console.error("❌ DB error:", err));
