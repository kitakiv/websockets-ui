import { WebSocketServer, WebSocket } from 'ws';
import { config } from 'dotenv';
import UserCommands from './userCommands/useCommands';
import { ClientMessage, Ships, UserObject } from './interface/interface';
import { TypeMessage } from './interface/messageType';
import currentUser from './data/currentUser';
config();

class WsServer {
  private wss: WebSocketServer;
  private userCommands: UserCommands;
  private usersWs: Map<number | string, WebSocket> = new Map();
  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.userCommands = new UserCommands();
    this.connectServer();
  }
  private connectServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log(`client connected`);
      const currentUserInfo = new currentUser({ name: '', index: ''});
      ws.on('message', (data: string) => {
        this.switchCommand(
          JSON.stringify(JSON.parse(data)),
          ws,
          currentUserInfo,
        );
      });

      ws.on('close', () => {
        console.log('close');
      });
    });
  }

  private switchCommand(
    message: string,
    ws: WebSocket,
    currentUserInfo: currentUser,
  ) {
    const { type, data, id } = JSON.parse(message) as ClientMessage;
    switch (type) {
      case TypeMessage.REGISTER:
        this.register(data, ws, id, type, currentUserInfo);
        break;
      case TypeMessage.CREATE_ROOM:
        this.createRoom(id, currentUserInfo);
        break;
      case TypeMessage.ADD_USER_TO_ROOM:
        this.addUserToRoom(data, id,currentUserInfo);
        break;
    case TypeMessage.ADD_SHIPS:
        this.addShips(data, id);
      default:
        console.log(JSON.parse(message));
        break;
    }
  }

  private addShips(data: string, id: number) {
    const ships = JSON.parse(data) as Ships;
    const game = this.userCommands.addShip(ships);
    if (Object.keys(game).length === 2) {
        const keys = Object.keys(game);
        keys.forEach((key) => {
            this.usersWs.get(parseInt(key))?.send(JSON.stringify({
                type: TypeMessage.START_GAME,
                id,
                data: JSON.stringify({
                    ships: game[key].currentShips,
                    currentPlayerIndex: key
                })
            }));
        })
        this.usersWs.get(parseInt(keys[0]))?.send(JSON.stringify({
            type: TypeMessage.TURN,
            id,
            data: JSON.stringify({
                currentPlayer: parseInt(keys[1])
            })
        }));
    }
  }

  private register(
    data: string,
    ws: WebSocket,
    id: number,
    type: TypeMessage,
    currentUserInfo: currentUser,
  ) {
    const user = this.userCommands.login(JSON.parse(data) as UserObject);
    const answer = { type, id, data: JSON.stringify(user) };
    currentUserInfo.updateUser({ name: user.name, index: user.index});
    ws.send(JSON.stringify(answer));
    if (!user.error) {
        this.usersWs.set(user.index, ws);
      const winners = this.userCommands.updateWinners(user.name);
      this.sendToClients(
        JSON.stringify({
          type: TypeMessage.UPDATE_WINNERS,
          id,
          data: JSON.stringify(winners),
        }),
      );
      const rooms = this.userCommands.updateRooms();
      this.sendToClients(
        JSON.stringify({
          type: TypeMessage.UPDATE_ROOM,
          id,
          data: JSON.stringify(rooms),
        }),
      );
    }
  }

  private addUserToRoom(
    data: string,
    id: number,
    currentUserInfo: currentUser,
  ) {
    const roomId = JSON.parse(data).indexRoom;
    const roomWithUsers = this.userCommands.addUserToRoom(roomId, {
      name: currentUserInfo.currentUser.name,
      index: currentUserInfo.currentUser.index,
    });
    const game = this.userCommands.createGame(roomWithUsers.roomUsers);
    game.idGame = id;
    game.idPlayer.forEach((user) => {
      this.usersWs.get(user.index)?.send(
        JSON.stringify({
          type: TypeMessage.CREATE_GAME,
          id,
          data: JSON.stringify({
            idGame: game.idGame,
            idPlayer: user.index,
          }),
        }),
      );
    })
    const rooms = this.userCommands.updateRooms();
    this.sendToClients(
      JSON.stringify({
        type: TypeMessage.UPDATE_ROOM,
        id,
        data: JSON.stringify(rooms),
      }),
    );
  }

  private createRoom(id: number, currentUserInfo: currentUser) {
    this.userCommands.createNewRoom({
      name: currentUserInfo.currentUser.name,
      index: currentUserInfo.currentUser.index,
    });
    const rooms = this.userCommands.updateRooms();
    this.sendToClients(
      JSON.stringify({
        type: TypeMessage.UPDATE_ROOM,
        id,
        data: JSON.stringify(rooms),
      }),
    );
  }

  private sendToClients(data: string) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

new WsServer(Number(process.env.PORT));
