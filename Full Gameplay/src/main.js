import Phaser from "phaser";

import { mraidAdNetworks, networkPlugin } from "./networkPlugin.js";
import { isIpadScreen } from "./utils/isIpadScreen.js";

import { Game } from "./scenes/Game";
import { Preloader } from "./scenes/Preloader";
import { config } from "./config.js";
import { EndScene } from "./scenes/EndScene.js";

function getDevicePixelRatio() {
  if (typeof window === "undefined") {
    return 1;
  }
  return Math.max(window.devicePixelRatio || 1, 1);
}

function toRenderPixels(value) {
  return Math.max(Math.round(value * getDevicePixelRatio()), 1);
}

const gameConfig = {
  type: Phaser.AUTO,
  parent: "ad-container",
  width: toRenderPixels(1080),
  height: toRenderPixels(1920),
  backgroundColor: "transparent",
  transparent: true,
  render: {
    antialias: true,
    antialiasing: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: false,
    powerPreference: "high-performance",
  },
  scale: {
    mode: Phaser.Scale.NONE,
  },
  scene: [Preloader, Game, EndScene],
};

function initializePhaserGame() {
  return new Phaser.Game(gameConfig);
}

function bindResponsiveResize(game) {
  const shouldRunDelayedResize = isIpadScreen();

  const getViewportSize = () => {
    if (window.visualViewport) {
      return {
        width: Math.max(Math.round(window.visualViewport.width), 1),
        height: Math.max(Math.round(window.visualViewport.height), 1),
      };
    }
    return {
      width: Math.max(window.innerWidth, 1),
      height: Math.max(window.innerHeight, 1),
    };
  };

  const applyResize = () => {
    // Phaser creates the canvas asynchronously; guard until it's ready
    if (!game.isBooted || !game.canvas) {
      return;
    }
    const { width, height } = getViewportSize();
    const container = document.getElementById("ad-container");
    const app = document.getElementById("app");

    if (container) {
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
    }
    if (app) {
      app.style.width = `${width}px`;
      app.style.height = `${height}px`;
    }
    if (game.canvas) {
      game.canvas.style.width = "100%";
      game.canvas.style.height = "100%";
      game.canvas.style.imageRendering = "auto";
    }

    game.scale.resize(toRenderPixels(width), toRenderPixels(height));
    game.scale.refresh();
  };

  let rafId = null;
  const scheduleResize = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      applyResize();
      if (shouldRunDelayedResize) {
        // iPad can report final viewport size slightly later after rotation.
        window.setTimeout(applyResize, 120);
      }
    });
  };

  window.addEventListener("resize", scheduleResize);
  window.addEventListener("orientationchange", scheduleResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleResize);
  }
  game.events.once("destroy", () => {
    window.removeEventListener("resize", scheduleResize);
    window.removeEventListener("orientationchange", scheduleResize);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", scheduleResize);
    }
  });

  // Run once the game is booted so scale manager has a canvas to resize
  if (game.isBooted) {
    scheduleResize();
  } else {
    game.events.once(Phaser.Core.Events.READY, scheduleResize);
  }
}

function setupGameInitialization(adNetworkType) {
  const game = initializePhaserGame();
  bindResponsiveResize(game);

  if (mraidAdNetworks.has(adNetworkType)) {
    networkPlugin.initMraid(() => game);
  } else {
    // vungle, google ads, facebook, tiktok
    return game;
  }
}

setupGameInitialization(config.adNetworkType);
