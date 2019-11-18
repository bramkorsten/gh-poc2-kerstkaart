var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

var renderer = new THREE.WebGLRenderer({ antialiasing: true });
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.physicallyCorrectLights = true;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

renderer.setClearColor(0xffffff, 1);

renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;

document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 5);
controls.enablePan = false;
controls.enableZoom = true;
controls.enableDamping = true;
controls.minPolarAngle = 0;
controls.maxPolarAngle = 1.5;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.5;
controls.update();

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

var loader = new THREE.GLTFLoader();

loader.load(
  "assets/models/world_mockup_v1.glb",
  function(gltf) {
    gltf.scene.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(gltf.scene);
  },
  undefined,
  function(error) {
    console.error(error);
  }
);

var directionalLight = new THREE.DirectionalLight(0xf9d891, 1);
directionalLight.castShadow = true;
directionalLight.position.set(10, 5, 5);
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 60;
directionalLight.shadow.bias = -0.001;
directionalLight.mapSize = new THREE.Vector2(2048, 2048);
scene.add(directionalLight);

const helper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(helper);

var light = new THREE.AmbientLight(0xbfcfed); // soft white light
scene.add(light);

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  controls.update();
  renderer.render(scene, camera);
}
animate();

var savedCameraPosition;

function goToGameCam() {
  savedCameraPosition = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  };

  var to = new THREE.Vector3(4.8, 2.6, 0.01);
  var targetTo = new THREE.Vector3(0, 2, 0);

  var tweenCamera = new TWEEN.Tween(camera.position)
    .to({ x: to.x, y: to.y, z: to.z }, 2000)
    .onUpdate(function() {
      camera.position.set(this.x, this.y, this.z);
    });
  tweenCamera.easing(TWEEN.Easing.Quadratic.InOut);
  tweenCamera.start();

  var tweenCameraTarget = new TWEEN.Tween(controls.target)
    .to({ x: targetTo.x, y: targetTo.y, z: targetTo.z }, 2000)
    .onUpdate(function() {
      controls.target.set(this.x, this.y, this.z);
    })
    .onComplete(function() {
      controls.minAzimuthAngle = 1.38;
      controls.maxAzimuthAngle = 1.86;
      controls.minPolarAngle = 0.8;
      controls.enableZoom = false;
      controls.rotateSpeed = 0.1;
    });
  tweenCameraTarget.easing(TWEEN.Easing.Quadratic.InOut);
  tweenCameraTarget.start();
}

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
