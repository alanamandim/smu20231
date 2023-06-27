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
                        this.game.socket.emit("candidate", {
                            from: this.game.socket.id,
                            to: this.game.jogadores[1],
                            candidate: candidate
                        });
                };

                this.localConnection1.ontrack = ({ streams: [stream] }) => {
                    this.game.audio.srcObject = stream;
                };

                this.localConnection1
                    .createOffer()
                    .then((offer) => this.localConnection1.setLocalDescription(offer))
                    .then(() => {
                        this.game.socket.emit(
                            "offer", {
                            from: this.game.socket.id, // from
                            to: this.game.jogadores[1], // to
                            description: this.localConnection1.localDescription
                        });
                    });

                this.localConnection2 = new RTCPeerConnection(this.game.ice_servers);

                this.game.midias
                    .getTracks()
                    .forEach((track) =>
                        this.localConnection2.addTrack(track, this.game.midias)
                    );

                this.localConnection2.onicecandidate = ({ candidate }) => {
                    candidate &&
                        this.game.socket.emit("candidate1", {
                            from: this.game.socket.id,
                            to: this.game.jogadores[2],
                            candidate: candidate
                        });
                };

                this.localConnection2.ontrack = ({ streams: [stream] }) => {
                    this.game.audio.srcObject = stream;
                };

                this.localConnection2
                    .createOffer()
                    .then((offer) => this.localConnection2.setLocalDescription(offer))
                    .then(() => {
                        this.game.socket.emit(
                            "offer1", {
                            from: this.game.socket.id, // from
                            to: this.game.jogadores[2], // to
                            description: this.localConnection2.localDescription
                        });
                    });

            } else if (indice === 1 && jogador === this.game.socket.id) {
                //disca para  2 
                this.localConnection2 = new RTCPeerConnection(this.game.ice_servers);

                this.game.midias
                    .getTracks()
                    .forEach((track) =>
                        this.localConnection2.addTrack(track, this.game.midias)
                    );

                this.localConnection2.onicecandidate = ({ candidate }) => {
                    candidate &&
                        this.game.socket.emit("candidate1", {
                            from: this.game.socket.id,
                            to: this.game.jogadores[2],
                            candidate: candidate
                        });
                };

                this.localConnection2.ontrack = ({ streams: [stream] }) => {
                    this.game.audio.srcObject = stream;
                };

                this.localConnection2
                    .createOffer()
                    .then((offer) => this.localConnection2.setLocalDescription(offer))
                    .then(() => {
                        this.game.socket.emit(
                            "offer1", {
                            from: this.game.socket.id, // from
                            to: this.game.jogadores[2], // to
                            description: this.localConnection2.localDescription
                        });
                    });


            }

            if (jogador === this.game.socket.id) {
                this.add.text(50, 50 + indice * 50, jogador + " (você)", {
                    fill: "#aaaaaa",
                });
            } else {



            }
        });

        this.game.socket.on("offer", ({ from, to, description }) => {
            this.remoteConnection = new RTCPeerConnection(this.game.ice_servers);

            this.game.midias
                .getTracks()
                .forEach((track) =>
                    this.remoteConnection.addTrack(track, this.game.midias)
                );

            this.remoteConnection.onicecandidate = ({ candidate }) => {
                candidate && this.game.socket.emit("candidate",
                    {
                        from: to,
                        to: from,
                        candidate: candidate
                    });
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
                        "answer", {
                        from: to,
                        to: from,
                        description: this.remoteConnection.localDescription
                    }
                    );
                });
        });

        this.game.socket.on("offer1", ({ from, to, description }) => {
            this.remoteConnection1 = new RTCPeerConnection(this.game.ice_servers);

            this.game.midias
                .getTracks()
                .forEach((track) =>
                    this.remoteConnection1.addTrack(track, this.game.midias)
                );

            this.remoteConnection1.onicecandidate = ({ candidate }) => {
                candidate && this.game.socket.emit("candidate1", {
                    from: to,
                    to: from,
                    candidate: candidate
                });
            };

            this.remoteConnection1.ontrack = ({ streams: [stream] }) => {
                this.game.audio.srcObject = stream;
            };

            this.remoteConnection1 //ver esse ponto aqui
                .setRemoteDescription(description)
                .then(() => this.remoteConnection1.createAnswer())
                .then((answer) => this.remoteConnection1.setLocalDescription(answer))
                .then(() => {
                    this.game.socket.emit(
                        "answer1", {
                        from: to,
                        to: from,
                        description: this.remoteConnection1.localDescription
                    });
                });
        });

        this.game.socket.on("answer", ({ from, to, description }) => {
            this.localConnection1.setRemoteDescription(description);
        });

        this.game.socket.on("candidate", ({ from, to, candidate }) => {
            let conn = this.localConnection1 || this.remoteConnection;
            conn.addIceCandidate(new RTCIceCandidate(candidate));
        });

        this.game.socket.on("answer1", ({ from, to, description }) => {
            this.localConnection2.setRemoteDescription(description);
        });

        this.game.socket.on("candidate1", ({ from, to, candidate }) => {
            let conn = this.localConnection2 || this.remoteConnection1;
            conn.addIceCandidate(new RTCIceCandidate(candidate));
        });
    }
}