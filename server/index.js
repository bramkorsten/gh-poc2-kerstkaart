/**
 * @Date:   2019-10-24T14:26:59+02:00
 * @Email:  code@bramkorsten.nl
 * @Project: Kerstkaart (server)
 * @Filename: index.js
 * @Last modified time: 2019-10-25T16:11:07+02:00
 * @Copyright: Copyright 2019 - Bram Korsten
 */

const WebSocket = require("ws");
const database = require("./classes/database.js");
db = database.getDatabase();
connections = [];

class GameServer {
  constructor() {
    // Setup the local databse connection and websocket server
    this.db = db;
    this.wss = new WebSocket.Server({ port: 8080 });

    database.setDefaults();
    this.functions = require("./classes/functions.js");
    this.setConnection();
  }

  setConnection() {
    this.wss.on("connection", function connection(ws) {
      ws.on("message", function incoming(message) {
        const parsedMessage = JSON.parse(message);
        if (connections.hasOwnProperty(parsedMessage.uid) == false) {
          const uid = parsedMessage.uid;
          connections[uid] = ws;
        }
        if (gameServer.functions[parsedMessage.type] instanceof Function) {
          gameServer.functions[parsedMessage.type](parsedMessage, ws);
        } else {
          const response = {
            type: "error",
            message: parsedMessage.type + " is not a valid function"
          };
          ws.send(JSON.stringify(response));
        }
      });
    });
  }

  sendUpdateToMatch(matchId, match = false) {
    var players = this.getPlayersInMatch(matchId);
    console.log(players);
    if (!match) {
      match = db
        .get("matches")
        .find({ matchId: matchId })
        .value();
    }
    const response = {
      type: "matchUpdate",
      message: match
    };
    for (var player of players) {
      console.log("sending update to: " + player);
      if (connections.hasOwnProperty(player)) {
        connections[player].send(JSON.stringify(response));
      } else {
        console.log("player in match not connected");
      }
    }
  }

  getPlayersInMatch(matchId) {
    // TODO: Make this one query?
    const mainPlayers = db
      .get("matches")
      .find({ matchId: matchId })
      .get("currentGame.players")
      .map("uid")
      .value();
    const queuePlayers = db
      .get("matches")
      .find({ matchId: matchId })
      .get("queue")
      .map("uid")
      .value();
    const players = mainPlayers.concat(queuePlayers);
    return players;
  }
}

gameServer = new GameServer();
