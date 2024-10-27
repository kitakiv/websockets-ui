import { TypeMessage } from './messageType';

export interface UserObject {
  name: string;
  password: string;
}

export interface UserIndex extends UserObject {
  index: number | string;
}

export interface UserAnswer {
  error: boolean;
  errorText: string;
  name: string;
  index: number | string;
}

export interface UserSaver {
  ids: (string | number)[];
  entries: {
    [key: string]: UserIndex;
  };
}

export interface RoomObject {
  ids: (string | number)[];
  entries: {
    [key: string]: {
      roomId: string | number;
      roomUsers: {
        name: string;
        index: number | string;
      }[];
    };
  };
}

export interface GameObject {
  ids: (string | number)[];
  entries: {
    [key: string]: {
      idGame: string | number;
      idPlayer: { name: string; index: number | string }[];
      ships: {
        [key: string | number]: {
            currentShips: ShipsObject[];
            doneShips: number[][];
        };
      };
    };
  };
}

export interface Ships {
  gameId: string | number;
  indexPlayer: string | number;
  ships: ShipsObject[];
}

export interface ShipsObject {
    position: { x: number; y: number };
    direction: boolean;
    length: number;
  }

export interface ClientMessage {
  type: TypeMessage;
  data: string;
  id: 0 | number;
}

export interface WinnersObject {
  [key: string]: {
    wins: number;
    name: string;
  };
}
