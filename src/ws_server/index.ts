import { WebSocketServer, WebSocket } from 'ws';
import { config } from 'dotenv';
import UserCommands from './userCommands/useCommands';
import {
  Attack,
  AttackResult,
  ClientMessage,
  Ships,
  UserObject,
} from './interface/interface';
import { AttackType, TypeMessage } from './interface/messageType';
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
      const currentUserInfo = new currentUser({ name: '', index: '' });
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
      case TypeMessage.SINGLE_PLAY:
        this.singlePlay(ws, id, type, currentUserInfo);
        break;
      case TypeMessage.ADD_USER_TO_ROOM:
        this.addUserToRoom(data, id, currentUserInfo);
        break;
      case TypeMessage.ADD_SHIPS:
        this.addShips(data, id);
        break;
      case TypeMessage.ATTACK:
        this.attackPlayer(data, id);
        break;
      case TypeMessage.RANDOM_ATTACK:
        this.randomAttack(data, id);
        break;
      default:
        console.log(JSON.parse(message));
        break;
    }
  }

  private singlePlay(ws: WebSocket, id: number, type: TypeMessage, currentUserInfo: currentUser) {
    const bot = {
      name: 'bot',
      index: 0 - (parseInt(currentUserInfo.getUser().index as unknown as string) + 1),
    }
    const user = currentUserInfo.getUser();
    const game = this.userCommands.createGame([bot, user]);
    ws.send(JSON.stringify({
      type: TypeMessage.CREATE_GAME,
        id,
        data: JSON.stringify({
          idGame: game.idGame,
          idPlayer: user.index,
        })
    }))
    const ships = this.userCommands.randomShips();
    this.userCommands.addBotShip({
      gameId: game.idGame,
      indexPlayer: bot.index,
      ships,
    })
  }

  private randomAttack(data: string, id: number) {
    const attack = JSON.parse(data) as {
      gameId: number | string;
      indexPlayer: number | string;
    };
    const position = this.userCommands.randomAttack(
      attack.gameId,
      attack.indexPlayer,
    );
    this.attackPlayer(
      JSON.stringify({
        gameId: attack.gameId,
        indexPlayer: attack.indexPlayer,
        x: position.x,
        y: position.y,
      }),
      id,
    );
  }

  private attackPlayer(data: string, id: number) {
    const attack = JSON.parse(data) as Attack;
    const result = this.userCommands.attackPlayer(attack);
    if (result) {
      this.attackFeedback(attack, result);
      if (result.status === AttackType.MISS) {
        this.userCommands.changeTurn(attack.gameId, result.player);
        const data = JSON.stringify({
          currentPlayer: result.player,
        })
        this.sendUsers(data, id, TypeMessage.TURN, result.users);
        if (result.player < 0) {
          this.randomAttack(JSON.stringify({
            gameId: attack.gameId,
            indexPlayer: result.player,
          }), id);
        }
      } else {
        this.userCommands.changeTurn(attack.gameId, attack.indexPlayer);
        const data = JSON.stringify({
          currentPlayer: attack.indexPlayer,
        })
        this.sendUsers(data, id, TypeMessage.TURN, result.users);
        if (parseInt(attack.indexPlayer as unknown as string) < 0) {
          this.randomAttack(JSON.stringify({
            gameId: attack.gameId,
            indexPlayer: attack.indexPlayer,
          }), id);
        }
      }
      if (result.finish) {
        const data = JSON.stringify({
          winPlayer: attack.indexPlayer
        })
        this.sendUsers(data, id, TypeMessage.FINISH, result.users);
        const winners = this.userCommands.countWinner((attack.indexPlayer) as number);
        this.sendToClients(
          JSON.stringify({
            type: TypeMessage.UPDATE_WINNERS,
            id,
            data: JSON.stringify(winners),
          }),
        );
      }
    }
  }

  private attackFeedback(attack: Attack, result: AttackResult) {
    const data = JSON.stringify({
        position: { x: attack.x, y: attack.y },
        status: result.status,
        currentPlayer: attack.indexPlayer,
    })
    this.sendUsers(data, 0, TypeMessage.ATTACK, result.users);
  }

  private sendUsers(data: string, id: number, type: TypeMessage, users: (string | number)[]) {
    users.forEach((user) => {
      this.usersWs.get(parseInt(user as unknown as string))?.send(
        JSON.stringify({
          type,
          id,
          data,
        }),
      );
    })
  }

  private addShips(data: string, id: number) {
    const ships = JSON.parse(data) as Ships;
    const game = this.userCommands.addShip(ships);
    if (Object.keys(game).length === 2) {
      const keys = Object.keys(game);
      keys.forEach((key) => {
        this.usersWs.get(parseInt(key))?.send(
          JSON.stringify({
            type: TypeMessage.START_GAME,
            id,
            data: JSON.stringify({
              ships: game[key].currentShips,
              currentPlayerIndex: key,
            }),
          }),
        );
      });
      const player = parseInt(keys[0]);
      this.userCommands.changeTurn(ships.gameId, player);
      const data = JSON.stringify({
        currentPlayer: player,
      })
      this.sendUsers(data, id, TypeMessage.TURN, keys);
      if (player < 0) {
        this.userCommands.randomAttack(ships.gameId, player);
      }
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
    currentUserInfo.updateUser({ name: user.name, index: user.index });
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
