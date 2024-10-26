import { WebSocketServer, WebSocket } from 'ws';
import { config } from 'dotenv';
import { TypeMessage } from './interface/messageType';
import userLoginRegister from './data/user';
import { ClientMessage, UserObject } from './interface/interface';
config();

class WsServer {
    private users: typeof userLoginRegister;
    private wss: WebSocketServer;
    constructor(port: number) {
        this.users = userLoginRegister;
        this.wss = new WebSocketServer({ port });
        this.connectServer();
    }
    private connectServer() {
        this.wss.on('connection', (ws: WebSocket) => {
            console.log(`client connected`);
            ws.on('message', (data: string) => {;
                this.switchCommand(JSON.stringify(JSON.parse(data)), ws);
            });

            ws.on('close', () => {
                console.log('close');
            });
        });
    }

    private switchCommand(message: string, ws: WebSocket) {
        const { type, data, id } = JSON.parse(message) as ClientMessage;
        switch (type) {
            case TypeMessage.REGISTER:
                const answer = {
                    type: TypeMessage.REGISTER,
                    data: JSON.stringify(this.users.login(JSON.parse(data) as UserObject)),
                    id,
                };
                ws.send(JSON.stringify(answer));
                break;
            default:
                console.log(JSON.parse(message))
                break;
        }
    }
}

new WsServer(Number(process.env.PORT));
