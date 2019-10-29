$(function() {
  $("#setNameButton").click(function(e) {
    const name = $("#nameField")[0].value;
    if (name != "") {
      game.client.setName(name).update();
      game.connectToMatch();
    }
  });
});

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
      console.log(data);
    }
  });
}
