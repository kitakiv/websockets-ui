import { GameObject, Ships, ShipsObject } from '../../interface/interface';

class Game {
  private game: GameObject;

  constructor() {
    this.game = {
      ids: [],
      entries: {},
    };
  }

  public createGame(users: { name: string; index: number | string }[]) {
    const addedGame = {
      idGame: this.game.ids.length,
      idPlayer: users,
      ships: {},
    };
    this.game.ids.push(addedGame.idGame);
    this.game.entries[addedGame.idGame] = addedGame;
    return this.game.entries[addedGame.idGame];
  }

  public addShip(data: Ships) {
    const field = this.makeArray(data.ships);
    this.game.entries[data.gameId].ships[data.indexPlayer] = { currentShips: data.ships, doneShips: field };
    return this.game.entries[data.gameId].ships;
  }

  private makeArray(
    ships: ShipsObject[],
  ) {
    const fill = JSON.parse(JSON.stringify(Array(10).fill(Array(10).fill(0))));
    ships.forEach((ship) => {
      if (ship.direction) {
        for (let i = 0; i < ship.length; i++) {
          fill[ship.position.y + i][ship.position.x] = 1;
        }
      } else {
        for (let i = 0; i < ship.length; i++) {
          fill[ship.position.y][ship.position.x + i] = 1;
        }
      }
    });
    return fill;
  }
}

export default Game;
