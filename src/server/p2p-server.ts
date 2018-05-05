import { Blockchain } from './blockchain';
import * as WebSocket from 'ws';

export class P2pServer {
    private sockets: WebSocket[];
    private P2P_PORT = Number(process.env.P2P_PORT || 5001);
    private peers: string[] = process.env.PEERS ? process.env.PEERS.split(',') : [];

    constructor(
        private blockchain: Blockchain,
    ) {
        this.sockets = [];
    }

    public listen() {
        const server = new WebSocket.Server({
            port: this.P2P_PORT,
        });
        server.on('connection', (socket: WebSocket) => {
            this.connectSocket(socket);
        });

        this.connectToPeers();

        console.info(`Listening for peer-to-peer connection on: ${this.P2P_PORT}`);
    }

    private connectToPeers() {
        this.peers.forEach(peer => {
            const socket = new WebSocket(peer);

            socket.addEventListener('open', () => this.connectSocket(socket));
        });
    }

    private connectSocket(socket: WebSocket) {
        this.sockets.push(socket);
        console.info('Socket connected');

        this.messageHandler(socket);
        this.sendChain(socket);
    }

    private messageHandler(socket: WebSocket) {
        socket.addEventListener('message', (message) => {
            const data =  JSON.parse(message.data);
            this.blockchain.replaceChain(data);
        });
    }

    public sync() {
        this.sockets.forEach(socket => this.sendChain(socket));
    }

    private sendChain(socket: WebSocket) {
        socket.send(JSON.stringify(this.blockchain.chain));
    }

}
