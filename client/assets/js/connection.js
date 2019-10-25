class Connection {
  constructor(serverSocket) {
    this.server = serverSocket;
    return this;
  }

  sendHandshake() {
    const message = {
      uid: game.client.uid,
      type: "requestConnection",
      message: "Hello Server"
    };
    this.server.send(JSON.stringify(message));
  }

  sendMessage(type, msg) {
    const message = {
      uid: game.client.uid,
      type: type,
      message: msg
    };
    this.server.send(JSON.stringify(message));
  }
}
