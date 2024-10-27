import userLoginRegister from "../data/user";
import { Ships, UserObject } from "../interface/interface";
import Rooms from "./rooms/rooms";
import Winners from "./winners/winners";
import Game from "./game/game";


export default class UserCommands {
    private users: typeof userLoginRegister;
    private winners: Winners;
    private rooms: Rooms;
    private game: Game;
    constructor() {
        this.users = userLoginRegister;
        this.winners = new Winners();
        this.rooms = new Rooms();
        this.game = new Game();
    }

    public login(user: UserObject) {
        return this.users.login(user);
    }

    public updateWinners(name: string) {
        return this.winners.addWinner(name);
    }

    public createNewRoom({ name, index }: { name: string; index: number | string }) {
        this.rooms.createRoom({ name, index });
    }

    public addUserToRoom(roomId: number, { name, index }: { name: string; index: number | string }) {
        return this.rooms.addUserToRoom(roomId, { name, index });
    }

    public updateRooms() {
        return this.rooms.getRooms();
    }

    public createGame(users: { name: string, index: number | string }[]) {
        return this.game.createGame(users);
    }

    public addShip(data: Ships) {
        return this.game.addShip(data);
    }
}