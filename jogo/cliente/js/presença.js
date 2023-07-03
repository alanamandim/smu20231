export default class presenca extends Phaser.Scene {
  constructor () {
    super('presença')

    this.localConnection = {}
    this.remoteConnection = {}
  }

  preload () { }

  create () {
    this.game.jogadores.forEach((jogador, indice) => {
      /* A (0) -> B (1), A (0) -> C (2) */
      if (indice === 0 && jogador === this.game.socket.id) {
        [1, 2].forEach(num => {
          const from = this.game.socket.id
          const to = this.game.jogadores[num]

          this.localConnection[to] = { conn: new RTCPeerConnection(this.game.ice_servers) }

          this.game.midias
            .getTracks()
            .forEach((track) =>
              this.localConnection[to].conn.addTrack(track, this.game.midias)
            )

          this.localConnection[to].conn.onicecandidate = ({ candidate }) => {
            candidate &&
              this.game.socket.emit('candidate', { from, to, candidate })
          }

          this.localConnection[to].conn.ontrack = ({ streams: [stream] }) => {
            this.game.audio.srcObject = stream
          }

          this.localConnection[to].conn
            .createOffer()
            .then((offer) => this.localConnection[to].conn.setLocalDescription(offer))
            .then(() => {
              this.game.socket.emit('offer', { from, to, description: this.localConnection[to].conn.localDescription })
            })
        })
      } else if (indice === 1 && jogador === this.game.socket.id) {
        /* B (1) -> C (2) */
        const from = this.game.jogadores[1]
        const to = this.game.jogadores[2]
        this.localConnection[to] = { conn: new RTCPeerConnection(this.game.ice_servers) }

        this.game.midias
          .getTracks()
          .forEach((track) =>
            this.localConnection[to].conn.addTrack(track, this.game.midias)
          )

        this.localConnection[to].conn.onicecandidate = ({ candidate }) => {
          candidate &&
            this.game.socket.emit('candidate', { from, to, candidate })
        }

        this.localConnection[to].conn.ontrack = ({ streams: [stream] }) => {
          this.game.audio.srcObject = stream
        }

        this.localConnection[to].conn
          .createOffer()
          .then((offer) => this.localConnection[to].conn.setLocalDescription(offer))
          .then(() => {
            this.game.socket.emit('offer', { from, to, description: this.localConnection[to].conn.localDescription })
          })
      }

      if (jogador === this.game.socket.id) {
        this.add.text(50, 50 + indice * 50, jogador + ' (você)', {
          fill: '#aaaaaa'
        })
      }
    })

    this.game.socket.on('offer', ({ from, to, description }) => {
      this.remoteConnection[from] = { conn: new RTCPeerConnection(this.game.ice_servers) }

      this.game.midias
        .getTracks()
        .forEach((track) =>
          this.remoteConnection[from].conn.addTrack(track, this.game.midias)
        )

      this.remoteConnection[from].conn.onicecandidate = ({ candidate }) => {
        candidate && this.game.socket.emit('candidate', { from: to, to: from, candidate })
      }

      this.remoteConnection[from].conn.oconsntrack = ({ streams: [stream] }) => {
        this.game.audio.srcObject = stream
      }

      this.remoteConnection[from].conn
        .setRemoteDescription(description)
        .then(() => this.remoteConnection[from].conn.createAnswer())
        .then((answer) => this.remoteConnection[from].conn.setLocalDescription(answer))
        .then(() => {
          this.game.socket.emit('answer', { from: to, to: from, description: this.remoteConnection[from].conn.localDescription })
        })
    })

    this.game.socket.on('answer', ({ from, to, description }) => {
      this.localConnection[from].conn.setRemoteDescription(description)
    })

    this.game.socket.on('candidate', ({ from, to, candidate }) => {
      const connection = this.localConnection[from] || this.remoteConnection[from]
      connection.conn.addIceCandidate(new RTCIceCandidate(candidate))
    })
  }
}
