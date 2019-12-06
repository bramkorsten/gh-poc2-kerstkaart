function _getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

function getFunctions() {
  return (sandboxFunctions = {
    handshake: function(data) {
      if (!data.userToken) {
        console.error("Handshake did not contain a token. Refreshing...");
        location.reload();
        return false;
      }
      game.client.setToken(data.userToken);
    },
    userUpdate: function(data) {
      game.client.updateUser(data);
    },
    matchUpdate: function(data) {
      game.logic.updateMatch(data);
    },
    matchResults: function(data) {
      game.logic.finishGame(data);
    },
    highscores: function(data) {
      game.gameControls.highscores._onRefresh(data);
    },
    error: function(data) {
      console.log("The server returned an error:");
      console.error(data);
    }
  });
}
