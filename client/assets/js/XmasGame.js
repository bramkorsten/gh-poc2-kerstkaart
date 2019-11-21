class XmasGame {
  constructor() {
    this.gameControls = new GameControls();
    this.models = new GameModels(false);
    this.VREngine = new VREngine();
    this.scene;
  }

  init() {
    console.log("Starting Game");
    this.gameControls.setupLoadingScreen();
    this.setupRenderEngine();
    this.setupThreeScene();
  }

  /**
   * Setup the Three.js scene information and objects
   */
  async setupThreeScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.gameControls.addOnScreenControls(this);
    this.gameControls.addCameraControls(this);

    await this.models.loadModelsAndTextures(false, false);

    var directionalLight = new THREE.DirectionalLight(0xf9d891, 1);
    directionalLight.castShadow = true;
    directionalLight.position.set(10, 5, 5);
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 60;
    directionalLight.shadow.bias = -0.001;
    directionalLight.mapSize = new THREE.Vector2(2048, 2048);
    this.scene.add(directionalLight);

    const helper = new THREE.DirectionalLightHelper(directionalLight);
    this.scene.add(helper);

    var light = new THREE.AmbientLight(0xbfcfed); // soft white light
    this.scene.add(light);

    let btnAR = this.VREngine.createButton(this.renderer, {
      mode: "immersive-ar",
      referenceSpaceType: "local", // 'local-floor'
      sessionInit: {
        //requiredFeatures: ['local-floor'],
        optionalFeatures: ["dom-overlay-for-handheld-ar"]
      }
    });
    btnAR.style.left = "calc(50% + 10px)";
    document.body.appendChild(btnAR);

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
    this.renderer.setAnimationLoop((time, frame) => this.render(time, frame));
  }

  render(e, XRFrame) {
    if (XRFrame) {
      // console.log(XRFrame.getDevicePose(game.xrRefSpace));
      if (this.reticle) {
        this.reticle.update(this.xrRefSpace);
      }
    }
    TWEEN.update();
    game.controls.update();
    game.renderer.render(game.scene, game.camera);
  }

  onClick(e) {
    const x = 0;
    const y = 0;
    console.log("jowe");
    // console.log(this.reticle.position);
  }

  onARClick() {
    console.log("click");
    if (this.reticle && this.reticle.visible) {
      console.log("reticle visible");
      const position = this.reticle.position;
      const rotation = this.reticle.rotation;

      this.objects.closet.position.set(position.x, position.y, position.z);
      this.objects.closet.rotation.set(rotation.x, rotation.y, rotation.z);
      this.objects.closet.visible = true;
    }
  }

  onARStarted() {
    console.log("AR Started");
    this.objects.closet.visible = false;
    // this.scene.scale.set(0.5, 0.5, 0.5);
  }

  onARStopped() {
    console.log("AR Stopped");
    this.reticle.visible = none;
    // this.scene.scale.set(1, 1, 1);
  }
}

$(function() {
  game = new XmasGame();
  game.init();
});
