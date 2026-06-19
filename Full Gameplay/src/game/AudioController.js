export class AudioController {
  constructor(scene, sources = {}) {
    this.scene = scene;
    this.sources = sources;
    this.htmlAudio = new Map();
    this.phaserAudio = new Map();
    this.hasUnlockedHtml = false;
  }

  create() {
    this.addPhaserSound("click", "audioClick", 0.35);
    this.addPhaserSound("coin", "audioCoin", 0.35);
    this.addPhaserSound("merge", "audioMergeSuccess", 0.42);
    this.addPhaserSound("wrong", "audioMiss", 0.42);
    this.addPhaserSound("wrongAnswer", "audioWrongAnswer", 0.45);
    this.addPhaserSound("pop", "audioPop", 0.38);
    this.addPhaserSound("finished", "audioFinished", 0.45);

    this.addHtmlAudio("click", this.sources.click, false, 0.35);
    this.addHtmlAudio("coin", this.sources.coin, false, 0.35);
    this.addHtmlAudio("merge", this.sources.merge, false, 0.42);
    this.addHtmlAudio("wrong", this.sources.wrong, false, 0.42);
    this.addHtmlAudio("wrongAnswer", this.sources.wrongAnswer, false, 0.45);
    this.addHtmlAudio("pop", this.sources.pop, false, 0.38);
    this.addHtmlAudio("finished", this.sources.finished, false, 0.45);
    this.bindVisibilityLifecycle();
  }

  addPhaserSound(id, key, volume) {
    if (!this.scene.sound || !this.scene.cache.audio.exists(key)) {
      return;
    }
    this.phaserAudio.set(id, this.scene.sound.add(key, { volume }));
  }

  addHtmlAudio(id, src, loop, volume) {
    if (!src || typeof Audio === "undefined") {
      return;
    }
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.load();
    this.htmlAudio.set(id, audio);
  }

  unlock() {
    const context = this.scene.sound?.context;
    if (context && (context.state === "suspended" || context.state === "interrupted") && typeof context.resume === "function") {
      context.resume().catch(() => {});
    }
    if (this.hasUnlockedHtml) {
      return;
    }
    this.hasUnlockedHtml = true;
    this.htmlAudio.forEach((audio) => {
      const originalVolume = audio.volume;
      audio.muted = true;
      audio.volume = 0;
      const restore = () => {
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch {
          // Mobile WebViews can reject seeks until audio is fully unlocked.
        }
        audio.volume = originalVolume;
        audio.muted = false;
      };
      const playPromise = audio.play();
      if (playPromise?.then) {
        playPromise.then(restore).catch(restore);
      } else {
        restore();
      }
    });
  }

  play(id) {
    this.unlock();
    const html = this.htmlAudio.get(id);
    if (html) {
      try {
        html.currentTime = 0;
      } catch {
        // Keep playback best-effort on restrictive ad WebViews.
      }
      const playPromise = html.play();
      if (playPromise?.catch) {
        playPromise.catch(() => this.playPhaser(id));
      }
      return;
    }
    this.playPhaser(id);
  }

  playPhaser(id) {
    const sound = this.phaserAudio.get(id);
    if (!sound) {
      return;
    }
    if (sound.isPlaying) {
      sound.stop();
    }
    sound.play();
  }

  bindVisibilityLifecycle() {
    this.handleHidden = () => {
      this.htmlAudio.forEach((audio) => {
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch {
          // Some containers reject currentTime writes during pagehide.
        }
      });
      this.scene.sound?.pauseAll?.();
    };
    this.handleShown = () => {
      this.scene.sound?.resumeAll?.();
    };
    this.handleVisibility = () => {
      if (document.hidden) {
        this.handleHidden();
      } else {
        this.handleShown();
      }
    };
    document.addEventListener("visibilitychange", this.handleVisibility);
    window.addEventListener("pagehide", this.handleHidden);
    window.addEventListener("blur", this.handleHidden);
    window.addEventListener("pageshow", this.handleShown);
    window.addEventListener("focus", this.handleShown);
  }

  destroy() {
    if (this.handleVisibility) {
      document.removeEventListener("visibilitychange", this.handleVisibility);
    }
    if (this.handleHidden) {
      window.removeEventListener("pagehide", this.handleHidden);
      window.removeEventListener("blur", this.handleHidden);
    }
    if (this.handleShown) {
      window.removeEventListener("pageshow", this.handleShown);
      window.removeEventListener("focus", this.handleShown);
    }
    this.htmlAudio.forEach((audio) => audio.pause());
    this.htmlAudio.clear();
    this.phaserAudio.clear();
  }
}
