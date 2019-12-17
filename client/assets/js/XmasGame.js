var connection;

class XmasGame {
  constructor() {
    this.logic = new GameLogic();
    this.client = new Client();
    this.client.init();
    connection = new Connection();
    this.server = connection.server;
    this.gameControls = new GameControls();
    this.models = new GameModels(false);
    this.VREngine = new VREngine();
    this.audioMixer = new AudioMixer();
    this.scene;
    this.isInAR = false;
    this.clock = new THREE.Clock();
  }

  init() {
    console.log("Starting Game");
    this.gameControls.setupLoadingScreen();
    this.setupRenderEngine();
    this.setupThreeScene();

    this.gameControls.about.show();
  }

  /**
   * Setup the Three.js scene information and objects
   */
  async setupThreeScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    game.camera.position.set(-1.2477, 0.907, 1.6847);
    this.gameControls.addOnScreenControls(this);
    this.gameControls.addCameraControls(this);

    await this.models.loadModelsAndTextures(false, false);

    this.scene.add(this.objects);

    var light = new THREE.AmbientLight(0xffffff);
    light.intensity = 2;
    this.scene.add(light);

    let btnAR = this.VREngine.createButton(this.renderer, {
      mode: "immersive-ar",
      referenceSpaceType: "local", // 'local-floor'
      sessionInit: {
        //requiredFeatures: ['local-floor'],
        optionalFeatures: ["dom-overlay-for-handheld-ar"]
      }
    });

    this.addAREventListeners();
    window.addEventListener("resize", this.onWindowResize, false);

    this.animate();
  }

  /**
   * Setup the Three.js rendering engine. This is also used for AR
   */
  setupRenderEngine() {
    // create a new renderer with antialiasing
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Enable VR (ar) mode
    this.renderer.vr.enabled = true;
    // Give the renderer accurate lighting
    this.renderer.physicallyCorrectLights = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    this.renderer.setClearColor(0xffffff, 1);
    // Using gammaOutput for textures with GLTF models
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.2;

    document.body.appendChild(this.renderer.domElement);
  }

  /**
   * Create the logic for when an AR session gets started or stopped.
   */
  addAREventListeners() {
    this.renderer.vr.addEventListener("sessionstart", function(ev) {
      console.log("sessionstart", ev);
      game.isInAR = true;
      $("#arButton").addClass("checked");
      document.body.style.backgroundColor = "rgba(0, 0, 0, 0)";
      game.renderer.domElement.style.display = "none";
      if (game.renderer.vr.getSession().environmentBlendMode != "opaque") {
        // TODO: SETUP Which objects should be visible
        game.renderer.setClearColor(0xffffff, 0);
        // room.visible = false;
      }
    });
    this.renderer.vr.addEventListener("sessionend", function(ev) {
      console.log("sessionend", ev);
      game.isInAR = false;
      game.objects.scale.set(1,1,1);
      $("#arButton").removeClass("checked");
      document.body.style.backgroundColor = "";
      game.renderer.domElement.style.display = "";
      // TODO: SETUP Which objects should be visible
      game.renderer.setClearColor(0xffffff, 1);
      // room.visible = true;
    });
    this.renderer.domElement.addEventListener("click", this.onClick.bind(this));
    this.renderer.domElement.addEventListener(
      "touchstart",
      this.onClick.bind(this)
    );
    document.body.addEventListener("touchstart", this.onClick.bind(this));
  }

  /**
   * Update the camera perspective on window resize
   */
  onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate(e) {
    game.renderer.render(game.scene, game.camera);
    this.renderer.setAnimationLoop((time, frame) => this.render(time, frame));
  }

  render(e, XRFrame) {
    // console.log(XRFrame);
    var delta = game.clock.getDelta();
    if (XRFrame) {
      // console.log(XRFrame.getDevicePose(game.xrRefSpace));
      if (this.reticle) {
        this.reticle.update(this.xrRefSpace);
      }
    }
    TWEEN.update();
    game.controls.update();
    if (game.player1 && game.player1.hand) {
      game.player1.hand.updateAnimations(delta);
      if (game.player1.character) {
        game.player1.character.updateAnimations(delta);
      }
      
    }
    if (game.player2 && game.player2.hand) {
      game.player2.hand.updateAnimations(delta);
      if (game.player2.character) {
        game.player2.character.updateAnimations(delta);
      }
    }
    game.renderer.render(game.scene, game.camera);
  }

  onClick(e) {
    const x = 0;
    const y = 0;

    if (game.isInAR && e.target == $("body")[0]) {
      game.onARClick();
    }
    // console.log(this.reticle.position);
  }

  onARClick() {
    if (this.reticle && this.reticle.visible) {
      const position = this.reticle.position;
      const rotation = this.reticle.rotation;
      this.objects.position.set(position.x, position.y, position.z);
      this.objects.rotation.set(0, rotation.y, 0)
      if (!this.objects.visible) {
        this.objects.visible = true;
        
      }
      this.objects.scale.set(0,0,0);
      this.gameControls.popupScene();
    }
  }

  onARStarted() {
    console.log("AR Started");
    this.objects.visible = false;
    this.objects.scale.set(0,0,0);
    // this.scene.scale.set(0.5, 0.5, 0.5);
  }

  onARStopped() {
    console.log("AR Stopped");
    this.reticle.visible = false;
    this.objects.position.set(0,0,0);
    this.objects.rotation.set(0,0,0);
    this.objects.scale.set(1,1,1);
    this.objects.visible = true;
    // this.scene.scale.set(1, 1, 1);
  }
}

$(function() {
  game = new XmasGame();
  // game.init();
});
