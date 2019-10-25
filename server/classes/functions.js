function isValidUser(uid) {
  const user = db
    .get("clients")
    .find({ uid: uid })
    .value();
  if (!user) {
    return false;
  }
  return user;
}

function sendInvalidUser(ws) {
  const response = {
    type: "error",
    message: "uID is invalid"
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
          uid: user.uid,
          player: user,
          choise: 0,
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

function placeUserInMatch(user, match) {
  for (var player of match.currentGame.players) {
    if (player.uid == user.uid) {
      console.log("Player already in match");
      return match;
    }
  }
  for (var player of match.queue) {
    if (player.uid == user.uid) {
      console.log("Player already in queue");
      return match;
    }
  }
  if (match.currentGame.players.length != 2) {
    const player = {
      uid: user.uid,
      player: user,
      choise: 0,
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
      uid: user.uid,
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
      message: "Hello Client"
    };
    ws.send(JSON.stringify(response));
  },

  setUserInformation: function(message, ws) {
    const uid = message.uid;
    const user = message.message;
    const databaseUser = isValidUser(uid);
    if (!databaseUser) {
      console.log("Creating new user: " + user.name);
      const newUser = {
        uid: uid,
        name: user.name,
        gamesPlayed: 0
      };
      db.get("clients")
        .push(newUser)
        .write();
      const response = {
        type: "userUpdate",
        message: newUser
      };
      ws.send(JSON.stringify(response));
    } else {
      const response = {
        type: "userUpdate",
        message: databaseUser
      };
      ws.send(JSON.stringify(response));
    }
  },

  getUserInformation: function(message, ws) {
    const uid = message.uid;
    const databaseUser = isValidUser(uid);
    if (!databaseUser) {
      return sendInvalidUser(ws);
    }
    const response = {
      type: "userUpdate",
      message: databaseUser
    };
    ws.send(JSON.stringify(response));
  },

  requestMatch: function(message, ws) {
    const uid = message.uid;
    const user = isValidUser(uid);
    if (!user) {
      return sendInvalidUser(ws);
    }
    const matchId = message.message;
    if ((match = getMatch(matchId))) {
      match = placeUserInMatch(user, match);
      gameServer.sendUpdateToMatch(match.matchId, match);
      return true;
    }
    match = createMatch(user, matchId);
    gameServer.sendUpdateToMatch(match.matchId, match);
    return true;
  }
};
