var listener;

class HandController {
  constructor(gltf) {
    this.player = gltf;
    // this.player2.scene = gltf.scene.clone();
    // this.player2.scenes[0] = this.player2.scene;

    this.player.mixer = new THREE.AnimationMixer(this.player.scene);
    this.player.clips = this.player.animations;
    // this.player2.mixer = new THREE.AnimationMixer(this.player2.scene);
    // this.player2.clips = this.player2.animations;

    this.createAnimations(this.player);
    // this.createAnimations(this.player2);

    this.bindFunctions(this.player);
    // this.bindFunctions(this.player2);

    return this.player;
  }

  createAnimations(player) {
    player.actions = {
      start: this.createActionFromName("closed_to_idle", player),
      idle: this.createActionFromName("idle_loop", player, true),
      waving: this.createActionFromName("idle_to_waving_loop", player),
      startShaking: this.createActionFromName("idle_to_shaking", player),
      shakeRock: this.createActionFromName("shaking_to_rock", player),
      shakePaper: this.createActionFromName("shaking_to_paper", player),
      shakeScissors: this.createActionFromName("shaking_to_scissors", player),
      shakeFles: this.createActionFromName("shaking_to_fles", player),
      shoot: this.createActionFromName("endpose_to_shooting", player),
      die: this.createActionFromName("endpose_to_dead", player),
      deadToIdle: this.createActionFromName("dead_to_idle", player),
      shootingToIdle: this.createActionFromName("shooting_to_idle", player)
    };

    player.state = {
      isIdleing: true,
      isWinning: false,
      isInShake: false
    };
  }

  createAnimationClip() {
    console.log();
  }

  createActionFromName(name, player, shouldRepeat = false) {
    var clip = THREE.AnimationClip.findByName(player.clips, name);
    var action = player.mixer.clipAction(clip);
    if (!shouldRepeat) {
      action.setLoop(THREE.LoopOnce);
    }
    // action.clampWhenFinished = true;
    return action;
  }

  bindFunctions(player) {
    player.startIdleLoop = function() {
      this.actions.idle.play();
      this.state.isIdleing = true;
    };

    player.stopIdleLoop = function() {
      this.actions.idle.stop();
      this.state.isIdleing = false;
      this.state.isInShake = false;
    };

    player.start = function() {
      this.actions.start.play();
      var handle = this;
      this.mixer.addEventListener("finished", function() {
        handle.actions.start.stop();
        handle.startIdleLoop();
      });
    };

    player.doShake = function(shake) {
      this.state.isInShake = true;
      var handle = this;
      listener = this.mixer.addEventListener("loop", function _loop(e) {
        handle.mixer.removeEventListener("loop", _loop);
        if (e.action == handle.actions.idle) {
          console.log(e);
          handle.stopIdleLoop();
          handle.actions.startShaking.play();
          handle.mixer.addEventListener("finished", function _finished(e) {
            if (e.action == handle.actions.startShaking) {
              handle.stopIdleLoop();
              handle.actions.startShaking.stop();
              handle.actions.shakeRock.stop();
              handle.actions.shakePaper.stop();
              handle.actions.shakeScissors.stop();
              handle.actions.shakeFles.stop();
              switch (shake) {
                case "rock":
                  handle.actions.shakeRock.play();
                  break;
                case "paper":
                  handle.actions.shakePaper.play();
                  break;
                case "scissors":
                  handle.actions.shakeScissors.play();
                  break;
                case "fles":
                  handle.actions.shakeFles.play();
                  break;
                default:
                  console.log("Not a valid shake");
              }
            } else if (
              e.action == handle.actions.shakeRock ||
              e.action == handle.actions.shakePaper ||
              e.action == handle.actions.shakeScissors ||
              e.action == handle.actions.shakeFles
            ) {
              handle.stopIdleLoop();
              handle.mixer.removeEventListener("finished", _finished);
              handle.playEndingAnimation(shake);
            }
          });
        }
      });
    };

    player.playEndingAnimation = function(shake) {
      this.stopIdleLoop();
      if (this.state.isWinning) {
        this.actions.shoot.play();
        this.crossFadeShake(shake, this.actions.shoot);
      } else {
        this.actions.die.play();
        this.crossFadeShake(shake, this.actions.die);
      }
      var handle = this;
      this.mixer.addEventListener("finished", function _finished2(e) {
        if (
          e.action == handle.actions.shoot ||
          e.action == handle.actions.die
        ) {
          handle.actions.shoot.stop();
          handle.actions.die.stop();
          handle.stopIdleLoop();
          if (handle.state.isWinning) {
            handle.actions.shootingToIdle.play();
          } else {
            handle.actions.deadToIdle.play();
          }
        } else if (
          e.action == handle.actions.deadToIdle ||
          e.action == handle.actions.shootingToIdle
        ) {
          handle.mixer.removeEventListener("finished", _finished2);
          handle.actions.shootingToIdle.stop();
          handle.actions.deadToIdle.stop();
          handle.startIdleLoop();
        }
      });
    };

    player.crossFadeShake = function(shake, fadeToAction) {
      const time = 0.5;
      switch (shake) {
        case "rock":
          this.setActionToLastFrame(this.actions.shakeRock);
          this.actions.shakeRock.crossFadeTo(fadeToAction, time);
          break;
        case "paper":
          this.setActionToLastFrame(this.actions.shakePaper);
          this.actions.shakePaper.crossFadeTo(fadeToAction, time);
          break;
        case "scissors":
          this.setActionToLastFrame(this.actions.shakeScissors);
          this.actions.shakeScissors.crossFadeTo(fadeToAction, time);
          break;
        case "fles":
          this.setActionToLastFrame(this.actions.shakeFles);
          this.actions.shakeFles.crossFadeTo(fadeToAction, time);
          break;
        default:
          console.log("Not a valid shake");
      }
    };

    player.setActionToLastFrame = function(action) {
      action.time = action.getClip().duration;
      action.paused = true;
      action.enabled = true;
    };

    player.updateAnimations = function(deltaSeconds) {
      this.mixer.update(deltaSeconds);
    };
  }
}
