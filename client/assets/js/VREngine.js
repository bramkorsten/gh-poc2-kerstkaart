class VREngine {
  constructor() {
    return this;
  }

  createButton(renderer, options) {
    if (options && options.referenceSpaceType) {
      renderer.vr.setReferenceSpaceType(options.referenceSpaceType);
    }

    function getXRSessionInit(mode, options) {
      var space = (options || {}).referenceSpaceType || "local-floor";
      var sessionInit = (options && options.sessionInit) || {};
      sessionInit.optionalFeatures = ["dom-overlay-for-handheld-ar"];

      // Nothing to do for default features.
      if (space == "viewer") return sessionInit;
      if (space == "local" && mode.startsWith("immersive")) return sessionInit;

      // If the user already specified the space as an optional or required feature, don't do anything.
      if (
        sessionInit.optionalFeatures &&
        sessionInit.optionalFeatures.includes(space)
      )
        return sessionInit;
      if (
        sessionInit.requiredFeatures &&
        sessionInit.requiredFeatures.includes(space)
      )
        return sessionInit;

      // The user didn't request the reference space type as a feature. Add it to a shallow copy
      // of the user-supplied sessionInit requiredFeatures (if any) to ensure it's valid to
      // request it later.
      var newInit = Object.assign({}, sessionInit);
      newInit.requiredFeatures = [space];
      if (sessionInit.requiredFeatures) {
        newInit.requiredFeatures = newInit.requiredFeatures.concat(
          sessionInit.requiredFeatures
        );
      }
      return newInit;
    }

    function showEnterXR() {
      let name = "VR";
      if (options && options.mode == "immersive-ar") name = "AR";
      var currentSession = null;

      function onSessionStarted(session) {
        game.xrSession = session;
        let touching = false;
        let touchStartTime;
        game.xrSession.oninputsourceschange = function() {
          if (game.xrSession.inputSources.length > 0) {
            touching = true;
            touchStartTime = new Date();
          } else {
            touching = false;
            const touchEndTime = new Date();
            if (touchEndTime - touchStartTime < 200) {
              game.onARClick();
            } else {
              console.log("Was Long Touch");
            }
          }
        };
        session.requestReferenceSpace("local").then(refSpace => {
          game.xrRefSpace = refSpace;
        });
        game.scene.remove(game.reticle);
        game.reticle = new Reticle(session, game.camera);
        game.scene.add(game.reticle);

        session.addEventListener("end", onSessionEnded);

        renderer.vr.setSession(session);
        button.textContent = "EXIT " + name;

        currentSession = session;
        game.onARStarted();
      }

      function onSessionEnded(/*event*/) {
        currentSession.removeEventListener("end", onSessionEnded);

        renderer.vr.setSession(null);
        button.textContent = "ENTER " + name;

        currentSession = null;
        game.onARStopped();
      }

      button.on("click", function() {
        if (currentSession === null) {
          var mode = (options && options.mode) || "immersive-vr";
          var sessionInit = getXRSessionInit(mode, options);
          navigator.xr.requestSession(mode, sessionInit).then(onSessionStarted);
        } else {
          currentSession.end();
        }
      });
    }

    function disableButton() {
      button.addClass("disabled");
      button.unbind("click");
    }

    function showXRNotFound() {
      disableButton();
    }

    if ("xr" in navigator && "supportsSession" in navigator.xr) {
      var button = $("#arButton");
      button.removeClass("visible");

      var mode = (options && options.mode) || "immersive-vr";
      // SupportsSession will be replaced with isSessionSupported
      navigator.xr
        .supportsSession(mode)
        .then(showEnterXR)
        .catch(showXRNotFound);

      return button;
    } else {
      var message = document.createElement("a");
      message.href = "https://webvr.info";
      message.innerHTML = "WEBVR NOT SUPPORTED";

      message.style.left = "calc(50% - 90px)";
      message.style.width = "180px";
      message.style.textDecoration = "none";

      stylizeElement(message);

      return message;
    }
  }
}
