/**
 * @Date:   2019-10-24T14:11:58+02:00
 * @Email:  code@bramkorsten.nl
 * @Project: Kerstkaart 2019
 * @Filename: gamelogic.js
 * @Last modified time: 2019-11-27T16:34:19+01:00
 * @Copyright: Copyright 2019 - Bram Korsten
 */

class GameLogic {
  constructor() {
    this.state = {
      isInitialized: false,
      isInGame: false,
      isPlayer1: true
    };
    // this.server = connection.server;
    this.sandbox = getFunctions();
    // this.setupGame();
  }

  setupClient() {
    game.client = new Client();
    game.client.init();
    connection.sendHandshake();
    if (game.client.isExistingUser) {
      game.client.getFromServer();
      $(".signupWindow").remove();
    }
    this.state.isInitialized = true;
  }

  requestGame() {
    console.log("Requesting new game");
    connection.sendMessage("requestMatch");
  }

  updateMatch(data) {
    if (!this.state.isInGame) {
      console.log("isnotingame");
      this.state.isInGame = true;
      if (data.matchFull) {
        console.log("showbar");
        game.gameControls.showVersusBar(data);
      }
    }
  }

  finishGame(results) {
    switch (results.result) {
      case "1":
        game.player1.hand.state.isWinning = true;
        game.player2.hand.state.isWinning = false;
        break;
      case "2":
        game.player1.hand.state.isWinning = false;
        game.player2.hand.state.isWinning = true;
        break;
      case "tie":
        game.player1.hand.state.isWinning = false;
        game.player2.hand.state.isWinning = false;
        break;
      default:
        console.log(results.result);
        console.log("Unexpected error in game ending");
        return false;
    }
    game.player1.hand.doShake(results.player1.choice);
    game.player2.hand.doShake(results.player2.choice);

    if (results.result == "tie") {
      game.gameControls.showWinnerScroll("It's a", "tie");
    } else if (this.state.isPlayer1 && results.result == 1) {
      game.gameControls.showWinnerScroll("You", "Won");
    } else if (!this.state.isPlayer1 && results.result == 2) {
      game.gameControls.showWinnerScroll("You", "Won");
    } else {
      game.gameControls.showWinnerScroll("You", "Lost");
    }
    game.gameControls.showRestartButtons(true);
  }

  resetGame() {
    this.state.isInGame = false;
    game.gameControls.hideWinnerScroll();
    game.gameControls.showRestartButtons(false);
    this.requestGame();
  }

  sendChoice(choice) {
    game.gameControls.showHandControls(false);
    connection.sendMessage("setChoice", { choice: choice });
  }
}
