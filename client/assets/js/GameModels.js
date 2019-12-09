class GameModels {
  constructor(showLogs = false) {
    this.showLogs = showLogs;
    this.manager = new THREE.LoadingManager();
    // Register function for when loading starts
    this.manager.onStart = (url, itemsLoaded, itemsTotal) =>
      this.startLoading(url, itemsLoaded, itemsTotal);
    // Register function for when loading has finished
    this.manager.onLoad = () => this.onLoad();
    // Register function for when there is progress
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) =>
      this.onProgress(url, itemsLoaded, itemsTotal);
    // Register function for when there is an error
    this.manager.onError = url => {
      if (this.showLogs) console.log("There was an error while loading " + url);
    };

    const textureLoader = new THREE.TextureLoader(this.manager);
    return this;
  }

  async loadModelsAndTextures(withEnvMap = false, withMetalness = false) {
    // Use with caution. This impacts performance in a MAJOR way.
    if (withEnvMap) await this.loadEnvironmentTexture("fireplace_1k.hdr");

    var gltfLoader = new THREE.GLTFLoader(this.manager);

    gltfLoader.load(
      "assets/models/ar/AR_Scene_v1.glb",
      function(gltf) {
        gltf.scene.traverse(function(child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (withEnvMap) child.material.envMap = game.models.defaultEnvMap;
            if (!withMetalness) {
              child.material.metalness = 0;
            }
          }
        });
        gltf.scene.scale.set(0.5, 0.5, 0.5);
        game.objects = {};
        game.objects.closet = gltf.scene;
        game.scene.add(gltf.scene);
      },
      undefined,
      function(error) {
        console.error(error);
      }
    );

    gltfLoader.load("assets/models/glove/glove.glb", function(gltf) {
      game.player1 = {
        hand: new HandController(gltf)
      };
      game.player1.hand.scene.position.set(0, 0.45, -0.35);
      game.scene.add(game.player1.hand.scene);
      game.player1.hand.mixer.timeScale = 1.4;
      game.player1.hand.start();
    });

    gltfLoader.load("assets/models/glove/glove.glb", function(gltf) {
      game.player2 = {
        hand: new HandController(gltf)
      };
      game.player2.hand.scene.position.set(0, 0.45, 0.35);
      game.player2.hand.scene.rotation.set(0, THREE.Math.degToRad(180), 0);
      game.player2.hand.mixer.timeScale = 1.4;
      game.scene.add(game.player2.hand.scene);
      game.player2.hand.start();
    });
  }

  /**
   * Load an environment texture from an equirectangular hdr map
   * @param  {string} textureName The name / url of the texture in the textures/envmap folder
   */
  loadEnvironmentTexture(textureName) {
    const rgbeLoader = new THREE.RGBELoader(this.manager)
      .setDataType(THREE.UnsignedByteType)
      .setPath("assets/textures/envmap/");

    rgbeLoader.load(textureName, function(texture) {
      var options = {
        minFilter: texture.minFilter,
        magFilter: texture.magFilter
      };

      const map = new THREE.WebGLRenderTargetCube(
        1024,
        1024,
        options
      ).fromEquirectangularTexture(game.renderer, texture);

      var pmremGenerator = new THREE.PMREMGenerator(map.texture);
      pmremGenerator.update(game.renderer);

      var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(
        pmremGenerator.cubeLods
      );
      pmremCubeUVPacker.update(game.renderer);

      const envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;
      game.models.defaultEnvMap = envMap;
    });
  }

  loadTexture(url) {}

  startLoading(url, itemsLoaded, itemsTotal) {
    if (this.showLogs)
      console.log(
        "Started loading file: " +
          url +
          ".\nLoaded " +
          itemsLoaded +
          " of " +
          itemsTotal +
          " files."
      );
  }

  onProgress(url, itemsLoaded, itemsTotal) {
    if (this.showLogs)
      console.log(
        "Loading file: " +
          url +
          ".\nLoaded " +
          itemsLoaded +
          " of " +
          itemsTotal +
          " files."
      );
    var progress = (itemsLoaded / itemsTotal) * 100;
    $("#loadingBar").width(progress + "%");
  }

  onLoad() {
    if (this.showLogs) console.log("Finished Loading");
    $(".gameStartup").removeClass("visible");
  }
}
