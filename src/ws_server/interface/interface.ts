import { TypeMessage } from "./messageType"

export interface UserObject {
    name: string,
    password: string,
}

export interface UserIndex extends UserObject {
    index: number | string,
}

export interface UserAnswer {
    error: boolean,
    errorText: string,
    name: string,
    index: number | string
}

export interface UserSaver {
    ids: (string | number)[],
    entries: {
        [key: string]: UserIndex
    },
}

export interface ClientMessage {
    type: TypeMessage,
    data: string,
    id: 0 | number,
}
