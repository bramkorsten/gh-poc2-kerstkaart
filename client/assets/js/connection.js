class Connection {
  constructor(address = false) {
    this.isConnected = false;
    this.address = "ws://28f0deef.ngrok.io";
    if (address) {
      this.address = address;
    }
    this.server = new WebSocket(this.address);
    this.setupConnectionListeners();
    return this;
  }

  setupConnectionListeners() {
    this.server.onopen = function(event) {
      connection.isConnected = true;
      console.log("Connected to server");
      if (!game.isInitialized) {
        game.setupGame();
      }
    };
    this.server.onclose = function(event) {
      connection.isConnected = false;
      console.log("Server connection lost...");
      connection.reconnect();
    };

    this.server.onerror = function(event) {
      connection.isConnected = false;
      // connection.reconnect();
    };

    this.server.onmessage = function(event) {
      const message = JSON.parse(event.data);
      console.log("Message Recieved of type: " + message.type);
      console.log(message);
    };
  }

  reconnect() {
    console.log("trying to reconnect...");
    this.server = new WebSocket(this.address);
    this.setupConnectionListeners();
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
