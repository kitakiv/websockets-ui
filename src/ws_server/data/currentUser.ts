

class currentUser {
  public currentUser: {
    name: string;
    index: number | string;
  };
  constructor(user: { name: string; index: number | string}) {
    this.currentUser = {
      name: user.name,
      index: user.index,
    };
  }

  getUser() {
    return this.currentUser;
  }

  updateUser(user: { name: string; index: number | string}) {
    this.currentUser = {
      name: user.name,
      index: user.index,
    };
  }
}

export default currentUser;
