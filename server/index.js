/**
 * @Date:   2019-10-24T14:26:59+02:00
 * @Email:  code@bramkorsten.nl
 * @Project: Kerstkaart (server)
 * @Filename: index.js
 * @Last modified time: 2019-10-24T15:24:00+02:00
 * @Copyright: Copyright 2019 - Bram Korsten
 */

const WebSocket = require("ws");
const database = require("./classes/database.js");

class gameServer {
  constructor() {
    // Setup the local databse connection and websocket server
    this.db = database.getDatabase();
    this.wss = new WebSocket.Server({ port: 8080 });

    database.setDefaults();
    this.setConnection();
  }

  setConnection() {
    this.wss.on("connection", function connection(ws) {
      ws.on("message", function incoming(message) {
        console.log(JSON.parse(message));
      });

      ws.send("something");
    });
  }
}

new gameServer();
