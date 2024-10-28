import { WinnersObject } from '../../interface/interface';

class Winners {
  public winners: WinnersObject;
  constructor() {
    this.winners = {};
  }

  public getWinners() {
    return [...Object.values(this.winners)];
  }

  public updateWinners(name: string) {
    if (this.winners[name]) {
      this.winners[name].wins += 1;
    }
    return [...Object.values(this.winners)];
  }

  public addWinner(name: string) {
    if (!this.winners[name]) {
      this.winners[name] = {
        wins: 0,
        name: name,
      };
    }
    return [...Object.values(this.winners)];
  }
}

export default Winners;
