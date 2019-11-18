class GameControls {
  constructor(game) {
    this.game = game;
    this.savedCameraPosition;
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

  goToGameCamera() {
    this.savedCameraPosition = {
      x: game.camera.position.x,
      y: game.camera.position.y,
      z: game.camera.position.z
    };

    const to = new THREE.Vector3(4.8, 2.6, 0.01);
    const targetTo = new THREE.Vector3(0, 2, 0);

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
}
