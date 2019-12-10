class AudioMixer {
  constructor() {
    this.tracks = {
      idle: new AudioTrack(true),
      chime: new AudioTrack(false),
      voice: new AudioTrack(false),
      misc: new AudioTrack(false)
    };
    this.audioDirectory = "/assets/sounds/";
    this.fragments = {
      room_idle: "",
      winning: "winning.ogg",
      losing: "",
      click: "",
      tap: ""
    };
  }

  playSoundOnTrack(fragment, track, loop = false) {
    if (this._isValidFragment(fragment)) {
      this.audio = new Audio(this.audioDirectory + this.fragments[fragment]);
    }
  }

  _isValidFragment(fragment) {
    if (typeof this.fragments[fragment] === undefined) {
      return false;
    }
    return true;
  }
}

class AudioTrack {
  constructor(loop = false) {
    this.loop = loop;
    this.audio = new Audio();
    return this;
  }

  setSourceFile(file) {
    this.audio = new Audio(file);
    this.audio.addEventListener("loadeddata", () => {
      this.duration = this.audio.duration;
      this.audio.loop = this.loop;
    });
  }

  setLoop(loop = true) {
    this.loop = loop;
    this.audio.loop = loop;
  }

  play() {
    this.audio.play();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}
