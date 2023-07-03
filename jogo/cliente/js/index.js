import config from './config.js'
import registro from './registro.js'
import presenca from './presença.js'

class Game extends Phaser.Game {
  constructor () {
    super(config)

    this.socket = io() // sinalização,escolha de caminho
    this.socket.on('connect', () => {
      this.socket.emit('registro', this.socket.id)
    })

    this.socket.on('acesso_permitido', () => {
      this.registro = true
    })

    this.socket.on('negado', () => {
      this.registro = false
    })

    this.ice_servers = { // consulte o stun do google ( tem NAT, qual tipo e qual o provável end de rede e de transporte)
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    }
    this.audio = document.querySelector('audio')
    this.midias = undefined

    this.scene.add('registro', registro)
    this.scene.add('presença', presenca)
    this.scene.start('registro')
  }
}

window.onload = () => {
  window.game = new Game()
}
