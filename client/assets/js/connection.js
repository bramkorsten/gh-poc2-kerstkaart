class Connection {
  constructor(address = false) {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.address = "ws://kerstkaart.glitch.me";
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
      connection.connectionAttempts = 0;
      console.log("Connected to server");
      if (!game.isInitialized) {
        game.logic.setupClient();
      } else {
        connection.sendHandshake();
      }
    };

    this.server.onclose = function(event) {
      connection.isConnected = false;
      console.log("Server connection lost...");
      if (connection.connectionAttempts < 5) {
        connection.reconnect();
      }
    };

    this.server.onerror = function(event) {
      connection.isConnected = false;
      // connection.reconnect();
    };

    this.server.onmessage = function(event) {
      const message = JSON.parse(event.data);
      console.log("Message Recieved of type: " + message.type);
      if (game.logic.sandbox[message.type] instanceof Function) {
        game.logic.sandbox[message.type](message.data);
      } else {
        console.log("not a function");
      }
    };
  }

  reconnect() {
    console.log("trying to reconnect...");
    this.connectionAttempts++;
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
      message: msg || false
    };
    this.server.send(JSON.stringify(message));
  }
}
