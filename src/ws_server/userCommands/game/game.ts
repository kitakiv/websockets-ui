import {
  Attack,
  GameObject,
  Ships,
  ShipsObject,
} from '../../interface/interface';
import { AttackType } from '../../interface/messageType';

class Game {
  public game: GameObject;

  constructor() {
    this.game = {
      ids: [],
      entries: {},
    };
  }

  public createGame(users: { name: string; index: number | string }[]) {
    const addedGame = {
      idGame: 0,
      idPlayer: users,
      gamers: [],
      ships: {},
      turn: 0,
    };
    addedGame.idGame = this.game.ids.length;
    this.game.ids.push(addedGame.idGame);
    this.game.entries[addedGame.idGame] = addedGame;
    return this.game.entries[addedGame.idGame];
  }

  public addShip(data: Ships) {
    const field = this.makeArray(data.ships);
    this.game.entries[data.gameId].ships[data.indexPlayer] = {
      currentShips: data.ships,
      doneShips: field,
    };
    this.game.entries[data.gameId].gamers.push(data.indexPlayer);
    return this.game.entries[data.gameId].ships;
  }

  public addBotShip(data: {
    gameId: number | string;
    indexPlayer: number | string;
    ships: number[][];
  }) {
    this.game.entries[data.gameId].ships[data.indexPlayer] = {
      currentShips: [],
      doneShips: data.ships,
    };
    this.game.entries[data.gameId].gamers.push(data.indexPlayer);
    return this.game.entries[data.gameId].ships;
  }

  public attackPlayer(data: Attack) {
    const { gameId, indexPlayer, x, y } = data;
    const game = this.game.entries[gameId];
    const enemy =
      game.gamers[0] === indexPlayer ? game.gamers[1] : game.gamers[0];
    if (game.turn === indexPlayer) {
      const result = this.checkField(
        { x, y },
        parseInt(enemy as unknown as string),
        gameId,
      );
      const resultWithUsers = {
        ...result,
        users: this.game.entries[gameId].gamers,
        player: parseInt(enemy as unknown as string),
        finish: this.finishGame(game.ships[enemy].doneShips),
      };
      return resultWithUsers;
    }
    return null;
  }

  public randomAttack(gameId: number | string, indexPlayer: number | string) {
    const enemy =
      this.game.entries[gameId].gamers[0] === indexPlayer
        ? this.game.entries[gameId].gamers[1]
        : this.game.entries[gameId].gamers[0];
    const enemyField = this.game.entries[gameId].ships[enemy].doneShips;
    const randomNum = JSON.parse(
      JSON.stringify(Array.from({ length: 100 }, (v, k) => k + 1)),
    ) as number[];
    function random(mas: number[][]) {
      for (let i = 0; i < 100; i++) {
        const num = Math.floor(Math.random() * randomNum.length);
        const numNext = randomNum[num] - 1;
        const x = numNext % 10;
        const y = (numNext - x) / 10;
        if (mas[y][x] === 0 || mas[y][x] === 1) {
          return { x, y };
        }
        randomNum.splice(num, 1);
      }
      return { x: 0, y: 0 };
    }
    const position = random(enemyField);
    return position;
  }

  private finishGame(enemyField: number[][]) {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (enemyField[i][j] === 1) {
          return false;
        }
      }
    }
    return true;
  }

  private checkField(
    position: { x: number; y: number },
    enemyIndex: number,
    gameId: number | string,
  ) {
    const x = parseInt(position.x as unknown as string);
    const y = parseInt(position.y as unknown as string);
    const enemyField = this.game.entries[gameId].ships[enemyIndex].doneShips;
    if (enemyField[y][x] === 0) {
      enemyField[y][x] = 3;
      return {
        status: AttackType.MISS,
      };
    } else {
      function check(
        num: number,
        secondNum: number,
        x: boolean,
        step: number,
        mas: number[][],
      ) {
        const numberNext = num + step;
        if (numberNext < 0 || numberNext > 9) {
          return true;
        }
        const field = x
          ? mas[secondNum][numberNext]
          : mas[numberNext][secondNum];
        if (field === 0 || field === 3) {
          return true;
        }
        if (field === 1) {
          return false;
        }
        return check(numberNext, secondNum, x, step, mas);
      }

      if (
        check(x, y, true, 1, enemyField) &&
        check(x, y, true, -1, enemyField) &&
        check(y, x, false, 1, enemyField) &&
        check(y, x, false, -1, enemyField)
      ) {
        enemyField[y][x] = 2;
        return {
          status: AttackType.KILL,
        };
      }
      enemyField[y][x] = 2;
      return {
        status: AttackType.SHOOT,
      };
    }
  }

  public changeTurn(gameId: number | string, indexPlayer: number | string) {
    this.game.entries[gameId].turn = indexPlayer;
  }

  private makeArray(ships: ShipsObject[]) {
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

  public randomShips() {
    const huge = {
      count: 1,
      length: 4,
    };
    const large = {
      count: 2,
      length: 3,
    };
    const middle = {
      count: 3,
      length: 2,
    };
    const small = {
      count: 4,
      length: 1,
    };
    const varietiesHuge = [
      {
        position: { x: 0, y: 0 },
        direction: false,
        length: 4,
      },
      {
        position: { x: 1, y: 2 },
        direction: true,
        length: 4,
      },
      {
        position: { x: 0, y: 9 },
        direction: false,
        length: 4,
      },
    ];
    const varietiesLarge = [
      {
        position: { x: 5, y: 0 },
        direction: true,
        length: 3,
      },
      {
        position: { x: 7, y: 0 },
        direction: false,
        length: 3,
      },
      {
        position: { x: 5, y: 8 },
        direction: false,
        length: 3,
      },
    ];
    const varietiesMiddle = [
      {
        position: { x: 3, y: 2 },
        direction: true,
        length: 2,
      },
      {
        position: { x: 5, y: 5 },
        direction: true,
        length: 2,
      },
      {
        position: { x: 7, y: 2 },
        direction: false,
        length: 2,
      },
      {
        position: { x: 9, y: 4 },
        direction: true,
        length: 2,
      },
    ];
    const varietiesSmall = [
      {
        position: { x: 0, y: 7 },
        direction: false,
        length: 1,
      },
      {
        position: { x: 2, y: 7 },
        direction: false,
        length: 1,
      },
      {
        position: { x: 3, y: 5 },
        direction: false,
        length: 1,
      },
      {
        position: { x: 7, y: 5 },
        direction: false,
        length: 1,
      },
      {
        position: { x: 9, y: 7 },
        direction: false,
        length: 1,
      },
      {
        position: { x: 9, y: 9 },
        direction: false,
        length: 1,
      },
    ];
    const ships = [];
    for (let i = 0; i < huge.count; i++) {
      const random = Math.floor(Math.random() * varietiesHuge.length);
      ships.push(varietiesHuge[random]);
    }
    for (let i = 0; i < large.count; i++) {
      const random = Math.floor(Math.random() * varietiesLarge.length);
      ships.push(varietiesLarge[random]);
      varietiesLarge.splice(random, 1);
    }
    for (let i = 0; i < middle.count; i++) {
      const random = Math.floor(Math.random() * varietiesMiddle.length);
      ships.push(varietiesMiddle[random]);
      varietiesMiddle.splice(random, 1);
    }
    for (let i = 0; i < small.count; i++) {
      const random = Math.floor(Math.random() * varietiesSmall.length);
      ships.push(varietiesSmall[random]);
      varietiesSmall.splice(random, 1);
    }
    const fill = this.makeArray(ships);
    const direct = JSON.parse(
      JSON.stringify(Array(Math.floor(Math.random() * 4)).fill(0)),
    ) as number[];
    const result = direct.reduce((acc, elem, index) => {
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          const ech = fill[i][j];
          acc[j][i] = ech;
        }
      }
      return acc;
    }, fill);
    return result;
  }
}

export default Game;
