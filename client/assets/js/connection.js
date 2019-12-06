class Connection {
  constructor(address = false) {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.address = "ws://gh-kerstkaart-2019.herokuapp.com/";
    this.address = "ws://kerstkaart-server-test.meh.greenhousegroup.com/";
    this.address = "ws://28beacd8.ngrok.io";
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
      game.gameControls.statusText
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
      game.gameControls.statusText
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
    game.gameControls.statusText
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
    this.address = "ws://localhost:5000";
    this.server.close();
    this.reconnect();
  }
}
