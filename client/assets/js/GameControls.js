class GameControls {
  constructor(game) {
    this.game = game;
    this.savedCameraPosition;
    this.versusBarTimeout;
    this.winnerScrollTimeout;

    this.attachUIListeners();
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
    $(".gameInformation, .nameField").removeClass("visible");
    $(".loadingContainer").addClass("visible");
  }

  attachUIListeners() {
    if (client.isExistingUser) {
      $("#nameField").addClass("returningUser");
      $(".startGameButton").removeClass("disabled");
    } else {
      $("#nameInput").on("input", function(e) {
        if (isValidInput($("#nameInput").val())) {
          $(".startGameButton").removeClass("disabled");
        } else {
          $(".startGameButton").addClass("disabled");
        }
      });
    }

    $("#menuButtons .icon").each(function(i, e) {
      $(e).hover(
        function() {
          if ($(e).data("info")) {
            $("#menuButtons .infoText").text($(e).data("info"));
            $("#menuButtons .infoText").addClass("visible");
          }
        },
        function() {
          $("#menuButtons .infoText").removeClass("visible");
        }
      );
    });

    $(".startGameButton").click(function() {
      if (isValidInput($("#nameInput").val()) || client.isExistingUser) {
        if (!client.isExistingUser) {
          game.client.setName($("#nameInput").val()).update();
        }
        game.init();
      } else {
        return false;
      }
    });

    $(window).on("beforeunload", function(e) {
      // Cancel the event (if necessary)
      e.preventDefault();
      // Google Chrome requires returnValue to be set
      e.returnValue = "";
      if (game.logic.state.isInGame || game.logic.state.isInQueue) {
        console.log("forfeiting match");
        game.logic.forfeitMatch();
      }

      return null;
    });

    // window.onbeforeunload = function() {
    //
    //   return "Forfeiting Match";
    // };

    function isValidInput(input) {
      if (input && input.length > 3) {
        return true;
      }
      return false;
    }
    // $("#setNameButton").click(function(e) {
    //   const name = $("#nameField")[0].value;
    //   if (name != "") {
    //     game.client.setName(name).update();
    //     game.connectToMatch();
    //   }
    // });
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
      if (game.logic.state.isInQueue || game.logic.state.isInGame) {
        if (
          confirm(
            "Are you sure you want to leave the match? " +
              "You will lose your streak"
          )
        ) {
          $(e)
            .removeClass("game")
            .addClass("viewer");
          $(e).data("mode", "viewer");
          this.goToQueueCamera();
          game.logic.quitGame();
        }
      } else {
        $(e)
          .removeClass("game")
          .addClass("viewer");
        $(e).data("mode", "viewer");
        this.goToQueueCamera();
        game.logic.quitGame();
      }
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

  vibrate(time = 400) {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(time);
    }
  }

  overlayText = {
    element: $(".largeMessage").first(),
    timeout: false,
    destroyTimeout: false,
    createNew: function(text, timeout = false) {
      var element = this.element.clone(false);
      // this.element = $(".largeMessage")
      //   .clone(false)
      //   .first();
      element.removeClass("hidden visible");
      element.find(".normal").text(text);
      element.find(".outline").text(text);
      var context = this;
      if (timeout) {
        this.timeout = setTimeout(function() {
          context.destroy(element);
        }, timeout);
      }
      this.destroy($(".largeMessage"));
      $("#informationOverlay").append(element);
      setTimeout(function() {
        element.addClass("visible");
      }, 30);
    },
    destroy: function(element, time = 1000) {
      element.addClass("hidden").removeClass("visible");
      this.destroyTimeout = setTimeout(function() {
        element.remove();
      }, time);
    },
    destroyAllActiveOverlays: function() {
      var context = this;
      $(".largeMessage").each(function(i, e) {
        context.destroy($(e));
      });
    }
  };

  statusText = {
    timeout: false,
    show: function(visible = true) {
      clearTimeout(this.timeout);
      if (visible) {
        $("#loadingText").addClass("visible");
        return this;
      } else {
        $("#loadingText").removeClass("visible");
        return this;
      }
    },
    toggleLine: function() {
      $("#loadingText .right").toggleClass("line2");
    },
    getCurrentLine: function() {
      if ($("#loadingText .right").hasClass("line2")) {
        return 2;
      } else {
        return 1;
      }
    },
    changeTextAndToggle: function(text) {
      if (this.getCurrentLine() == 1) {
        this.changeTextOnLine(text, 2);
      } else {
        this.changeTextOnLine(text, 1);
      }
      this.toggleLine();
      clearTimeout(this.timeout);
      this.show();
      return this;
    },
    changeTextOnLine: function(text, line) {
      if (line == 1) {
        $("#loadingText .right .text1").text(text);
      } else {
        $("#loadingText .right .text2").text(text);
      }
      return this;
    },
    changeColor: function(color) {
      switch (color) {
        case "red":
          $("#loadingText .loadingAnimation")
            .removeClass("red grey purple green")
            .addClass("red");
          break;
        case "green":
          $("#loadingText .loadingAnimation")
            .removeClass("red grey purple green")
            .addClass("green");
          break;
        case "purple":
          $("#loadingText .loadingAnimation")
            .removeClass("red grey purple green")
            .addClass("purple");
          break;
        case "grey":
          $("#loadingText .loadingAnimation")
            .removeClass("red grey purple green")
            .addClass("grey");
          break;
        default:
          console.warn("Unknown color. Reset to grey");
          $("#loadingText .loadingAnimation").removeClass(
            "red grey purple green"
          );
      }
      return this;
    },
    removeInMillis: function(milliseconds) {
      clearTimeout(this.timeout);
      const handle = this;
      this.timeout = setTimeout(function() {
        handle.show(false);
      }, milliseconds);
      return this;
    }
  };

  windows = {
    hideAllWindows: function(exceptions = false) {
      if (exceptions) {
        $(".window:not(" + exceptions + ")").removeClass("visible");
      } else {
        $(".window").removeClass("visible");
      }
      game.gameControls.about.updateIcon();
      game.gameControls.highscores.updateIcon();
      return this;
    }
  };

  about = {
    show: function(visible = true) {
      if (visible) {
        game.gameControls.windows.hideAllWindows();
        $("#aboutWindow").addClass("visible");
      } else {
        $("#aboutWindow").removeClass("visible");
      }
      this.updateIcon();
      return this;
    },
    toggle: function() {
      game.gameControls.windows.hideAllWindows(".about");
      $("#aboutWindow").toggleClass("visible");
      this.updateIcon();
      return this;
    },
    updateIcon: function() {
      if ($("#aboutWindow").hasClass("visible")) {
        $("#menuButtons .icon.info")
          .addClass("close")
          .data("info", "Close about");
      } else {
        $("#menuButtons .icon.info")
          .removeClass("close")
          .data("info", "How-to-Play");
      }
      return this;
    }
  };

  highscores = {
    highscoreList: {},
    currentSortingMethod: 0, //0=highscore, 1=name, 2=gamesplayed
    lastRefresh: false,
    show: function(visible = true) {
      if (visible) {
        this.refresh(true);
        game.gameControls.windows.hideAllWindows();
        $("#highscoreWindow").addClass("visible");
      } else {
        $("#highscoreWindow").removeClass("visible");
      }
      this.updateIcon();
      return this;
    },
    toggle: function() {
      game.gameControls.windows.hideAllWindows(".highscores");
      $("#highscoreWindow").toggleClass("visible");
      this.updateIcon();
      this.refresh(true);
      return this;
    },
    updateIcon: function() {
      if ($("#highscoreWindow").hasClass("visible")) {
        $("#menuButtons .icon.highscores")
          .addClass("close")
          .data("info", "Close highscores");
      } else {
        $("#menuButtons .icon.highscores")
          .removeClass("close")
          .data("info", "View highscores");
      }
      return this;
    },
    refresh: function(suppressWarning = false) {
      if (!this.lastRefresh) {
        this.lastRefresh = Date.now();
        connection.sendMessage("getHighscores");
      } else if (this.lastRefresh && this.lastRefresh < new Date() - 10000) {
        this.lastRefresh = Date.now();
        connection.sendMessage("getHighscores");
      } else {
        const lastRefresh = (Date.now() - this.lastRefresh) / 1000;
        if (!suppressWarning) {
          console.warn(
            "TOO MANY REQUESTS: Last refresh was " +
              lastRefresh +
              " seconds ago"
          );
        }
      }
    },
    sortByName: function() {
      this.currentSortingMethod = 1;
      var list = $("#highscoreWindow .highscoresContainer .highscore").get();
      list.sort(_sort);
      $("#highscoreWindow .highscoresContainer").append(list);

      $("#highscoreWindow .highscoresLegend span").removeClass("active");
      $("#highscoreWindow .highscoresLegend .name").addClass("active");

      function _sort(a, b) {
        return a.dataset.name.localeCompare(b.dataset.name);
      }
    },
    sortByHighscore: function() {
      this.currentSortingMethod = 0;
      var list = $("#highscoreWindow .highscoresContainer .highscore").get();
      list.sort(_sort);
      $("#highscoreWindow .highscoresContainer").append(list);

      $("#highscoreWindow .highscoresLegend span").removeClass("active");
      $("#highscoreWindow .highscoresLegend .highscore").addClass("active");

      function _sort(a, b) {
        return b.dataset.highscore - a.dataset.highscore;
      }
    },
    sortByGamesPlayed: function() {
      this.currentSortingMethod = 2;
      var list = $("#highscoreWindow .highscoresContainer .highscore").get();
      list.sort(_sort);
      $("#highscoreWindow .highscoresContainer").append(list);

      $("#highscoreWindow .highscoresLegend span").removeClass("active");
      $("#highscoreWindow .highscoresLegend .matchesPlayed").addClass("active");

      function _sort(a, b) {
        return b.dataset.matchesPlayed - a.dataset.matchesPlayed;
      }
    },
    _onRefresh: function(data) {
      const context = this;
      $("#highscoreWindow .highscoresContainer .highscore").remove();
      // TODO: Make this call on startup?
      $.get("/templates/highscore.mustache", function(template) {
        $.each(data.highscores, function(i, e) {
          if (e.highscore) {
            const userInfo = {
              name: e.name,
              matchesPlayed: e.gamesPlayed,
              highscore: e.highscore.bestStreak,
              token: e.uToken
            };
            // context.highscoreList.push(userInfo);
            var renderedHighscore = Mustache.render(template, userInfo);
            $("#highscoreWindow .highscoresContainer").append(
              renderedHighscore
            );
          }
        });
        switch (this.currentSortingMethod) {
          case 0:
            context.sortByHighscore();
            break;
          case 1:
            context.sortByName();
            break;
          case 2:
            context.sortByGamesPlayed();
            break;
          default:
            context.sortByHighscore();
        }
      });
    }
  };
}
