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
  // Sinalização de áudio: oferta
  //socket.on("offer", (sala, description) => {
  // socket.broadcast.to(sala).emit("offer", socket.id, description);
  // });
  // Sinalização de áudio: atendimento da oferta
  //socket.on("answer", (sala, description) => {
  // socket.broadcast.to(sala).emit("answer", description);
  //});
  // Sinalização de áudio: envio dos candidatos de caminho
  //socket.on("candidate", (sala, signal) => {
  //  socket.broadcast.to(sala).emit("candidate", signal);
  //});
  socket.on("offer", (from, to, description) => {
    io.to(to).emit("offer", from, to, description);
  });
  // Sinalização de áudio: atendimento da oferta
  socket.on("answer", (to, description) => {
    socket.to(to).emit("answer", description);
  });
  // Sinalização de áudio: envio dos candidatos de caminho
  socket.on("candidate", (to, signal) => {
    socket.to(to).emit("candidate", signal);
  });

  socket.on("offer1", (from, to, description) => {
    io.to(to).emit("offer1", from, to, description);
  });
  // Sinalização de áudio: atendimento da oferta
  socket.on("answer1", ({ from: from, to: to, description: description }) => {
    socket.to(to).emit("answer1", description);
  });
  // Sinalização de áudio: envio dos candidatos de caminho
  socket.on("candidate1", ({ from: from, to: to, candidate: candidate }) => {
    socket.to(to).emit("candidate1", signal);
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
