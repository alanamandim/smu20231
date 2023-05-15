const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 3000;
const conn_limit = 100;

//Dispara evento quando jogador entra na partida
io.on("connection", (socket) => {
  socket.on("registro", (id) => {
    if (conn_limit > io.sockets.adapter.sids.size) { //aqui foi estabelecido um limite de jogadores com isso ele verifica se é válido
      socket.emit("acesso_permitido");
    } else {
      socket.emit("negado");
    }
  });

  socket.on("entrar-na-sala", (sala) => {
    socket.join(sala);
    let jogadores = {};
    if (io.sockets.adapter.rooms.get(sala).size === 1) {
      jogadores = {
        primeiro: socket.id,
        segundo: undefined,
      };
    } else if (io.sockets.adapter.rooms.get(sala).size === 2) {
      let [primeiro] = io.sockets.adapter.rooms.get(sala);
      jogadores = {
        primeiro: primeiro,
        segundo: socket.id,
      };
    }
    console.log("Sala %s: %s", sala, jogadores);
    io.to(sala).emit("jogadores", jogadores);
  });
  // Sinalização de áudio: oferta
  socket.on("offer", (sala, description) => {
    socket.broadcast.to(sala).emit("offer", socket.id, description);
  });
  // Sinalização de áudio: atendimento da oferta
  socket.on("answer", (sala, description) => {
    socket.broadcast.to(sala).emit("answer", description);
  });
  // Sinalização de áudio: envio dos candidatos de caminho
  socket.on("candidate", (sala, signal) => {
    socket.broadcast.to(sala).emit("candidate", signal);
  });
  // Disparar evento quando jogador sair da partida
  socket.on("disconnect", () => { 
    if (jogadores.primeiro === socket.id) {
      jogadores.primeiro = undefined;
    }
    if (jogadores.segundo === socket.id) {
      jogadores.segundo = undefined;
    }
    io.to(sala).emit("jogadores", jogadores);
  });
  socket.on("estadoDoJogador", (sala, estado) => {
    socket.broadcast.to(sala).emit("desenharOutroJogador", estado);
  });
});

app.use(express.static("../cliente/"));
server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
