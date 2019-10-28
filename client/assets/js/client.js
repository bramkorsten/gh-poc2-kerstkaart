/**
 * @Date:   2019-10-24T15:33:59+02:00
 * @Email:  code@bramkorsten.nl
 * @Project: Kerstkaart 2019
 * @Filename: client.js
 * @Last modified time: 2019-10-28T15:01:26+01:00
 * @Copyright: Copyright 2019 - Bram Korsten
 */

class Client {
  constructor() {
    this.uid = 0;
    this.isInitialized = false;
    this.isExistingUser = false;
    this.setupListeners();
    return this;
  }

  async init() {
    if (Cookies.get("gameClientID")) {
      this.uid = Cookies.get("gameClientID");
      this.isExistingUser = true;
      await this.getClientInfo();
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

  async getClientInfo() {
    connection.sendMessage("getUserInformation", this.uid);
  }

  update() {
    connection.sendMessage("setUserInformation", this);
  }

  setName(name) {
    this.name = name;
    console.log(name);
    return this;
  }

  updateUser(user) {
    if (this.uid !== user.uid) {
      console.warn("The user id revieved from the server does not match");
      return false;
    }
    this.name = user.name;
    this.gamesPlayed = user.gamesPlayed;
    this.isInitialized = true;
    if (!game.isInGame) {
      game.connectToMatch();
    }
  }

  setupListeners() {
    var client = this;
    connection.server.onmessage = function(event) {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "userUpdate":
          client.updateUser(message.message);
          break;
        default:
      }
      console.log("Message Recieved of type: " + message.type);
      console.log(message);
    };
  }

  destroy() {
    Cookies.remove("gameClientID");
    location.reload();
    // TODO: Remove all database related things and reset the page
    return true;
  }
}
