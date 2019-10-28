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