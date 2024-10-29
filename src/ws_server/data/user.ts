import {
  UserObject,
  UserAnswer,
  UserSaver,
  UserIndex,
} from '../interface/interface';
import { ErrorsGame } from '../errors/errors';

class User {
  private users: UserSaver;
  constructor() {
    this.users = {
      ids: [],
      entries: {},
    };
  }

  private add(user: UserObject): UserAnswer {
    try {
      if (
        user.name &&
        user.password &&
        typeof user.name === 'string' &&
        typeof user.password === 'string'
      ) {
        const addedUser = {
          index: this.users.ids.length,
          name: user['name'],
          password: user['password'],
        };
        this.users.ids.push(addedUser.index);
        this.users.entries[addedUser.name] = addedUser;
        return {
          error: false,
          errorText: '',
          name: addedUser.name,
          index: addedUser.index,
        };
      } else {
        throw new Error(ErrorsGame.INCORRECT_NAME);
      }
    } catch (error) {
      return {
        error: true,
        errorText: (error as Error).message,
        name: '',
        index: '',
      };
    }
  }

  public getUser(index: number) {
    for (const names in this.users.entries) {
      if (this.users.entries[names].index === index) {
        return this.users.entries[names].name;
      }
    }
  }

  public login(user: UserObject): UserAnswer {
    if (
      this.users.entries[user['name']]
    ) {
        try {
            if (user.password === this.users.entries[user['name']]['password']) {
                return {
                    error: false,
                    errorText: '',
                    name: user['name'],
                    index: this.users.entries[user.name].index,
                  };
            } else {
                throw new Error(ErrorsGame.INCORRECT_PASSWORD);
            }
        } catch (error) {
            return {
                error: true,
                errorText: (error as Error).message,
                name: '',
                index: '',
            };
        }
    } else {
        return this.add(user);
    }
  }
}


const userLoginRegister = new User();
export default userLoginRegister