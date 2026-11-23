
import { createServer } from "node:http";
import { Server } from "socket.io";

const http = createServer();
const io = new Server(http, { cors: { origin: "*" } });

const usuaris = {};

// Comprobar y preparar el perfil
function perfil(p = {}) {
  return {
    nom: String(p.nom || "Convidat").trim().slice(0, 24),
    color: /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : "#10b981"
  };
}

// Comprobar la posición del jugador
function posicio(p = {}) {
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;

  return {
    x: Math.max(0, Math.min(640, p.x)),
    y: Math.max(0, Math.min(480, p.y)),
    direccio: ["avall", "amunt", "dreta", "esquerra"].includes(p.direccio)
      ? p.direccio : "avall",
    movent: p.movent === true
  };
}

// Cuando se conecta un usuario
io.on("connection", (socket) => {

  socket.on("entrar", (d = {}) => {
    const pos = posicio(d);
    if (!pos) return;

    usuaris[socket.id] = {
      id: socket.id,
      ...perfil(d),
      ...pos
    };

    socket.emit("estat-inicial", usuaris);
    socket.broadcast.emit("jugador-actualitzat", usuaris[socket.id]);
  });

  // Recibir movimiento
  socket.on("moure-jugador", (d) => {
    const u = usuaris[socket.id];
    const pos = posicio(d);

    if (!u || !pos) return;

    Object.assign(u, pos);
    socket.broadcast.emit("jugador-actualitzat", u);
  });

  // Actualizar perfil
  socket.on("actualitzar-perfil", (d) => {
    const u = usuaris[socket.id];
    if (!u) return;

    Object.assign(u, perfil(d));
    socket.broadcast.emit("jugador-actualitzat", u);
  });

  // Cuando un usuario se desconecta
  socket.on("disconnect", () => {
    delete usuaris[socket.id];
    io.emit("jugador-desconnectat", socket.id);
  });
});

// Iniciar servidor
http.listen(3000, "127.0.0.1", () => {
  console.log("Relay actiu a http://127.0.0.1:3000");
});
