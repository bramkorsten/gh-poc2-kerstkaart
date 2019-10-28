/**
 * @Date:   2019-10-24T14:11:58+02:00
 * @Email:  code@bramkorsten.nl
 * @Project: Kerstkaart 2019
 * @Filename: gamelogic.js
 * @Last modified time: 2019-10-28T15:12:24+01:00
 * @Copyright: Copyright 2019 - Bram Korsten
 */

const connection = new Connection();

class GameLogic {
  constructor() {
    this.isInitialized = false;
    this.isInGame = false;
    this.server = connection.server;
    // this.setupGame();
  }

  setupGame() {
    this.client = new Client();
    this.client.init();
    connection.sendHandshake();
    if (this.client.isExistingUser) {
      $(".signupWindow").remove();
    }
    this.isInitialized = true;
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
