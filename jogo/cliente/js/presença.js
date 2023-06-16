export default class presenca extends Phaser.Scene {
    constructor() {
        super("presença");
    }

    preload() { }

    create() {

        this.jogadores = this.game.jogadores.forEach((jogador, indice) => {
            if (indice === 0 && jogador === this.game.socket.id) {
                //discar para 1 e 2
                this.localConnection1 = new RTCPeerConnection(this.game.ice_servers);

                this.game.midias
                    .getTracks()
                    .forEach((track) =>
                        this.localConnection1.addTrack(track, this.game.midias)
                    );

                this.localConnection1.onicecandidate = ({ candidate }) => {
                    candidate &&
                        this.game.socket.emit("candidate", jogador, candidate);
                };

                this.localConnection1.ontrack = ({ streams: [stream] }) => {
                    this.game.audio.srcObject = stream;
                };

                this.localConnection1
                    .createOffer()
                    .then((offer) => this.localConnection1.setLocalDescription(offer))
                    .then(() => {
                        this.game.socket.emit(
                            "offer",
                            this.game.socket.id, // from
                            this.game.jogadores[1], // to
                            this.localConnection1.localDescription
                        );
                    });
                
                this.localConnection2 = new RTCPeerConnection(this.game.ice_servers);

                this.game.midias
                    .getTracks()
                    .forEach((track) =>
                        this.localConnection2.addTrack(track, this.game.midias)
                    );

                this.localConnection2.onicecandidate = ({ candidate }) => {
                    candidate &&
                        this.game.socket.emit("candidate1", jogador, candidate);
                };

                this.localConnection2.ontrack = ({ streams: [stream] }) => {
                    this.game.audio.srcObject = stream;
                };

                this.localConnection2
                    .createOffer()
                    .then((offer) => this.localConnection2.setLocalDescription(offer))
                    .then(() => {
                        this.game.socket.emit(
                            "offer1",
                            this.game.socket.id, // from
                            this.game.jogadores[2], // to
                            this.localConnection2.localDescription
                        );
                    });

            }
            else if (indice === 1 && jogador === this.game.socket.id) {
                //disca para  2 
                this.localConnection1 = new RTCPeerConnection(this.game.ice_servers);

                this.game.midias
                    .getTracks()
                    .forEach((track) =>
                        this.localConnection1.addTrack(track, this.game.midias)
                    );

                this.localConnection1.onicecandidate = ({ candidate }) => {
                    candidate &&
                        this.game.socket.emit("candidate1", jogador, candidate);
                };

                this.localConnection1.ontrack = ({ streams: [stream] }) => {
                    this.game.audio.srcObject = stream;
                };

                this.localConnection1
                    .createOffer()
                    .then((offer) => this.localConnection1.setLocalDescription(offer))
                    .then(() => {
                        this.game.socket.emit(
                            "offer1",
                            this.game.socket.id, // from
                            this.game.jogadores[2], // to
                            this.localConnection1.localDescription
                        );
                    });

                
            }

            if (jogador === this.game.socket.id) {
                this.add.text(50, 50 + indice * 50, jogador + " (você)", {
                    fill: "#aaaaaa",
                });
            } else {



            }
        });

        this.game.socket.on("offer", (from, to, description) => {
            this.remoteConnection = new RTCPeerConnection(this.game.ice_servers);

            this.game.midias
                .getTracks()
                .forEach((track) =>
                    this.remoteConnection.addTrack(track, this.game.midias)
                );

            this.remoteConnection.onicecandidate = ({ candidate }) => {
                candidate && this.game.socket.emit("candidate", to, from, candidate);
            };

            this.remoteConnection.ontrack = ({ streams: [stream] }) => {
                this.game.audio.srcObject = stream;
            };

            this.remoteConnection //ver esse ponto aqui
                .setRemoteDescription(description)
                .then(() => this.remoteConnection.createAnswer())
                .then((answer) => this.remoteConnection.setLocalDescription(answer))
                .then(() => {
                    this.game.socket.emit(
                        "answer",
                        to,
                        from,
                        this.remoteConnection.localDescription
                    );
                });
        });

        this.game.socket.on("offer1", (from, to, description) => {
            this.remoteConnection = new RTCPeerConnection(this.game.ice_servers);

            this.game.midias
                .getTracks()
                .forEach((track) =>
                    this.remoteConnection.addTrack(track, this.game.midias)
                );

            this.remoteConnection.onicecandidate = ({ candidate }) => {
                candidate && this.game.socket.emit("candidate1", to, from, candidate);
            };

            this.remoteConnection.ontrack = ({ streams: [stream] }) => {
                this.game.audio.srcObject = stream;
            };

            this.remoteConnection //ver esse ponto aqui
                .setRemoteDescription(description)
                .then(() => this.remoteConnection.createAnswer())
                .then((answer) => this.remoteConnection.setLocalDescription(answer))
                .then(() => {
                    this.game.socket.emit(
                        "answer1",
                        to,
                        from,
                        this.remoteConnection.localDescription
                    );
                });
        });

        this.game.socket.on("answer", (from, to, description) => {
            this.localConnection.setRemoteDescription(description);
        });

        this.game.socket.on("candidate", (from, to, candidate) => {
            let conn = this.localConnection || this.remoteConnection;
            conn.addIceCandidate(new RTCIceCandidate(candidate));
        });

        this.game.socket.on("answer1", (from, to, description) => {
            this.localConnection.setRemoteDescription(description);
        });

        this.game.socket.on("candidate1", (from, to, candidate) => {
            let conn = this.localConnection1 || this.remoteConnection1;
            conn.addIceCandidate(new RTCIceCandidate(candidate));
        });
    }

    update() { }
}