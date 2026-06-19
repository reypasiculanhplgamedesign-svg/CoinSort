import Phaser from "phaser";

import { adStart, onAudioVolumeChange, onCtaPressed } from "../networkPlugin";

export class EndScene extends Phaser.Scene {
  constructor() {
    super("EndScene");
  }

  create() {
    adStart();
    onAudioVolumeChange(this.scene);

    this.background = this.add.graphics().setDepth(0);
    this.rays = this.add.graphics().setDepth(1).setAlpha(0.82).setScrollFactor(0);
    this.logo = this.add.image(0, 0, "logo").setOrigin(0.5).setDepth(2);
    this.playButton = this.add.image(0, 0, "playNowButton").setOrigin(0.5).setDepth(3).setInteractive({ cursor: "pointer" });

    this.input.on("pointerdown", this.handleCta, this);
    this.scale.on("resize", this.handleResize, this);
    this.applyResponsiveLayout(this.scale.gameSize);
    this.playIntro();
    this.playFinishedAudioOnEnter();

    this.onViewportLayoutChange = () => {
      this.applyResponsiveLayout(this.scale.gameSize);
    };
    window.addEventListener("resize", this.onViewportLayoutChange);
    window.addEventListener("orientationchange", this.onViewportLayoutChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", this.onViewportLayoutChange);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", this.handleCta, this);
      this.scale.off("resize", this.handleResize, this);
      window.removeEventListener("resize", this.onViewportLayoutChange);
      window.removeEventListener("orientationchange", this.onViewportLayoutChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", this.onViewportLayoutChange);
      }
      this.ctaTween?.stop();
      this.rayTween?.stop();
      this.endSceneFinishedSound?.stop();
      this.endSceneFinishedSound?.destroy();
    });
  }

  playFinishedAudioOnEnter() {
    if (!this.cache.audio.exists("audioFinished")) {
      return;
    }

    this.endSceneFinishedSound = this.sound.add("audioFinished", { volume: 0.45 });
    this.endSceneFinishedSound.play();
  }

  handleCta() {
    onCtaPressed();
  }

  playIntro() {
    this.cameras.main.fadeIn(260, 255, 255, 255);
    this.logo.setAlpha(0).setScale(this.logo.scaleX * 0.75, this.logo.scaleY * 0.75);
    this.tweens.add({
      targets: this.logo,
      alpha: 1,
      scaleX: this.logoBaseScale,
      scaleY: this.logoBaseScale,
      duration: 420,
      ease: "Back.Out",
    });
    this.ctaTween = this.tweens.add({
      targets: this.playButton,
      scaleX: this.buttonBaseScale * 1.06,
      scaleY: this.buttonBaseScale * 1.06,
      duration: 560,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
    this.rayTween = this.tweens.add({
      targets: this.rays,
      angle: 360,
      duration: 16000,
      repeat: -1,
      ease: "Linear",
    });
  }

  applyResponsiveLayout(gameSize) {
    const width = Math.max(gameSize?.width || this.scale.width, 1);
    const height = Math.max(gameSize?.height || this.scale.height, 1);
    const viewportWidth = Math.max(Math.round(window.visualViewport?.width || window.innerWidth || width), 1);
    const viewportHeight = Math.max(Math.round(window.visualViewport?.height || window.innerHeight || height), 1);
    const isLandscape = viewportWidth > viewportHeight;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.drawGradientBackground(width, height);

    this.rays.setPosition(centerX, centerY);
    this.drawProceduralSunburst(Math.hypot(width, height));

    const logoMaxW = isLandscape ? width * 0.34 : width * 0.74;
    const logoMaxH = isLandscape ? height * 0.38 : height * 0.32;
    this.logoBaseScale = this.fitInside(this.logo, logoMaxW, logoMaxH);
    this.logo.setPosition(centerX, centerY - height * (isLandscape ? 0.08 : 0.12));

    const buttonMaxW = isLandscape ? width * 0.26 : width * 0.66;
    const buttonMaxH = isLandscape ? height * 0.17 : height * 0.13;
    this.buttonBaseScale = this.fitInside(this.playButton, buttonMaxW, buttonMaxH);
    this.playButton.setPosition(centerX, centerY + height * (isLandscape ? 0.24 : 0.18));
  }

  drawGradientBackground(width, height) {
    const edge = 0x6ec6f0;
    const center = 0xc2f5f8;
    this.background.clear();
    this.background.fillGradientStyle(edge, edge, center, center, 1);
    this.background.fillRect(0, 0, width, height * 0.45);
    this.background.fillGradientStyle(center, center, edge, edge, 1);
    this.background.fillRect(0, height * 0.45, width, height * 0.55);
  }

  drawProceduralSunburst(radius) {
    const bladeCount = 20;
    const bandCount = 22;
    const step = (Math.PI * 2) / bladeCount;
    const bladeWidth = step * 0.82;
    const innerRadius = radius * 0.018;
    const outerRadius = radius * 1.22;

    this.rays.clear();
    for (let index = 0; index < bladeCount; index += 1) {
      const angle = index * step;
      const start = angle - bladeWidth * 0.5;
      const end = angle + bladeWidth * 0.5;
      const color = index % 2 === 0 ? 0xffffff : 0x9ed2ff;
      const baseAlpha = index % 2 === 0 ? 0.28 : 0.13;

      for (let band = 0; band < bandCount; band += 1) {
        const t0 = band / bandCount;
        const t1 = (band + 1) / bandCount;
        const r0 = innerRadius + (outerRadius - innerRadius) * t0;
        const r1 = innerRadius + (outerRadius - innerRadius) * t1;
        const fade = Math.pow(Math.max(1 - t1, 0), 1.85);
        const centerGlow = 0.58 + 0.42 * Math.max(1 - t0 * 1.8, 0);
        const alpha = baseAlpha * fade * centerGlow;

        if (alpha <= 0.002) {
          continue;
        }

        this.rays.fillStyle(color, alpha);
        this.rays.beginPath();
        this.rays.moveTo(Math.cos(start) * r0, Math.sin(start) * r0);
        this.rays.lineTo(Math.cos(start) * r1, Math.sin(start) * r1);
        this.rays.lineTo(Math.cos(end) * r1, Math.sin(end) * r1);
        this.rays.lineTo(Math.cos(end) * r0, Math.sin(end) * r0);
        this.rays.closePath();
        this.rays.fillPath();
      }
    }
  }

  fitInside(image, maxWidth, maxHeight) {
    const scale = Math.min(maxWidth / Math.max(image.width, 1), maxHeight / Math.max(image.height, 1));
    image.setDisplaySize(image.width * scale, image.height * scale);
    return scale;
  }

  handleResize(gameSize) {
    const width = Math.max(gameSize?.width || this.scale.width, 1);
    const height = Math.max(gameSize?.height || this.scale.height, 1);
    this.cameras.main.setSize(width, height);
    this.applyResponsiveLayout({ width, height });
  }
}
