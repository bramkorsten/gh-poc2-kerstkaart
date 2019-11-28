/**
 * @Date:   2019-10-24T15:33:59+02:00
 * @Email:  code@bramkorsten.nl
 * @Project: Kerstkaart 2019
 * @Filename: client.js
 * @Last modified time: 2019-11-27T10:52:35+01:00
 * @Copyright: Copyright 2019 - Bram Korsten
 */

class Client {
  constructor() {
    this.uid = 0;
    this.isInitialized = false;
    this.isExistingUser = false;
    return this;
  }

  async init() {
    if (Cookies.get("gameClientID")) {
      this.uid = Cookies.get("gameClientID");
      this.isExistingUser = true;
      return this;
    } else {
      this.uid =
        "_" +
        Math.random()
          .toString(36)
          .substr(2, 9);
      Cookies.set("gameClientID", this.uid, { expires: 365 });
      return this;
    }
  }

  getFromServer() {
    connection.sendMessage("getUserInformation", this.uid);
  }

  update() {
    connection.sendMessage("setUserInformation", this);
  }

  setToken(token) {
    this.token = token;
  }

  setName(name) {
    this.name = name;
    console.log(name);
    return this;
  }

  updateUser(user) {
    if (this.token !== user.uToken) {
      console.warn("The user id revieved from the server does not match");
      return false;
    }
    this.name = user.name;
    this.gamesPlayed = user.gamesPlayed;
    this.isInitialized = true;
  }

  destroy() {
    Cookies.remove("gameClientID");
    location.reload();
    // TODO: Remove all database related things and reset the page
    return true;
  }
}
