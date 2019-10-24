class Client {
  constructor(user) {
    this.name = user.name;
    if (user.hasOwnProperty("uid")) {
      this.uid = user.uid;
    } else {
      this.uid =
        "_" +
        Math.random()
          .toString(36)
          .substr(2, 9);
    }
    this.score = 0;

    return this;
  }
}
