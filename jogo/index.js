import config from "./config.js";
import abertura from "./abertura.js";
import principal from "./principal.js";
import encerramento from "./encerramento.js";

class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.socket = io(); //sinalização,escolha de caminho
    this.socket.on("connect",() =>{
      this.socket.emit("registro", this.socket.id);
    });

    this.socket.on("acesso_permitido", () => {
      this.registro = true;
    });

    this.socket.on("negado", () => {
      this.registro = false;
    });

    this.ice_servers = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    };
    this.audio = document.querySelector("audio");
    this.midias = undefined;


    this.scene.add("abertura", abertura);
    this.scene.add("principal", principal);
    this.scene.add("encerramento", encerramento);
    this.scene.start("abertura");
  }
}

window.onload = () => {
  window.game = new Game();
};
