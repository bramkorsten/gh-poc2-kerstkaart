class GameControls {
  constructor(game) {
    this.game = game;
    this.savedCameraPosition;
    this.versusBarTimeout;
    this.winnerScrollTimeout;

    this.setupControlListeners();
  }

  addOnScreenControls(game) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var cameraOrtho = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      1,
      10
    );
    cameraOrtho.position.z = 10;
    var sceneOrtho = new THREE.Scene();
    // game.models.textureLoader.load("assets/textures/sprites/viewinar.png");
  }

  addCameraControls(game) {
    game.controls = new THREE.OrbitControls(
      game.camera,
      game.renderer.domElement
    );
    game.camera.position.set(0, 5, 5);
    game.controls.enablePan = false;
    game.controls.enableZoom = true;
    game.controls.enableDamping = true;
    game.controls.minPolarAngle = 0;
    game.controls.maxPolarAngle = 1.5;
    game.controls.dampingFactor = 0.06;
    game.controls.rotateSpeed = 0.5;
    game.controls.update();
  }

  setupLoadingScreen() {
    $(".gameInformation, .startGameButton").removeClass("visible");
    $(".loadingContainer").addClass("visible");
  }

  setupControlListeners() {
    $("#setNameButton").click(function(e) {
      const name = $("#nameField")[0].value;
      if (name != "") {
        game.client.setName(name).update();
        game.connectToMatch();
      }
    });
  }

  switchMode(e) {
    if ($(e).data("mode") == "viewer") {
      $(e)
        .removeClass("viewer")
        .addClass("game");
      $(e).data("mode", "game");
      this.goToGameCamera();
      game.logic.requestGame();
    } else {
      $(e)
        .removeClass("game")
        .addClass("viewer");
      $(e).data("mode", "viewer");
      this.goToQueueCamera();
      game.logic.state.isInGame = false;
      // TODO: Ask for leave
    }
  }

  goToGameCamera() {
    this.savedCameraPosition = {
      x: game.camera.position.x,
      y: game.camera.position.y,
      z: game.camera.position.z
    };

    const to = new THREE.Vector3(2, 1, 0.01);
    const targetTo = new THREE.Vector3(0, 0.5, 0);

    var tweenCamera = new TWEEN.Tween(game.camera.position)
      .to({ x: to.x, y: to.y, z: to.z }, 2000)
      .onUpdate(function() {
        game.camera.position.set(this.x, this.y, this.z);
      });
    tweenCamera.easing(TWEEN.Easing.Quadratic.InOut);
    tweenCamera.start();

    var tweenCameraTarget = new TWEEN.Tween(game.controls.target)
      .to({ x: targetTo.x, y: targetTo.y, z: targetTo.z }, 2000)
      .onUpdate(function() {
        game.controls.target.set(this.x, this.y, this.z);
      })
      .onComplete(function() {
        game.controls.minAzimuthAngle = 1.38;
        game.controls.maxAzimuthAngle = 1.86;
        game.controls.minPolarAngle = 0.8;
        game.controls.enableZoom = false;
        game.controls.rotateSpeed = 0.1;
      });
    tweenCameraTarget.easing(TWEEN.Easing.Quadratic.InOut);
    tweenCameraTarget.start();
  }

  goToQueueCamera() {
    const position = new THREE.Vector3(0, 4, 6);
    game.controls.minAzimuthAngle = -Infinity;
    game.controls.maxAzimuthAngle = Infinity;
    game.controls.minPolarAngle = 0;
    game.controls.enableZoom = true;
    game.controls.rotateSpeed = 0.5;
    var tweenCamera = new TWEEN.Tween(game.camera.position)
      .to(
        {
          x: position.x,
          y: position.y,
          z: position.z
        },
        2000
      )
      .onUpdate(function() {
        game.camera.position.set(this.x, this.y, this.z);
      });
    tweenCamera.easing(TWEEN.Easing.Quadratic.InOut);
    tweenCamera.start();
    var tweenCameraTarget = new TWEEN.Tween(game.controls.target)
      .to(new THREE.Vector3(0, 0, 0), 2000)
      .onUpdate(function() {
        game.controls.target.set(this.x, this.y, this.z);
      })
      .onComplete(function() {});
    tweenCameraTarget.easing(TWEEN.Easing.Quadratic.InOut);
    tweenCameraTarget.start();
  }

  showVersusBar(data) {
    clearTimeout(this.versusBarTimeout);
    const player1Name = data.currentGame.players[0].player.name;
    const player2Name = data.currentGame.players[1].player.name;

    $("#versusBar #player1").text(player1Name);
    $("#versusBar #player2").text(player2Name);

    $("#versusBar").addClass("visible");

    this.showHandControls(true);

    this.versusBarTimeout = setTimeout(function() {
      $("#versusBar").removeClass("visible");
    }, 5000);
  }

  showHandControls(visible) {
    if (visible) {
      $("#hands").addClass("visible");
      return true;
    } else {
      $("#hands").removeClass("visible");
      return false;
    }
  }

  showWinnerScroll(text, textHighlight) {
    clearTimeout(this.winnerScrollTimeout);
    $("#winScroll .text").html(
      text + " <span class='color'>" + textHighlight + "</span>"
    );
    $("#winScroll").addClass("visible");
  }

  hideWinnerScroll() {
    $("#winScroll").removeClass("visible");
  }

  showRestartButtons(visible) {
    if (visible) {
      $("#playAgainButtons").addClass("visible");
      return true;
    } else {
      $("#playAgainButtons").removeClass("visible");
      return false;
    }
  }
}
