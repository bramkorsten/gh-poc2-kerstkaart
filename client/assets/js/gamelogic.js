/**
 * @Date:   2019-10-24T14:11:58+02:00
 * @Email:  code@bramkorsten.nl
 * @Project: Kerstkaart 2019
 * @Filename: gamelogic.js
 * @Last modified time: 2019-10-25T14:52:19+02:00
 * @Copyright: Copyright 2019 - Bram Korsten
 */

const gameServer = new WebSocket("ws://fa01f12a.ngrok.io");
const connection = new Connection(gameServer);

class GameLogic {
  constructor() {
    this.isInitialized = false;
    this.isInGame = false;
    this.setupGameListeners();
    // this.setupGame();
  }

  setupGame() {
    this.client = new Client();
    this.client.init();
    connection.sendHandshake();
    if (this.client.isExistingUser) {
      $(".signupWindow").remove();
    }
  }

  setupGameListeners() {
    gameServer.onopen = function(event) {
      console.log("Server connection successful!");
      if (!game.isInitialized) {
        game.setupGame();
      }
    };
    gameServer.onclose = function(event) {
      console.log("Server connection lost...");
    };
    gameServer.onmessage = function(event) {
      const message = JSON.parse(event.data);
      console.log("Message Recieved of type: " + message.type);
      console.log(message);
    };
  }

  connectToMatch() {
    const matchId = _getQueryVariable("m");
    if (!matchId) {
      console.error("Could not find matchID in query");
      return false;
    }
    connection.sendMessage("requestMatch", matchId);
  }
}

$(function() {
  game = new GameLogic();
});
