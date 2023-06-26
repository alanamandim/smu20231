const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 3000;
const conn_limit = 1000;
const room_limit = 10;

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
    if (io.sockets.adapter.rooms.get(sala).size > room_limit) {
      socket.leave(sala);
    } else {
      io.to(sala).emit("jogadores", Array.from(io.sockets.adapter.rooms.get(sala)));
    };


  });
  
  socket.on("offer", ({ from, to, description }) => {
    io.to(to).emit("offer", { from: from, to: to, description: description });
  });
  // Sinalização de áudio: atendimento da oferta
  socket.on("answer", ({ from, to, description }) => {
    socket.to(to).emit("answer", { from: from, to: to, description: description });
  });
  // Sinalização de áudio: envio dos candidatos de caminho
  socket.on("candidate", ({ from, to, candidate }) => {
    socket.to(to).emit("candidate",{from: from, to: to, candidate: candidate} );
  });

  socket.on("offer1", (from, to, description) => {
    io.to(to).emit("offer1", from, to, description);
  });
  // Sinalização de áudio: atendimento da oferta
  socket.on("answer1", (from, to, description) => {
    socket.to(to).emit("answer1", { from: from, to: to, description: description });
  });
  // Sinalização de áudio: envio dos candidatos de caminho
  socket.on("candidate1", ({ from, to, candidate}) => {
    socket.to(to).emit("candidate1", { from: from, to: to, candidate: candidate });
  });
  // Disparar evento quando jogador sair da partida
  socket.on("disconnect", () => {
    Array.from(socket.rooms)
      .filter((sala) => sala !== socket.id)
      .forEach((sala) => {
        io.to(sala).emit(
          "jogadores",
          Array.from(io.sockets.adapter.rooms.get(sala)).filter(
            (sid) => sid !== socket.id
          )
        );
      });
  });
  socket.on("estadoDoJogador", (sala, estado) => {
    socket.broadcast.to(sala).emit("desenharOutroJogador", estado);
  });
});

app.use(express.static("../cliente/"));
server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
