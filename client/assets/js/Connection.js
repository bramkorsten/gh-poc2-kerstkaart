class Connection {
  constructor(address = false) {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.address = "wss://kerstkaart-server.meh.greenhousegroup.com";
    // this.address = "ws://b5e8a0d5.ngrok.io";
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
        } else {
          const options = {
            title: "Could not connect",
            text:
              "Oh Oh, we could not connect to the game server. We're sorry for the inconvenience. You can still look around the room, or try refreshing the page.",
            button1: {
              text: "Look around",
              color: "green"
            },
            button2: {
              text: "Refresh",
              color: "red"
            }
          };
          game.gameControls.windows.newModal(options, function(result) {
            switch (result) {
              case 0:
                return true;
                break;
              case 1:
                location.reload();
                break;
              default:
            }
          });
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
    this.address = "wss://kerstkaart-server-test.meh.greenhousegroup.com";
    this.server.close();
    this.reconnect();
  }

  _useLocalAdress() {
    this.address = "ws://localhost:3000";
    this.server.close();
    this.reconnect();
  }
}
