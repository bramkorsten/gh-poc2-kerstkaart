class Connection {
  constructor(address = false) {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.address = "ws://gh-kerstkaart-2019.herokuapp.com/";
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
      game.gameControls.loadingText
        .changeColor("green")
        .changeTextAndToggle("Connected!")
        .removeInMillis(2000);
      if (!game.isInitialized) {
        game.logic.setupClient();
      } else {
        connection.sendHandshake();
      }
    };

    this.server.onclose = function(event) {
      connection.isConnected = false;
      console.log("Server connection lost...");
      game.gameControls.loadingText
        .changeColor("red")
        .changeTextAndToggle("Connection lost...");
      setTimeout(function() {
        if (connection.connectionAttempts < 5) {
          connection.reconnect();
        }
      }, 2000);
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
    game.gameControls.loadingText
      .changeColor("purple")
      .changeTextAndToggle("Reconnecting");
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

  _useDevelopmentAdress() {
    this.address = "ws://da9d6dcf.ngrok.io";
    this.server.close();
    this.reconnect();
  }
}
