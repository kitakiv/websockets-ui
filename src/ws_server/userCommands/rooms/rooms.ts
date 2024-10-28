import { RoomObject } from "../../interface/interface";

class Rooms {
    public rooms: RoomObject
    constructor() {
        this.rooms = {
            ids: [],
            entries: {},
        };
    }

    public createRoom({name, index}: { name: string; index: number | string }) {
        const addedRoom = {
            roomId: this.rooms.ids.length,
            roomUsers: [
                {
                    name,
                    index,
                }
            ],
        }

        this.rooms.ids.push(addedRoom.roomId);
        this.rooms.entries[addedRoom.roomId] = addedRoom;
        console.log(this.rooms.entries);
    }

    public addUserToRoom(roomId: number, { name, index }: { name: string; index: number | string }) {
        this.rooms.entries[roomId].roomUsers.push({ name, index });
        return this.rooms.entries[roomId];
    }

    public getRooms() {
        const roomWithOneUser = Object.values(this.rooms.entries).filter(room => room.roomUsers.length === 1);
        return roomWithOneUser;
    }
}

export default Rooms