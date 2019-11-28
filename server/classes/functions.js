// TODO: Optimize database writes by only calling write() once

function isValidUser(token) {
  const user = db
    .get("clients")
    .find({ uToken: token })
    .value();
  if (!user) {
    return false;
  }
  return user;
}

function isValidChoice(choice) {
  const validChoices = ["rock", "paper", "scissors"];
  return validChoices.includes(choice);
}

function sendInvalidUser(ws) {
  const response = {
    type: "error",
    message: "uID is invalid"
  };
  ws.send(JSON.stringify(response));
  return false;
}

function sendUserNotInMatch(ws) {
  const response = {
    type: "error",
    message: "User is not in a match"
  };
  ws.send(JSON.stringify(response));
  return false;
}

function sendInvalidChoice(ws) {
  const response = {
    type: "error",
    message: "Invalid Choice"
  };
  ws.send(JSON.stringify(response));
  return false;
}

function getMatch(matchId) {
  const match = db
    .get("matches")
    .find({ matchId: matchId })
    .value();
  if (!match) {
    return false;
  }
  return match;
}

function createMatch(user, matchId) {
  const match = {
    matchId: matchId,
    initializer: user,
    currentGame: {
      players: [
        {
          uToken: user.uToken,
          player: user,
          choice: 0,
          streak: 0
        }
      ]
    },
    queue: [],
    highscores: []
  };
  db.get("matches")
    .push(match)
    .write();
  return match;
}

function getUserMatch(user) {
  const dbUser = db
    .get("clients")
    .find({ token: user.uToken })
    .value();
  if (dbUser.currentMatch) {
    return dbUser.currentMatch;
  }
  return false;
}

function setUserMatch(user, matchId) {
  db.get("clients")
    .find({ uToken: user.uToken })
    .assign({ currentMatch: matchId })
    .write();
}
// TODO: Rewrite to token
function setUserChoice(token, matchId, choice) {
  db.get("matches")
    .find({ matchId: matchId })
    .get("currentGame.players")
    .find({ uToken: token })
    .assign({ choice: choice })
    .write();
  return getMatch(matchId);
}

function placeUserInMatch(user, match) {
  setUserMatch(user, match.matchId);
  match = getMatch(match.matchId);
  // TODO: Check for already in match / change matches
  for (var player of match.currentGame.players) {
    if (player.uToken == user.uToken) {
      console.log("Player already in match");
      return match;
    }
  }
  for (var player of match.queue) {
    if (player.uToken == user.uToken) {
      console.log("Player already in queue");
      return match;
    }
  }
  if (match.currentGame.players.length != 2) {
    const player = {
      uToken: user.uToken,
      player: user,
      choice: 0,
      streak: 0
    };
    match.currentGame.players.push(player);
    db.get("matches")
      .find({ matchId: match.matchId })
      .assign(match)
      .write();
    return match;
  } else {
    const player = {
      uToken: user.uToken,
      player: user
    };
    match.queue.push(player);
    db.get("matches")
      .find({ matchId: match.matchId })
      .assign(match)
      .write();
    return match;
  }
}

// Sandboxed functions to keep users from running game logic directly

module.exports = {
  requestConnection: function(message, ws) {
    console.log("New Connection Request");
    const response = {
      type: "handshake",
      data: {
        userToken: message.userToken
      }
    };
    ws.send(JSON.stringify(response));
  },

  setUserInformation: function(message, ws) {
    const token = message.userToken;
    const user = message.message;
    const databaseUser = isValidUser(token);
    if (!databaseUser) {
      console.log("Creating new user: " + user.name);
      const newUser = {
        uToken: token,
        name: user.name,
        gamesPlayed: 0
      };
      db.get("clients")
        .push(newUser)
        .write();
      const response = {
        type: "userUpdate",
        data: newUser
      };
      ws.send(JSON.stringify(response));
    } else {
      const response = {
        type: "userUpdate",
        data: databaseUser
      };
      ws.send(JSON.stringify(response));
    }
  },

  getUserInformation: function(message, ws) {
    const token = message.userToken;
    const databaseUser = isValidUser(token);
    if (!databaseUser) {
      return sendInvalidUser(ws);
    }
    const response = {
      type: "userUpdate",
      data: databaseUser
    };
    ws.send(JSON.stringify(response));
  },

  requestMatch: function(message, ws) {
    const token = message.userToken;
    const user = isValidUser(token);
    if (!user) {
      return sendInvalidUser(ws);
    }
    const matchId = message.message;
    if ((match = getMatch(matchId))) {
      match = placeUserInMatch(user, match);
      gameServer.sendUpdateToMatch(match.matchId);
      return true;
    }
    match = createMatch(user, matchId);
    gameServer.sendUpdateToMatch(match.matchId);
    return true;
  },

  setChoice: function(message, ws) {
    const token = message.userToken;
    const dbUser = isValidUser(token);
    if (!dbUser) {
      return sendInvalidUser(ws);
    }
    if (!dbUser.currentMatch) {
      return sendUserNotInMatch(ws);
    }
    const choice = message.message.choice;
    if (!choice || !isValidChoice(choice)) {
      return sendInvalidChoice(ws);
    }
    const match = setUserChoice(dbUser.uToken, dbUser.currentMatch, choice);
    gameServer.sendUpdateToMatch(match.matchId);
    return true;
  }
};
