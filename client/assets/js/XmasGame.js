class XmasGame {
  constructor() {
    this.gameControls = new GameControls();
    this.scene;

    this.setupRenderEngine();
    this.setupThreeScene();
    this.animate();
  }

  /**
   * Setup the Three.js scene information and objects
   */
  setupThreeScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.gameControls.addCameraControls(this);

    var loader = new THREE.GLTFLoader();

    // loader.load(
    //   "assets/models/world_mockup_v1.glb",
    //   function(gltf) {
    //     gltf.scene.traverse(function(child) {
    //       if (child.isMesh) {
    //         child.castShadow = true;
    //         child.receiveShadow = true;
    //       }
    //     });
    //     game.scene.add(gltf.scene);
    //   },
    //   undefined,
    //   function(error) {
    //     console.error(error);
    //   }
    // );

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
  }

  /**
   * Setup the Three.js rendering engine. This is also used for AR
   */
  setupRenderEngine() {
    // create a new renderer with antialiasing
    this.renderer = new THREE.WebGLRenderer({ antialiasing: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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

  animate() {
    console.log(this);
    requestAnimationFrame(this.animate);
    TWEEN.update();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

$(function() {
  game = new XmasGame();
});

// new THREE.RGBELoader()
//   .setDataType(THREE.UnsignedByteType)
//   .setPath("assets/hdr/")
//   .load("fireplace_1k.hdr", function(texture) {
//     var cubeGenerator = new THREE.EquirectangularToCubeGenerator(texture, {
//       resolution: 1024
//     });
//     cubeGenerator.update(renderer);
//     var pmremGenerator = new THREE.PMREMGenerator(
//       cubeGenerator.renderTarget.texture
//     );
//     pmremGenerator.update(renderer);
//     var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(
//       pmremGenerator.cubeLods
//     );
//     pmremCubeUVPacker.update(renderer);
//     var envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;
//
//
//
//     pmremGenerator.dispose();
//     pmremCubeUVPacker.dispose();
//   });

var savedCameraPosition;

function goToGameCam() {}

function goToQueueCam() {
  position = new THREE.Vector3(0, 10, 15);
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.minPolarAngle = 0;
  controls.enableZoom = true;
  controls.rotateSpeed = 0.5;
  var tweenCamera = new TWEEN.Tween(camera.position)
    .to(
      {
        x: position.x,
        y: position.y,
        z: position.z
      },
      2000
    )
    .onUpdate(function() {
      camera.position.set(this.x, this.y, this.z);
    });
  tweenCamera.easing(TWEEN.Easing.Quadratic.InOut);
  tweenCamera.start();
  var tweenCameraTarget = new TWEEN.Tween(controls.target)
    .to(new THREE.Vector3(0, 0, 0), 2000)
    .onUpdate(function() {
      controls.target.set(this.x, this.y, this.z);
    })
    .onComplete(function() {});
  tweenCameraTarget.easing(TWEEN.Easing.Quadratic.InOut);
  tweenCameraTarget.start();
}
