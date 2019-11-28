/**
 * @Date:   2019-10-24T14:11:58+02:00
 * @Email:  code@bramkorsten.nl
 * @Project: Kerstkaart 2019
 * @Filename: gamelogic.js
 * @Last modified time: 2019-11-28T16:51:19+01:00
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
    // game.client = new Client();
    // game.client.init();
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

  forfeitGame() {
    connection.sendMessage("forfeitGame");
  }

  startGame(data) {
    game.gameControls.loadingText
      .changeColor("green")
      .changeTextAndToggle("Opponent found!")
      .removeInMillis(2000);
    game.gameControls.showVersusBar(data);
    game.gameControls.showHandControls(true);
    this.setPlayerNumber(data);
  }

  updateGame(data) {
    console.log("Update Game");
  }

  updateMatch(data) {
    if (!this.state.isInGame && data.matchFull) {
      // New Match! Let's go
      this.state.isInGame = true;
      this.startGame(data);
    } else if (!this.state.isInGame) {
      game.gameControls.loadingText
        .changeColor("purple")
        .changeTextAndToggle("Waiting for opponent");
    } else {
      this.updateGame(data);
    }
  }

  finishGame(results) {
    switch (results.result) {
      case "1":
        if (this.state.isPlayer1) {
          game.player1.hand.state.isWinning = true;
          game.player2.hand.state.isWinning = false;
        } else {
          game.player1.hand.state.isWinning = false;
          game.player2.hand.state.isWinning = true;
        }
        break;
      case "2":
        if (this.state.isPlayer1) {
          game.player1.hand.state.isWinning = false;
          game.player2.hand.state.isWinning = true;
        } else {
          game.player1.hand.state.isWinning = true;
          game.player2.hand.state.isWinning = false;
        }
        break;
      case "tie":
        // TODO: Fix animation for tied state
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

  setPlayerNumber(data) {
    if (data.initializer.uToken == game.client.token) {
      this.state.isPlayer1 = true;
    } else {
      this.state.isPlayer1 = false;
    }
  }
}
