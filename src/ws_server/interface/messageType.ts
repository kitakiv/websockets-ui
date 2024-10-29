export enum TypeMessage {
    REGISTER = 'reg',
    UPDATE_WINNERS = 'update_winners',
    CREATE_ROOM = 'create_room',
    ADD_USER_TO_ROOM = 'add_user_to_room',
    CREATE_GAME = 'create_game',
    UPDATE_ROOM = 'update_room',
    ATTACK = 'attack',
    RANDOM_ATTACK = 'randomAttack',
    ADD_SHIPS = 'add_ships',
    START_GAME = 'start_game',
    TURN = 'turn',
    FINISH = 'finish',
    SINGLE_PLAY = 'single_play',
}

export enum AttackType {
    SHOOT = 'shot',
    KILL = 'killed',
    MISS = 'miss',
}