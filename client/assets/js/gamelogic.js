/**
 * @Date:   2019-10-24T14:11:58+02:00
 * @Email:  code@bramkorsten.nl
 * @Project: Kerstkaart 2019
 * @Filename: gamelogic.js
 * @Last modified time: 2019-10-24T16:58:49+02:00
 * @Copyright: Copyright 2019 - Bram Korsten
 */

var client = {
  name: "name",
  id: 123,
  input: "bla"
};

$(function() {
  $("input").click(function(e) {
    var message = client;
    message.input = this.value;
    gameServer.send(JSON.stringify(message));
  });
});

class GameLogic {
  constructor() {
    this.setupGame();
  }

  setupGame() {
    this.client = new Client({
      name: "testUser"
    });
    this.gameServer = new WebSocket("ws://localhost:8080");
    this.setupGameListeners();
  }

  setupGameListeners() {
    this.gameServer.onopen = function(event) {
      console.log("The connection to the game server has been made!");
      game.sendMessage("connect", game.client);
    };
  }

  sendMessage(type, msg) {
    const message = {
      uid: this.client.uid,
      type: type,
      message: msg
    };
    this.gameServer.send(JSON.stringify(message));
  }
}

$(function() {
  game = new GameLogic();
});
