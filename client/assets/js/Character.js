class Character {
    constructor(gltf) {
        this.gltf = gltf;
        console.log(gltf);
        this.gltf.mixer = new THREE.AnimationMixer(this.gltf.scene);
        this.gltf.clips = this.gltf.animations;

        this.createAnimations(this.gltf);
        this.bindFunctions(this.gltf);

        return this;
    }

    getGLTF() {
        return this.gltf;
    }

    createAnimations(gltf) {
        gltf.actions = {
            sitting: this.createActionFromName("sitting", gltf, true),
            cheering: this.createActionFromName("cheering", gltf),
            disbelief: this.createActionFromName("disbelief", gltf)
        };
    
        gltf.state = {
            isIdleing: true,
        };
    }

    createActionFromName(name, gltf, shouldRepeat = false) {
        var clip = THREE.AnimationClip.findByName(gltf.clips, name);
        var action = gltf.mixer.clipAction(clip);
        if (!shouldRepeat) {
            action.setLoop(THREE.LoopOnce);
        }
        return action;
    }

    bindFunctions(gltf) {
        gltf.startIdleLoop = function() {
            gltf.actions.sitting.play();
            gltf.state.isIdleing = true;
        }

        gltf.stopIdleLoop = function() {
            gltf.actions.sitting.stop();
            gltf.state.isIdleing = false;
        };
        
        gltf.cheer = function() {
            this.pauseAction(this.actions.sitting);
            this.actions.cheering.time = 0;
            this.actions.cheering.paused = false;

            this.actions.cheering.play();
            this.actions.sitting.crossFadeTo(this.actions.cheering, 0.5);
            var context = this;
            this.mixer.addEventListener("finished", function _finished(e) {
                console.log("finished");
                context.setActionToLastFrame(context.actions.cheering);
                context.stopIdleLoop();
                context.startIdleLoop();
                context.actions.cheering.crossFadeTo(context.actions.sitting, 0.5);
                context.mixer.removeEventListener("finished", _finished);
                setTimeout(function () {
                    context.actions.cheering.stop();
                }, 500);
            });
        };
        
        gltf.disbelief = function() {
            this.pauseAction(this.actions.sitting);
            this.actions.disbelief.time = 0;
            this.actions.disbelief.paused = false;

            this.actions.disbelief.play();
            this.actions.sitting.crossFadeTo(this.actions.disbelief, 0.5);
            var context = this;
            this.mixer.addEventListener("finished", function _finished(e) {
                context.setActionToLastFrame(context.actions.disbelief);
                context.stopIdleLoop();
                context.startIdleLoop();
                context.actions.disbelief.crossFadeTo(context.actions.sitting, 0.5);
                context.mixer.removeEventListener("finished", _finished);
                setTimeout(function () {
                    context.actions.disbelief.stop();
                }, 500);
            });
        };

        gltf.pauseAction = function(action) {
            action.paused = true;
            action.enabled = true;
        }

        gltf.setActionToLastFrame = function(action) {
            action.time = action.getClip().duration;
            action.paused = true;
            action.enabled = true;
          };

        gltf.updateAnimations = function(deltaSeconds) {
            this.mixer.update(deltaSeconds);
          };
    }
};