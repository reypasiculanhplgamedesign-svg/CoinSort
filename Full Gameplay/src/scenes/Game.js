import Phaser from "phaser";

import { config } from "../config.js";
import { adEnd, adStart, onAudioVolumeChange } from "../networkPlugin";
import { AudioController } from "../game/AudioController.js";

import { audioClickMP3 } from "../../media-coin-sort/audio_click.mp3.js";
import { audioCoinWAV } from "../../media-coin-sort/audio_coin.wav.js";
import { audioMergeSuccessMP3 } from "../../media-coin-sort/audio_merge-success.mp3.js";
import { audioMissWAV } from "../../media-coin-sort/audio_miss.wav.js";
import { audioPopWAV } from "../../media-coin-sort/audio_pop.wav.js";
import { audioWrongAnswerWAV } from "../../media-coin-sort/audio_Wrong Answer.wav.js";

const DESIGN = {
  width: 283,
  height: 502,
};

const DEPTH = {
  background: 0,
  cards: 10,
  trays: 20,
  coins: 35,
  controls: 45,
  fx: 70,
  hand: 90,
};

const BADGE_KEYS = {
  1: "coin1",
  2: "coin2",
  3: "coin3",
  4: "coin4",
  5: "coin5",
  6: "coin6",
};

const STACK_KEYS = {
  1: "coinSolo1",
  2: "coinSolo2",
  3: "coinSolo3",
  4: "coinSolo4",
  5: "coinSolo5",
  6: "coinSolo6",
};

const ACTIVE_PRODUCT = { id: "cookie", key: "foodCookie", value: 3 };

const MENU_PRODUCTS = [
  { id: "chocolate-top", key: "foodChocolateBar", value: 5 },
  { id: "soda", key: "foodSodaCan", value: 3 },
  { id: "cheese", key: "foodCheese", value: 2 },
  { id: "bread", key: "foodBread", value: 5 },
  { id: "chocolate-side", key: "foodChocolateBar", value: 5 },
  { id: "ice-vanilla", key: "foodIceVanilla", value: 4 },
  { id: "milk", key: "foodMilkCarton", value: 3 },
  { id: "cereal-left", key: "foodCereal", value: 5 },
  { id: "cereal-right", key: "foodCereal", value: 3 },
  { id: "chip-yellow", key: "foodChipYellow", value: 2 },
  { id: "orange-juice", key: "foodOrangeJuice", value: 1 },
  { id: "chip-blue", key: "foodChipBlue", value: 5 },
  { id: "chip-red", key: "foodChipRed", value: 3 },
  { id: "ice-choco", key: "foodIceChoco", value: 5 },
  { id: "ketchup", key: "foodKetchup", value: 1 },
];

const MENU_SLOTS = [
  { x: 32, y: 83 },
  { x: 188, y: 83 },
  { x: 251, y: 83 },
  { x: 32, y: 154 },
  { x: 251, y: 154 },
  { x: 32, y: 225 },
  { x: 251, y: 225 },
  { x: 32, y: 296 },
  { x: 251, y: 296 },
  { x: 32, y: 367 },
  { x: 251, y: 367 },
  { x: 32, y: 438 },
  { x: 95, y: 438 },
  { x: 188, y: 438 },
  { x: 251, y: 438 },
];

const PRODUCT_TRACK_SLOTS = [
  { x: 32, y: 83 },
  { x: 32, y: 154 },
  { x: 32, y: 225 },
  { x: 32, y: 296 },
  { x: 32, y: 367 },
  { x: 32, y: 438 },
  { x: 105, y: 438 },
  { x: 178, y: 438 },
  { x: 251, y: 438 },
  { x: 251, y: 367 },
  { x: 251, y: 296 },
  { x: 251, y: 225 },
  { x: 251, y: 154 },
  { x: 251, y: 83 },
  { x: 188, y: 83 },
];

const BOARD = {
  trayCenters: [79, 110, 141, 172, 203],
  trayW: 27,
  trayH: 58,
  coinY: [170, 227, 284, 341],
  coinW: 25.5,
  coinH: 44,
};

const TRAY_COIN_SIZE = {
  w: 22,
  h: 14.7,
  dealW: 23,
  dealH: 15.4,
  dragW: 24,
  dragH: 16,
};

const BOARD_ROWS = 4;
const BOARD_COLS = 5;
const TRAY_CAPACITY = 10;
const COIN_LEVELS = [1, 2, 3, 4, 5];
const MERGE_REWARD_COUNT = 3;
const HAND_GUIDE_IDLE_DELAY = 3000;
const BUILD_MODES = {
  TEN_CLICKS: "10_CLICKS",
  SIXTY_SECONDS: "60_SECONDS",
  FULL: "FULL",
};
const BUILD_CLICK_LIMIT = 10;
const BUILD_TIME_LIMIT_MS = 60000;

const GUIDED_STEPS = [
  { type: "deal", mergeValue: 3 },
  { type: "merge", mergeValue: 3 },
  { type: "buy", value: 3 },
  { type: "wrongProduct" },
];

function normalizeBuildMode(value) {
  const normalized = String(value || BUILD_MODES.FULL)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (normalized === "10_CLICKS" || normalized === "10CLICKS" || normalized === "10_CLICK") {
    return BUILD_MODES.TEN_CLICKS;
  }
  if (normalized === "60_SECONDS" || normalized === "60SECONDS" || normalized === "60_SEC" || normalized === "60SEC") {
    return BUILD_MODES.SIXTY_SECONDS;
  }
  return BUILD_MODES.FULL;
}

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  init() {
    this.stepIndex = 0;
    this.isEnding = false;
    this.draggingCoin = null;
    this.selectedSourceTray = null;
    this.selectedCoinLevel = null;
    this.selectedCoinCount = 0;
    this.selectedStackSprites = null;
    this.isTapMovingStack = false;
    this.dragPointerStart = null;
    this.buildMode = normalizeBuildMode(config.buildMode || config.iterationMode);
    this.validInteractionCount = 0;
    this.buildModeTimer = null;
    this.droppedCoins = [];
    this.mergedPurchaseValue = null;
    this.mergedPurchaseValues = new Set();
    this.pendingHandGuide = null;
    this.handGuideTimer = null;
    this.hasDealtCoins = false;
    this.currentMergeCoinIds = [];
    this.completedMergeTrayIds = [];
    this.unlockedProductLevels = new Set();
  }

  create() {
    adStart();
    onAudioVolumeChange(this.scene);
    this.createAudio();
    this.createBaseObjects();
    this.createProducts();
    this.createTrayBoard();
    this.createControls();
    this.createHand();
    this.bindInput();
    this.applyResponsiveLayout(this.scale.gameSize);
    this.setGuidedStep(0);
    this.startBuildModeTimer();
  }

  createAudio() {
    this.audio = new AudioController(this, {
      click: audioClickMP3,
      coin: audioCoinWAV,
      merge: audioMergeSuccessMP3,
      wrong: audioMissWAV,
      wrongAnswer: audioWrongAnswerWAV,
      pop: audioPopWAV,
    });
    this.audio.create();
  }

  createBaseObjects() {
    this.background = this.add.graphics().setDepth(DEPTH.background);
    this.checkGraphics = this.add.graphics().setDepth(DEPTH.fx).setVisible(false);
  }

  createProducts() {
    this.productQueue = [ACTIVE_PRODUCT, ...MENU_PRODUCTS].map((product) => ({
      ...product,
      purchased: false,
    }));
    this.activeCard = this.createProductCard(this.productQueue[0], true);
    this.menuCards = [];

    for (let index = 0; index < MENU_PRODUCTS.length; index += 1) {
      this.menuCards.push(this.createProductCard(this.productQueue[index + 1], false));
    }
  }

  createProductCard(product, isActive) {
    const card = {
      product,
      isActive,
      container: this.add.container(0, 0).setDepth(DEPTH.cards + (isActive ? 2 : 0)),
      bg: this.add.graphics(),
      productImage: this.add.image(0, 0, product.key).setOrigin(0.5),
      coinBadge: this.add.image(0, 0, BADGE_KEYS[product.value]).setOrigin(0.5),
      buyButton: this.add.image(0, 0, "buyButton").setOrigin(0.5).setInteractive({ cursor: "pointer" }),
      redOverlay: this.add.graphics().setVisible(false),
      checkMark: this.add.graphics().setVisible(false),
    };

    card.container.add([card.bg, card.productImage, card.coinBadge, card.buyButton, card.redOverlay, card.checkMark]);
    card.buyButton.on("pointerdown", () => this.handleProductBuy(card));
    card.productImage.setInteractive({ cursor: "pointer" });
    card.productImage.on("pointerdown", () => this.handleProductBuy(card));
    return card;
  }

  setCardProduct(card, product) {
    card.product = product;
    card.productImage.setTexture(product.key);
    card.coinBadge.setTexture(BADGE_KEYS[product.value]);
    this.updateCardPurchaseState(card);
  }

  advanceProductQueue() {
    if (!this.productQueue?.length) {
      return;
    }

    this.productQueue.push(this.productQueue.shift());
    this.setCardProduct(this.activeCard, this.productQueue[0]);
    for (let index = 0; index < this.menuCards.length; index += 1) {
      this.setCardProduct(this.menuCards[index], this.productQueue[index + 1]);
    }
    this.layoutProducts();
  }

  areAllProductsPurchased() {
    if (!this.productQueue?.length) {
      return false;
    }

    for (let index = 0; index < this.productQueue.length; index += 1) {
      if (!this.productQueue[index].purchased) {
        return false;
      }
    }
    return true;
  }

  createTrayBoard() {
    this.trays = [];
    this.coins = new Map();
    this.trayStates = [];
    this.countLabels = new Map();
    this.trayCoinSprites = new Map();
    this.trayHighlights = new Map();

    for (let row = 0; row < BOARD_ROWS; row += 1) {
      for (let col = 0; col < BOARD.trayCenters.length; col += 1) {
        const tray = this.add.image(0, 0, "coinTray").setOrigin(0.5).setDepth(DEPTH.trays);
        const highlight = this.add.graphics().setDepth(DEPTH.trays + 0.5).setVisible(false);
        tray.slotCol = col;
        tray.slotRow = row;
        tray.trayId = `tray-${row}-${col}`;
        tray.setInteractive({ cursor: "pointer" });
        this.trays.push(tray);
        this.trayHighlights.set(tray.trayId, highlight);
        this.trayStates.push({
          id: tray.trayId,
          row,
          col,
          coins: [],
        });
      }
    }

    for (let row = 0; row < BOARD_ROWS; row += 1) {
      for (let col = 0; col < BOARD_COLS; col += 1) {
        const trayId = `tray-${row}-${col}`;
        const sprites = [];
        for (let slot = 0; slot < TRAY_CAPACITY; slot += 1) {
          const coin = this.add.image(0, 0, STACK_KEYS[1]).setOrigin(0.5).setDepth(DEPTH.coins + slot * 0.01);
          const id = `coin-${row}-${col}-${slot}`;
          coin.value = 1;
          coin.coinId = id;
          coin.trayId = trayId;
          coin.homeCol = col;
          coin.homeRow = row;
          coin.slotIndex = slot;
          coin.setVisible(false).setAlpha(0);
          sprites.push(coin);
          this.coins.set(coin.coinId, coin);
        }
        this.trayCoinSprites.set(trayId, sprites);
      }
    }

    this.prepopulateStartingTrays();
  }

  createControls() {
    this.dealButton = this.add.image(0, 0, "dealButton").setOrigin(0.5).setDepth(DEPTH.controls).setInteractive({ cursor: "pointer" });
    this.mergeButton = this.add.image(0, 0, "mergeButton").setOrigin(0.5).setDepth(DEPTH.controls).setInteractive({ cursor: "pointer" });
    this.dealButton.on("pointerdown", () => this.handleDealPressed());
    this.mergeButton.on("pointerdown", () => this.handleMergePressed());
    this.updateDealButtonState();
  }

  createHand() {
    this.hand = this.add.image(0, 0, "handPointer").setOrigin(0.18, 0.08).setDepth(DEPTH.hand).setVisible(false);
  }

  bindInput() {
    this.input.on("dragstart", this.handleDragStart, this);
    this.input.on("drag", this.handleDrag, this);
    this.input.on("dragend", this.handleDragEnd, this);
    this.input.on("pointerup", this.handleBoardPointerUp, this);
    this.input.on("pointerdown", () => {
      this.audio.unlock();
      this.resetHandGuideIdleTimer();
    });
    this.scale.on("resize", this.handleResize, this);

    this.onViewportLayoutChange = () => {
      this.applyResponsiveLayout(this.scale.gameSize);
      if (this.viewportLayoutTimeout) {
        window.clearTimeout(this.viewportLayoutTimeout);
      }
      this.viewportLayoutTimeout = window.setTimeout(() => {
        this.applyResponsiveLayout(this.scale.gameSize);
        this.viewportLayoutTimeout = null;
      }, 120);
    };

    window.addEventListener("resize", this.onViewportLayoutChange);
    window.addEventListener("orientationchange", this.onViewportLayoutChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", this.onViewportLayoutChange);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("dragstart", this.handleDragStart, this);
      this.input.off("drag", this.handleDrag, this);
      this.input.off("dragend", this.handleDragEnd, this);
      this.input.off("pointerup", this.handleBoardPointerUp, this);
      this.scale.off("resize", this.handleResize, this);
      this.audio?.destroy();
      window.removeEventListener("resize", this.onViewportLayoutChange);
      window.removeEventListener("orientationchange", this.onViewportLayoutChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", this.onViewportLayoutChange);
      }
      if (this.viewportLayoutTimeout) {
        window.clearTimeout(this.viewportLayoutTimeout);
      }
      this.handTween?.stop();
      this.handGuideTimer?.remove(false);
      this.buildModeTimer?.remove(false);
      this.coinPulseTween?.stop();
      this.dealPulseTween?.stop();
      this.mergePulseTween?.stop();
    });
  }

  startBuildModeTimer() {
    if (this.buildMode !== BUILD_MODES.SIXTY_SECONDS) {
      return;
    }

    this.buildModeTimer = this.time.delayedCall(BUILD_TIME_LIMIT_MS, () => {
      this.finishForBuildLimit();
    });
  }

  registerValidInteraction() {
    if (this.isEnding) {
      return true;
    }

    if (this.buildMode !== BUILD_MODES.TEN_CLICKS) {
      return false;
    }

    this.validInteractionCount += 1;
    if (this.validInteractionCount >= BUILD_CLICK_LIMIT) {
      this.finishForBuildLimit();
      return true;
    }

    return false;
  }

  finishForBuildLimit() {
    if (this.isEnding) {
      return;
    }

    this.finishGame({ outcome: "success", delayMs: 0 });
  }

  applyResponsiveLayout(gameSize) {
    const width = Math.max(gameSize?.width || this.scale.width, 1);
    const height = Math.max(gameSize?.height || this.scale.height, 1);
    const scale = Math.min(width / DESIGN.width, height / DESIGN.height);

    this.layout = {
      width,
      height,
      scale,
      offsetX: (width - DESIGN.width * scale) * 0.5,
      offsetY: (height - DESIGN.height * scale) * 0.5,
    };

    this.drawGradientBackground(width, height);
    this.layoutProducts();
    this.layoutTrayBoard();
    this.layoutControls();
    this.redrawCheck();

    const step = GUIDED_STEPS[this.stepIndex];
    if (step && !this.draggingCoin) {
      this.setGuidedStep(this.stepIndex);
    }
  }

  layoutProducts() {
    this.layoutCard(this.activeCard, {
      x: 112,
      y: 83,
      w: 80,
      h: 92,
    });

    for (let index = 0; index < this.menuCards.length; index += 1) {
      const slot = PRODUCT_TRACK_SLOTS[index];
      this.layoutCard(this.menuCards[index], {
        x: slot.x,
        y: slot.y,
        w: 45,
        h: 55,
      });
    }
  }

  layoutCard(card, rectDesign) {
    const rect = this.scaleRect(rectDesign);
    card.layout = rectDesign;
    card.screenLayout = rect;
    card.container.setPosition(rect.x, rect.y);

    const radius = this.ds(card.isActive ? 5 : 4);
    card.bg.clear();
    const footerY = rect.h * (card.isActive ? 0.18 : 0.2);
    card.bg.fillStyle(0xdae4f2, 1);
    card.bg.fillRoundedRect(-rect.w * 0.5, -rect.h * 0.5, rect.w, rect.h, radius);
    card.bg.fillStyle(0xffffff, 0.96);
    card.bg.fillRoundedRect(-rect.w * 0.5, -rect.h * 0.5, rect.w, footerY + rect.h * 0.5, radius);
    card.bg.lineStyle(this.ds(card.isActive ? 2.5 : 1.6), 0xdae4f2, 1);
    card.bg.strokeRoundedRect(-rect.w * 0.5, -rect.h * 0.5, rect.w, rect.h, radius);

    if (card.isActive) {
      this.fitInside(card.productImage, this.ds(54), this.ds(50));
      card.productImage.setPosition(0, this.ds(-15));
      card.coinBadge.setDisplaySize(this.ds(26), this.ds(26));
      card.coinBadge.setPosition(this.ds(-22), this.ds(32));
      card.buyButton.setDisplaySize(this.ds(45), this.ds(45));
      card.buyButton.setPosition(this.ds(15), this.ds(32));
      rectDesign.buyX = rectDesign.x + 15;
      rectDesign.buyY = rectDesign.y + 32;
      this.updateCardPurchaseState(card);
      return;
    }

    this.fitInside(card.productImage, this.ds(27), this.ds(28));
    card.productImage.setPosition(this.ds(1), this.ds(-10));
    card.coinBadge.setDisplaySize(this.ds(16), this.ds(16));
    card.coinBadge.setPosition(this.ds(-13), this.ds(18));
    card.buyButton.setDisplaySize(this.ds(29), this.ds(25));
    card.buyButton.setPosition(this.ds(8.5), this.ds(18));
    rectDesign.buyX = rectDesign.x + 11;
    rectDesign.buyY = rectDesign.y + 18;
    this.updateCardPurchaseState(card);
  }

  updateCardPurchaseState(card) {
    if (!card?.product) {
      return;
    }

    const purchased = Boolean(card.product.purchased);
    if (purchased) {
      card.buyButton.disableInteractive();
      card.productImage.disableInteractive();
      this.drawCardCheck(card);
      card.checkMark.setVisible(true);
      return;
    }

    card.checkMark.clear().setVisible(false);
    card.buyButton.setInteractive({ cursor: "pointer" });
    card.productImage.setInteractive({ cursor: "pointer" });
  }

  drawCardCheck(card) {
    const rect = card.screenLayout;
    if (!rect) {
      return;
    }

    const radius = this.ds(card.isActive ? 11 : 7);
    const x = rect.w * (card.isActive ? 0.28 : 0.29);
    const y = -rect.h * (card.isActive ? 0.31 : 0.3);
    card.checkMark.clear();
    card.checkMark.fillStyle(0xffffff, 0.92);
    card.checkMark.fillCircle(x, y, radius);
    card.checkMark.lineStyle(this.ds(card.isActive ? 4 : 2.4), 0x14b832, 1);
    card.checkMark.beginPath();
    card.checkMark.moveTo(x - radius * 0.55, y + radius * 0.02);
    card.checkMark.lineTo(x - radius * 0.15, y + radius * 0.43);
    card.checkMark.lineTo(x + radius * 0.62, y - radius * 0.42);
    card.checkMark.strokePath();
  }

  layoutTrayBoard() {
    for (let index = 0; index < this.trays.length; index += 1) {
      const tray = this.trays[index];
      const point = this.getCellPoint(tray.slotCol, tray.slotRow);
      tray
        .setPosition(point.x, point.y)
        .setDisplaySize(this.ds(BOARD.trayW), this.ds(BOARD.trayH));
      this.drawTrayReadyBorder(tray.trayId, point.x, point.y, false);
    }

    for (let index = 0; index < this.trayStates.length; index += 1) {
      this.syncTrayVisual(this.trayStates[index], false);
    }
  }

  layoutControls() {
    this.dealButton.setPosition(this.dx(107), this.dy(388)).setDisplaySize(this.ds(66), this.ds(34));
    this.mergeButton.setPosition(this.dx(177), this.dy(388)).setDisplaySize(this.ds(66), this.ds(34));
  }

  setGuidedStep(index) {
    this.stepIndex = index;
    const step = GUIDED_STEPS[this.stepIndex];
    this.highlightDeal(false);
    this.highlightMerge(false);
    this.clearCoinHighlights();

    if (!step || !this.layout) {
      this.clearHandGuide();
      return;
    }

    if (step.type === "deal") {
      this.highlightDeal(true);
      this.animateHand({ x: this.dx(111), y: this.dy(418) }, { x: this.dx(107), y: this.dy(399) }, false);
      return;
    }

    if (step.type === "merge") {
      this.highlightMerge(true);
      this.highlightCoinGroup(this.currentMergeCoinIds);
      this.animateHand({ x: this.dx(183), y: this.dy(418) }, { x: this.dx(177), y: this.dy(399) }, false);
      return;
    }

    if (step.type === "buy") {
      this.highlightBuyableProducts(step.value);
      this.animateHand({ x: this.dx(124), y: this.dy(133) }, { x: this.dx(this.activeCard.layout.buyX), y: this.dy(this.activeCard.layout.buyY) }, false);
      return;
    }

    if (step.type === "wrongProduct") {
      const wrongCard = this.menuCards.find((card) => card.product.id === "soda") || this.menuCards[1];
      this.wrongCard = wrongCard;
      this.animateHand({ x: this.dx(wrongCard.layout.buyX + 5), y: this.dy(wrongCard.layout.buyY + 8) }, { x: this.dx(wrongCard.layout.buyX), y: this.dy(wrongCard.layout.buyY) }, false);
    }
  }

  handleCoinPointerDown(coin) {
    if (this.isTapMovingStack || this.draggingCoin) {
      return;
    }

    const sourceTray = this.getTrayStateByCoin(coin);
    if (this.selectedSourceTray && sourceTray && sourceTray !== this.selectedSourceTray) {
      this.tryMoveSelectedStackToTray(sourceTray);
      return;
    }

    if (this.selectedSourceTray === sourceTray) {
      this.clearSelectedCoinStack();
      return;
    }

    const step = GUIDED_STEPS[this.stepIndex];
    if (step?.type === "dragCoin" && step.coinId !== coin.coinId) {
      this.playWrongCoinFeedback(coin);
      return;
    }

    this.selectCoinStack(coin, sourceTray);
  }

  handleTrayPointerDown(trayId) {
    if (!this.selectedSourceTray || this.isTapMovingStack || this.draggingCoin) {
      return;
    }

    const destinationTray = this.getTrayStateById(trayId);
    if (destinationTray === this.selectedSourceTray) {
      this.clearSelectedCoinStack();
      return;
    }

    this.tryMoveSelectedStackToTray(destinationTray);
  }

  handleBoardPointerUp(pointer) {
    if (this.isTapMovingStack || this.draggingCoin) {
      return;
    }

    const downX = typeof pointer.downX === "number" ? pointer.downX : pointer.x;
    const downY = typeof pointer.downY === "number" ? pointer.downY : pointer.y;
    const tapDistance = Phaser.Math.Distance.Between(downX, downY, pointer.x, pointer.y);
    if (tapDistance > this.ds(10)) {
      return;
    }

    const targetTray = this.getTrayAtPoint(pointer.x, pointer.y);
    if (!targetTray) {
      return;
    }

    if (this.selectedSourceTray) {
      if (targetTray === this.selectedSourceTray) {
        this.clearSelectedCoinStack();
        return;
      }

      this.tryMoveSelectedStackToTray(targetTray);
      return;
    }

    const topCoin = this.getTopCoinInTray(targetTray);
    if (topCoin) {
      this.selectCoinStack(topCoin, targetTray);
    }
  }

  selectCoinStack(coin, sourceTray = this.getTrayStateByCoin(coin)) {
    if (!sourceTray || !this.isTopCoin(coin, sourceTray)) {
      return;
    }

    if (this.registerValidInteraction()) {
      return;
    }

    this.audio.play("click");
    this.hand.setVisible(false);
    this.handTween?.stop();
    this.selectedSourceTray = sourceTray;
    this.selectedCoinLevel = coin.value;
    this.selectedCoinCount = this.getFrontStackCount(sourceTray);
    this.selectedStackSprites = this.getFrontStackSprites(sourceTray, this.selectedCoinCount);
  }

  clearSelectedCoinStack() {
    this.selectedSourceTray = null;
    this.selectedCoinLevel = null;
    this.selectedCoinCount = 0;
    this.selectedStackSprites = null;
  }

  tryMoveSelectedStackToTray(destinationTray) {
    if (
      !this.canDropCoinIntoTray(
        this.selectedSourceTray,
        destinationTray,
        this.selectedCoinLevel,
        this.selectedCoinCount
      )
    ) {
      this.audio.play("wrong");
      return false;
    }

    if (this.registerValidInteraction()) {
      return true;
    }

    this.animateTapCoinTransfer(
      this.selectedSourceTray,
      destinationTray,
      this.selectedCoinLevel,
      this.selectedCoinCount
    );
    return true;
  }

  handleDragStart(pointer, gameObject) {
    if (this.isTapMovingStack) {
      return;
    }

    const sourceTray = this.getTrayStateByCoin(gameObject);
    if (!sourceTray || !this.isTopCoin(gameObject, sourceTray)) {
      return;
    }

    if (this.selectedSourceTray && this.selectedSourceTray !== sourceTray) {
      return;
    }

    this.audio.play("click");
    this.draggingCoin = gameObject;
    this.dragSourceTray = sourceTray;
    this.draggedCoinLevel = gameObject.value;
    this.draggedCoinCount = this.getFrontStackCount(sourceTray);
    this.draggingStackSprites = this.getFrontStackSprites(sourceTray, this.draggedCoinCount);
    this.dragStackOffsets = [];
    this.dragOriginalPoint = { x: gameObject.x, y: gameObject.y };
    this.dragPointerStart = { x: pointer.x, y: pointer.y };
    this.hand.setVisible(false);
    this.handTween?.stop();
    for (let index = 0; index < this.draggingStackSprites.length; index += 1) {
      const sprite = this.draggingStackSprites[index];
      this.dragStackOffsets.push({
        x: sprite.x - gameObject.x,
        y: sprite.y - gameObject.y,
      });
      sprite.setDepth(DEPTH.coins + 20 + index * 0.02);
    }
    this.tweens.add({
      targets: this.draggingStackSprites,
      displayWidth: this.ds(TRAY_COIN_SIZE.dragW),
      displayHeight: this.ds(TRAY_COIN_SIZE.dragH),
      duration: 100,
      ease: "Quad.Out",
    });
  }

  handleDrag(pointer, gameObject) {
    if (this.draggingCoin !== gameObject) {
      return;
    }
    for (let index = 0; index < this.draggingStackSprites.length; index += 1) {
      const sprite = this.draggingStackSprites[index];
      const offset = this.dragStackOffsets[index];
      sprite.setPosition(pointer.x + offset.x, pointer.y + offset.y);
    }
  }

  handleDragEnd(_pointer, gameObject) {
    if (this.draggingCoin !== gameObject) {
      return;
    }

    this.draggingCoin = null;
    const destinationTray = this.getTrayAtPoint(gameObject.x, gameObject.y);
    const movedDistance = this.dragOriginalPoint
      ? Phaser.Math.Distance.Between(this.dragOriginalPoint.x, this.dragOriginalPoint.y, gameObject.x, gameObject.y)
      : 0;
    if (destinationTray === this.dragSourceTray || movedDistance < this.ds(6)) {
      this.returnDraggedCoin(gameObject);
      return;
    }

    if (!this.canDropCoinIntoTray(this.dragSourceTray, destinationTray, this.draggedCoinLevel, this.draggedCoinCount)) {
      this.audio.play("wrong");
      this.returnDraggedCoin(gameObject);
      return;
    }

    this.transferTopCoin(this.dragSourceTray, destinationTray, this.draggedCoinLevel, this.draggedCoinCount);
  }

  dropGuidedCoin(coin, dropPoint) {
    coin.disableInteractive();
    coin.isDropped = true;
    coin.setDepth(DEPTH.coins + 8);
    this.droppedCoins.push(coin);
    this.audio.play("coin");

    this.tweens.add({
      targets: coin,
      x: dropPoint.x,
      y: dropPoint.y,
      displayWidth: this.ds(BOARD.coinW),
      displayHeight: this.ds(BOARD.coinH),
      duration: 180,
      ease: "Back.Out",
      onComplete: () => {
        this.playSpark(dropPoint.x, dropPoint.y, 0.62);
        this.setGuidedStep(this.stepIndex + 1);
      },
    });
  }

  returnDraggedCoin(coin) {
    const sourceTray = this.dragSourceTray;
    const stackSprites = this.draggingStackSprites || [coin];
    const stackStartIndex = sourceTray ? sourceTray.coins.length - stackSprites.length : 0;
    this.dragSourceTray = null;
    this.draggedCoinLevel = null;
    this.draggedCoinCount = 0;
    this.draggingStackSprites = null;
    this.dragStackOffsets = null;
    this.dragPointerStart = null;
    if (!sourceTray) {
      return;
    }
    const point = this.getCellPoint(sourceTray.col, sourceTray.row);
    for (let index = 0; index < stackSprites.length; index += 1) {
      const sprite = stackSprites[index];
      const offset = this.getTrayCoinOffset(stackStartIndex + index);
      this.tweens.add({
        targets: sprite,
        x: point.x + this.ds(offset.x),
        y: point.y + this.ds(offset.y),
        displayWidth: this.ds(TRAY_COIN_SIZE.w),
        displayHeight: this.ds(TRAY_COIN_SIZE.h),
        duration: 160,
        ease: "Back.Out",
        onComplete: index === stackSprites.length - 1 ? () => this.syncTrayVisual(sourceTray, false) : undefined,
      });
    }
  }

  animateTapCoinTransfer(sourceTray, destinationTray, level, count = 1) {
    const acceptedCount = Math.min(count, TRAY_CAPACITY - destinationTray.coins.length);
    const movingSprites = this.getFrontStackSprites(sourceTray, acceptedCount);
    if (!acceptedCount || !movingSprites.length) {
      this.clearSelectedCoinStack();
      return;
    }

    this.audio.play("coin");
    this.isTapMovingStack = true;
    this.hand.setVisible(false);
    this.handTween?.stop();
    const destinationPoint = this.getCellPoint(destinationTray.col, destinationTray.row);
    const destinationStartIndex = destinationTray.coins.length;
    let completed = 0;
    const completeTween = () => {
      completed += 1;
      if (completed !== movingSprites.length) {
        return;
      }

      for (let index = 0; index < acceptedCount; index += 1) {
        sourceTray.coins.pop();
        destinationTray.coins.push(level);
      }

      this.isTapMovingStack = false;
      this.clearSelectedCoinStack();
      this.syncTrayVisual(sourceTray, false);
      this.syncTrayVisual(destinationTray, false);
      this.currentMergeCoinIds = this.getCompletedTrayCoinIds();
      this.updateDealButtonState();
      this.checkDeadlockGameOver();
    };

    for (let index = 0; index < movingSprites.length; index += 1) {
      const sprite = movingSprites[index];
      const offset = this.getTrayCoinOffset(destinationStartIndex + index);
      sprite.disableInteractive();
      sprite.setDepth(DEPTH.coins + 30 + index * 0.02);
      this.tweens.add({
        targets: sprite,
        displayWidth: this.ds(TRAY_COIN_SIZE.w * 0.34),
        duration: 75,
        delay: index * 34,
        yoyo: true,
        repeat: 1,
        ease: "Sine.InOut",
      });
      this.tweens.add({
        targets: sprite,
        x: destinationPoint.x + this.ds(offset.x),
        y: destinationPoint.y + this.ds(offset.y),
        angle: 360,
        duration: 300,
        delay: index * 34,
        ease: "Cubic.InOut",
        onComplete: () => {
          sprite.setAngle(0);
          sprite.setDisplaySize(this.ds(TRAY_COIN_SIZE.w), this.ds(TRAY_COIN_SIZE.h));
          completeTween();
        },
      });
    }
  }

  transferTopCoin(sourceTray, destinationTray, level, count = 1) {
    const acceptedCount = Math.min(count, TRAY_CAPACITY - destinationTray.coins.length);
    if (acceptedCount <= 0 || this.registerValidInteraction()) {
      return;
    }

    for (let index = 0; index < acceptedCount; index += 1) {
      sourceTray.coins.pop();
      destinationTray.coins.push(level);
    }
    this.audio.play("coin");
    this.dragSourceTray = null;
    this.draggedCoinLevel = null;
    this.draggedCoinCount = 0;
    this.draggingStackSprites = null;
    this.dragStackOffsets = null;
    this.dragPointerStart = null;
    this.clearSelectedCoinStack();
    this.syncTrayVisual(sourceTray, false);
    this.syncTrayVisual(destinationTray, false);
    this.currentMergeCoinIds = this.getCompletedTrayCoinIds();
    this.updateDealButtonState();
    this.checkDeadlockGameOver();
  }

  handleDealPressed() {
    if (this.isEnding || this.isDealButtonLocked) {
      return;
    }

    if (this.registerValidInteraction()) {
      return;
    }

    const step = GUIDED_STEPS[this.stepIndex];
    const mergeValue = step?.mergeValue ?? GUIDED_STEPS[0].mergeValue;

    this.audio.play("coin");
    this.hand.setVisible(false);
    this.handTween?.stop();
    this.clearSelectedCoinStack();
    this.highlightDeal(false);
    this.clearCoinHighlights();
    this.dealCoins(mergeValue);
    this.playDealAnimation(() => {
      this.setGuidedStep(step?.type === "deal" ? this.stepIndex + 1 : this.stepIndex);
      this.updateDealButtonState();
      this.checkDeadlockGameOver();
    });
  }

  handleMergePressed() {
    if (this.isEnding) {
      return;
    }

    const step = GUIDED_STEPS[this.stepIndex];
    this.currentMergeCoinIds = this.getCompletedTrayCoinIds();
    if (!this.currentMergeCoinIds.length) {
      this.audio.play("wrong");
      this.shakeObject(this.mergeButton);
      return;
    }

    if (this.registerValidInteraction()) {
      return;
    }

    this.audio.play("merge");
    this.hand.setVisible(false);
    this.handTween?.stop();
    this.clearSelectedCoinStack();
    this.highlightMerge(false);
    this.clearCoinHighlights();
    this.mergedPurchaseValue = null;
    this.mergedPurchaseValues.clear();
    this.playMergeAnimation(step.mergeValue, this.currentMergeCoinIds, () => {
      this.mergedPurchaseValues.forEach((mergedLevel) => {
        this.unlockedProductLevels.add(mergedLevel);
      });

      if (this.mergedPurchaseValues.has(this.activeCard.product.value)) {
        this.purchaseProduct(this.activeCard, { nextStepIndex: 0 });
        return;
      }

      this.setGuidedStep(step?.type === "merge" ? this.stepIndex + 1 : 0);
      this.checkDeadlockGameOver();
    });
  }

  handleProductBuy(card) {
    if (this.isEnding || card.product.purchased) {
      return;
    }

    if (this.registerValidInteraction()) {
      return;
    }

    const matchingCompletedTrayIds = card === this.activeCard ? this.getCompletedTrayIdsForLevel(card.product.value) : [];
    if (matchingCompletedTrayIds.length) {
      this.audio.play("merge");
      this.hand.setVisible(false);
      this.handTween?.stop();
      this.clearSelectedCoinStack();
      this.highlightMerge(false);
      this.clearCoinHighlights();
      this.mergedPurchaseValue = null;
      this.mergedPurchaseValues.clear();
      this.playMergeAnimation(card.product.value, matchingCompletedTrayIds, () => {
        this.unlockedProductLevels.add(card.product.value);
        this.purchaseProduct(card, { nextStepIndex: 0 });
      });
      return;
    }

    const step = GUIDED_STEPS[this.stepIndex];
    if (step?.type === "buy" && this.unlockedProductLevels.has(card.product.value)) {
      this.purchaseProduct(card);
      return;
    }

    if (step?.type === "wrongProduct" && card === this.wrongCard) {
      this.playWrongProductFeedback(card);
      return;
    }

    this.playWrongProductFeedback(card, false);
  }

  purchaseProduct(card, options = {}) {
    if (card.product.purchased) {
      return;
    }

    const nextStepIndex = options.nextStepIndex ?? 0;
    this.audio.play("pop");
    this.hand.setVisible(false);
    this.handTween?.stop();
    this.clearSelectedCoinStack();
    card.product.purchased = true;
    this.updateCardPurchaseState(card);
    this.purchasedCard = card;
    this.checkGraphics.setVisible(true).setAlpha(1);
    this.redrawCheck();
    this.tweens.add({
      targets: this.checkGraphics,
      alpha: 0,
      delay: 120,
      duration: 80,
      ease: "Quad.Out",
      onComplete: () => {
        this.checkGraphics.setVisible(false);
      },
    });

    this.tweens.add({
      targets: card.container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 120,
      yoyo: true,
      ease: "Quad.Out",
    });

    this.time.delayedCall(420, () => {
      this.slidePurchasedCard(card, () => {
        if (this.areAllProductsPurchased()) {
          this.checkGraphics.setVisible(false);
          this.purchasedCard = null;
          this.finishGame();
          return;
        }

        this.checkGraphics.setVisible(false);
        this.purchasedCard = null;
        this.setGuidedStep(nextStepIndex);
        this.checkDeadlockGameOver();
      });
    });
  }

  slidePurchasedCard(card, onComplete) {
    const shouldAdvanceActive = card === this.activeCard;
    if (!shouldAdvanceActive) {
      this.layoutProducts();
      onComplete?.();
      return;
    }

    const trackLayouts = this.getProductTrackLayouts();
    const trackCards = [this.activeCard, ...this.menuCards];
    let completedTweens = 0;
    const completeTween = () => {
      completedTweens += 1;
      if (completedTweens !== trackCards.length) {
        return;
      }
      this.advanceProductQueue();
      onComplete?.();
    };

    for (let index = 0; index < trackCards.length; index += 1) {
      const targetIndex = index === 0 ? trackLayouts.length - 1 : index - 1;
      const targetRect = this.scaleRect(trackLayouts[targetIndex]);
      const movingCard = trackCards[index];
      this.tweens.add({
        targets: movingCard.container,
        x: targetRect.x,
        y: targetRect.y,
        alpha: index === 0 ? 0.78 : 1,
        duration: 280,
        delay: index * 12,
        ease: "Cubic.InOut",
        onComplete: () => {
          movingCard.container.setAlpha(1);
          completeTween();
        },
      });
    }
  }

  getProductTrackLayouts() {
    const layouts = [
      {
        x: 112,
        y: 83,
        w: 80,
        h: 92,
      },
    ];

    for (let index = 0; index < PRODUCT_TRACK_SLOTS.length; index += 1) {
      layouts.push({
        x: PRODUCT_TRACK_SLOTS[index].x,
        y: PRODUCT_TRACK_SLOTS[index].y,
        w: 45,
        h: 55,
      });
    }
    return layouts;
  }

  getPurchasedProductCount() {
    if (!this.productQueue?.length) {
      return 0;
    }

    let count = 0;
    for (let index = 0; index < this.productQueue.length; index += 1) {
      if (this.productQueue[index].purchased) {
        count += 1;
      }
    }
    return count;
  }

  rotateProductsAndTrays(onComplete) {
    for (let col = 0; col < this.trays.length; col += 1) {
      this.tweens.add({
        targets: this.trays[col],
        x: this.trays[col].x + this.ds(7),
        duration: 130,
        delay: col * 40,
        yoyo: true,
        ease: "Sine.InOut",
      });
    }

    for (let index = 0; index < this.menuCards.length; index += 1) {
      const card = this.menuCards[index];
      this.tweens.add({
        targets: card.container,
        x: card.container.x + this.ds(6),
        duration: 140,
        delay: index * 18,
        yoyo: true,
        ease: "Sine.InOut",
      });
    }

    this.time.delayedCall(560, onComplete);
  }

  playWrongProductFeedback(card, finishAfter = true) {
    this.audio.play("wrong");
    this.hand.setVisible(false);
    this.handTween?.stop();
    card.redOverlay.setVisible(true).setAlpha(0.82);
    this.drawRedOverlay(card);
    card.productImage.setTint(0xff3030);
    this.shakeObject(card.container);
    this.tweens.add({
      targets: card.redOverlay,
      alpha: 0,
      delay: 260,
      duration: 360,
      ease: "Sine.Out",
      onComplete: () => {
        card.redOverlay.setVisible(false);
        card.productImage.clearTint();
        if (finishAfter && GUIDED_STEPS[this.stepIndex]?.type === "wrongProduct") {
          this.finishGame({ outcome: "fail", playAudio: false });
        }
      },
    });
  }

  drawRedOverlay(card) {
    const rect = card.screenLayout;
    if (!rect) {
      return;
    }
    card.redOverlay.clear();
    card.redOverlay.fillStyle(0xff2929, 0.28);
    card.redOverlay.fillRoundedRect(-rect.w * 0.5, -rect.h * 0.5, rect.w, rect.h, this.ds(4));
  }

  prepopulateStartingTrays() {
    const shuffled = Phaser.Utils.Array.Shuffle([...this.trayStates]);
    const filledCount = Phaser.Math.Between(10, 15);
    if (shuffled.length) {
      shuffled[0].coins = new Array(TRAY_CAPACITY - 1).fill(3);
    }
    for (let index = 1; index < filledCount && index < shuffled.length; index += 1) {
      const tray = shuffled[index];
      const coinCount = Phaser.Math.Between(2, 7);
      tray.coins = [];
      for (let coinIndex = 0; coinIndex < coinCount; coinIndex += 1) {
        tray.coins.push(Phaser.Utils.Array.GetRandom(COIN_LEVELS));
      }
    }
  }

  dealCoins(mergeValue) {
    this.lastDealtCoinIds = [];
    const available = this.trayStates.filter((tray) => tray.coins.length < TRAY_CAPACITY);
    const shuffled = Phaser.Utils.Array.Shuffle([...available]);
    const selectedCount = this.hasDealtCoins
      ? Phaser.Math.Between(4, Math.max(4, Math.min(shuffled.length, 14)))
      : Phaser.Math.Between(8, Math.max(8, Math.min(shuffled.length, BOARD_ROWS * BOARD_COLS)));
    const selected = shuffled.slice(0, selectedCount);
    const tutorialTray = this.trayStates.find((tray) => tray.coins.length === TRAY_CAPACITY - 1 && tray.coins.every((level) => level === mergeValue));

    if (!this.hasDealtCoins && tutorialTray && !selected.includes(tutorialTray)) {
      selected[0] = tutorialTray;
    }

    for (let index = 0; index < selected.length; index += 1) {
      const tray = selected[index];
      if (tray.coins.length >= TRAY_CAPACITY) {
        this.syncTrayVisual(tray, false);
        continue;
      }
      if (!this.hasDealtCoins && tray === tutorialTray) {
        this.lastDealtCoinIds.push(`coin-${tray.row}-${tray.col}-${tray.coins.length}`);
        tray.coins.push(mergeValue);
        this.syncTrayVisual(tray, false);
        continue;
      }
      const amount = Phaser.Math.Between(1, Math.min(3, TRAY_CAPACITY - tray.coins.length));
      for (let addIndex = 0; addIndex < amount; addIndex += 1) {
        this.lastDealtCoinIds.push(`coin-${tray.row}-${tray.col}-${tray.coins.length}`);
        tray.coins.push(Phaser.Utils.Array.GetRandom(COIN_LEVELS));
      }
      this.syncTrayVisual(tray, false);
    }

    this.currentMergeCoinIds = this.getCompletedTrayCoinIds();
    this.hasDealtCoins = true;
  }

  playDealAnimation(onComplete) {
    const coins = [];
    if (this.lastDealtCoinIds?.length) {
      for (let index = 0; index < this.lastDealtCoinIds.length; index += 1) {
        const coin = this.coins.get(this.lastDealtCoinIds[index]);
        if (coin) {
          coins.push(coin);
        }
      }
    } else {
      this.coins.forEach((coin) => {
        if (coin.visible) {
          coins.push(coin);
        }
      });
    }

    if (!coins.length) {
      onComplete?.();
      return;
    }

    for (let index = 0; index < coins.length; index += 1) {
      const coin = coins[index];
      this.tweens.killTweensOf(coin);
      const targetX = coin.x;
      const targetY = coin.y;
      coin
        .setVisible(true)
        .setAlpha(0)
        .setPosition(targetX, targetY - this.ds(15))
        .setDisplaySize(this.ds(TRAY_COIN_SIZE.w * 0.72), this.ds(TRAY_COIN_SIZE.h * 0.72));
      this.tweens.add({
        targets: coin,
        x: targetX,
        y: targetY,
        alpha: 1,
        displayWidth: this.ds(TRAY_COIN_SIZE.w),
        displayHeight: this.ds(TRAY_COIN_SIZE.h),
        duration: 220,
        delay: index * 18,
        ease: "Sine.Out",
      });
    }

    this.time.delayedCall(700, onComplete);
  }

  playMergeAnimation(_mergeValue, trayIds, onComplete) {
    const coins = this.getCoinsByIds(trayIds);
    if (!coins.length) {
      onComplete?.();
      return;
    }

    const target = { x: coins[0].x, y: coins[0].y };
    for (let index = 0; index < coins.length; index += 1) {
      const coin = coins[index];
      this.tweens.add({
        targets: coin,
        x: target.x,
        y: target.y + this.ds((index - 1) * 2),
        alpha: 0,
        displayWidth: this.ds(BOARD.coinW * 0.72),
        displayHeight: this.ds(BOARD.coinH * 0.72),
        duration: 260,
        ease: "Back.InOut",
      });
    }

    this.time.delayedCall(280, () => {
      this.playSpark(target.x, target.y, 1.2);
      for (let index = 0; index < trayIds.length; index += 1) {
        const tray = this.getTrayStateById(trayIds[index]);
        if (tray && tray.coins.length) {
          const mergedLevel = tray.coins[0];
          this.mergedPurchaseValue = mergedLevel;
          this.mergedPurchaseValues.add(mergedLevel);
          tray.coins = this.getMergeRewardCoins(mergedLevel);
          this.syncTrayVisual(tray, true);
        }
      }
      this.currentMergeCoinIds = this.getCompletedTrayCoinIds();
      this.updateDealButtonState();
      this.time.delayedCall(460, onComplete);
    });
  }

  playSpark(x, y, scaleMultiplier = 1) {
    const burst = this.add.image(x, y, "starBurst").setOrigin(0.5).setDepth(DEPTH.fx);
    const size = this.ds(48 * scaleMultiplier);
    burst.setDisplaySize(size * 0.22, size * 0.22).setAlpha(0.95);
    this.tweens.add({
      targets: burst,
      displayWidth: size,
      displayHeight: size,
      alpha: 0,
      angle: 50,
      duration: 420,
      ease: "Cubic.Out",
      onComplete: () => burst.destroy(),
    });

    for (let index = 0; index < 8; index += 1) {
      const dot = this.add.circle(x, y, this.ds(1.5), 0xffffff, 0.9).setDepth(DEPTH.fx + 1);
      const angle = Phaser.Math.DegToRad(index * 45);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * this.ds(22 * scaleMultiplier),
        y: y + Math.sin(angle) * this.ds(22 * scaleMultiplier),
        alpha: 0,
        duration: 360,
        ease: "Quad.Out",
        onComplete: () => dot.destroy(),
      });
    }
  }

  playWrongCoinFeedback(coin) {
    if (!coin?.setTint) {
      return;
    }
    this.audio.play("wrong");
    coin.setTint(0xff3030);
    this.shakeObject(coin);
    this.tweens.add({
      targets: coin,
      alpha: 0.55,
      duration: 100,
      yoyo: true,
      repeat: 1,
      onComplete: () => coin.clearTint().setAlpha(1),
    });
  }

  returnCoinHome(coin) {
    const home = this.getCoinHomePoint(coin);
    this.tweens.add({
      targets: coin,
      x: home.x,
      y: home.y,
      displayWidth: this.ds(BOARD.coinW),
      displayHeight: this.ds(BOARD.coinH),
      duration: 180,
      ease: "Back.Out",
    });
  }

  animateHand(start, end, repeatDrag) {
    if (!start || !end) {
      return;
    }

    this.pendingHandGuide = { start, end, repeatDrag };
    this.resetHandGuideIdleTimer();
  }

  resetHandGuideIdleTimer() {
    this.handTween?.stop();
    this.hand.setVisible(false);
    this.handGuideTimer?.remove(false);
    if (!this.pendingHandGuide) {
      return;
    }

    this.handGuideTimer = this.time.delayedCall(HAND_GUIDE_IDLE_DELAY, () => {
      this.playPendingHandGuide();
    });
  }

  clearHandGuide() {
    this.pendingHandGuide = null;
    this.handGuideTimer?.remove(false);
    this.handGuideTimer = null;
    this.handTween?.stop();
    this.hand.setVisible(false);
  }

  playPendingHandGuide() {
    if (!this.pendingHandGuide || this.draggingCoin) {
      return;
    }

    const { start, end, repeatDrag } = this.pendingHandGuide;
    this.handTween?.stop();
    this.hand.setDisplaySize(this.ds(42), this.ds(42)).setVisible(true).setAlpha(1).setPosition(start.x, start.y);
    this.handTween = this.tweens.add({
      targets: this.hand,
      x: end.x,
      y: end.y,
      alpha: repeatDrag ? { from: 1, to: 0.42 } : { from: 1, to: 0.72 },
      duration: repeatDrag ? 880 : 520,
      ease: "Sine.InOut",
      repeat: -1,
      repeatDelay: 320,
      onRepeat: () => {
        this.hand.setAlpha(1).setPosition(start.x, start.y);
      },
    });
  }

  highlightCoin(coin) {
    if (!coin) {
      return;
    }
    coin.clearTint().setAlpha(1);
    this.coinPulseTween?.stop();
    this.coinPulseTween = this.tweens.add({
      targets: coin,
      displayWidth: this.ds(BOARD.coinW * 1.12),
      displayHeight: this.ds(BOARD.coinH * 1.12),
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  clearCoinHighlights() {
    this.coinPulseTween?.stop();
    if (this.coinGroupPulseTweens) {
      for (let index = 0; index < this.coinGroupPulseTweens.length; index += 1) {
        this.coinGroupPulseTweens[index].stop();
      }
      this.coinGroupPulseTweens = [];
    }
    for (let index = 0; index < this.trayStates.length; index += 1) {
      this.syncTrayVisual(this.trayStates[index], false);
    }
  }

  highlightCoinGroup(coinIds) {
    this.coinGroupPulseTweens = [];
  }

  highlightBuyableProducts(value) {
    const cards = [this.activeCard, ...this.menuCards];
    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];
      card.container.clearTint?.();
      if (!card.product.purchased && card.product.value === value) {
        this.tweens.add({
          targets: card.container,
          scaleX: 1.04,
          scaleY: 1.04,
          duration: 420,
          yoyo: true,
          repeat: 1,
          ease: "Sine.InOut",
        });
      }
    }
  }

  highlightDeal(enabled) {
    this.dealPulseTween?.stop();
    this.dealPulseTween = null;
    if (this.dealButton) {
      this.dealButton.setDisplaySize(this.ds(66), this.ds(34));
    }
    if (!enabled || !this.dealButton || this.isDealButtonLocked) {
      return;
    }
    this.dealPulseTween = this.tweens.add({
      targets: this.dealButton,
      displayWidth: this.ds(70),
      displayHeight: this.ds(36),
      duration: 440,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  updateDealButtonState() {
    if (!this.dealButton) {
      return;
    }

    this.isDealButtonLocked = this.areAllTraysFull();
    if (this.mergeButton && this.getCompletedTrayCoinIds().length) {
      this.mergeButton.setInteractive({ cursor: "pointer" });
      this.mergeButton.setAlpha(1);
    }

    if (this.isDealButtonLocked) {
      this.dealPulseTween?.stop();
      this.dealPulseTween = null;
      this.dealButton.disableInteractive();
      this.dealButton.setAlpha(0.55);
      this.dealButton.setDisplaySize(this.ds(66), this.ds(34));
      return;
    }

    this.dealButton.setInteractive({ cursor: "pointer" });
    this.dealButton.setAlpha(1);
  }

  areAllTraysFull() {
    for (let index = 0; index < this.trayStates.length; index += 1) {
      if (this.trayStates[index].coins.length < TRAY_CAPACITY) {
        return false;
      }
    }
    return true;
  }

  highlightMerge(enabled) {
    this.mergeButton?.clearTint();
    this.mergePulseTween?.stop();
    this.mergePulseTween = null;
    if (this.mergeButton) {
      this.mergeButton.setDisplaySize(this.ds(66), this.ds(34));
    }
    if (!enabled || !this.mergeButton) {
      return;
    }
    this.mergePulseTween = this.tweens.add({
      targets: this.mergeButton,
      displayWidth: this.ds(70),
      displayHeight: this.ds(36),
      duration: 440,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  shakeObject(target) {
    const startX = target.x;
    this.tweens.add({
      targets: target,
      x: startX + this.ds(4),
      duration: 45,
      yoyo: true,
      repeat: 3,
      onComplete: () => target.setX(startX),
    });
  }

  redrawCheck() {
    if (!this.checkGraphics?.visible || !this.layout) {
      return;
    }

    const card = this.purchasedCard || this.activeCard;
    const layout = card?.layout || { x: 112, y: 83, w: 80, h: 92 };
    const x = this.dx(layout.x + layout.w * 0.25);
    const y = this.dy(layout.y - layout.h * 0.32);
    this.checkGraphics.clear();
    this.checkGraphics.lineStyle(this.ds(6), 0x15b832, 1);
    this.checkGraphics.beginPath();
    this.checkGraphics.moveTo(x - this.ds(10), y + this.ds(2));
    this.checkGraphics.lineTo(x - this.ds(2), y + this.ds(10));
    this.checkGraphics.lineTo(x + this.ds(15), y - this.ds(12));
    this.checkGraphics.strokePath();
  }

  drawTrayReadyBorder(trayId, x, y, enabled) {
    const border = this.trayHighlights?.get(trayId);
    if (!border) {
      return;
    }

    border.clear();
    if (!enabled) {
      border.setVisible(false);
      return;
    }

    const width = this.ds(BOARD.trayW );
    const height = this.ds(BOARD.trayH );
    border.setVisible(true);
    border.lineStyle(this.ds(2.2), 0x23d14d, 1);
    border.strokeRoundedRect(x - width * 0.5, y - height * 0.5, width, height, this.ds(3));
  }

  getHandFindPoint() {
    return { x: this.dx(105), y: this.dy(127) };
  }

  getCoinsByIds(coinIds = []) {
    const coins = [];
    for (let index = 0; index < coinIds.length; index += 1) {
      const sprites = this.trayCoinSprites.get(coinIds[index]);
      if (sprites) {
        for (let spriteIndex = 0; spriteIndex < sprites.length; spriteIndex += 1) {
          if (sprites[spriteIndex].visible) {
            coins.push(sprites[spriteIndex]);
          }
        }
        continue;
      }
      const coin = this.coins.get(coinIds[index]);
      if (coin?.visible) {
        coins.push(coin);
      }
    }
    return coins;
  }

  syncTrayVisual(tray, hideEmpty) {
    const sprites = this.trayCoinSprites.get(tray.id);
    if (!sprites) {
      return;
    }

    const point = this.getCellPoint(tray.col, tray.row);
    const isComplete = this.isTrayComplete(tray);
    this.drawTrayReadyBorder(tray.id, point.x, point.y, isComplete && !hideEmpty);
    for (let index = 0; index < sprites.length; index += 1) {
      const sprite = sprites[index];
      const level = tray.coins[index];
      if (!level || hideEmpty) {
        sprite.disableInteractive();
        sprite.setVisible(false).setAlpha(0).clearTint();
        continue;
      }
      const offset = this.getTrayCoinOffset(index);
      sprite.value = level;
      sprite.setTexture(STACK_KEYS[level]);
      sprite
        .setPosition(point.x + this.ds(offset.x), point.y + this.ds(offset.y))
        .setDisplaySize(this.ds(TRAY_COIN_SIZE.w), this.ds(TRAY_COIN_SIZE.h))
        .setVisible(true)
        .setAlpha(1);
      sprite.setDepth(DEPTH.coins + index * 0.02);
      sprite.clearTint();
      if (index === tray.coins.length - 1) {
        sprite.setInteractive({ cursor: "pointer" });
        this.input.setDraggable(sprite);
      } else {
        sprite.disableInteractive();
      }
    }
  }

  getCompletedTrayCoinIds() {
    const completed = [];
    for (let index = 0; index < this.trayStates.length; index += 1) {
      const tray = this.trayStates[index];
      if (this.isTrayComplete(tray)) {
        completed.push(tray.id);
      }
    }
    return completed;
  }

  getCompletedTrayIdsForLevel(level) {
    const completed = [];
    for (let index = 0; index < this.trayStates.length; index += 1) {
      const tray = this.trayStates[index];
      if (this.isTrayComplete(tray) && tray.coins[0] === level) {
        completed.push(tray.id);
      }
    }
    return completed;
  }

  getMergeRewardCoins(mergedLevel) {
    const rewardLevel = mergedLevel + 1;
    if (!STACK_KEYS[rewardLevel]) {
      return [];
    }
    return new Array(MERGE_REWARD_COUNT).fill(rewardLevel);
  }

  getTrayStateByCoin(coin) {
    if (!coin) {
      return null;
    }
    for (let index = 0; index < this.trayStates.length; index += 1) {
      const tray = this.trayStates[index];
      if (tray.row === coin.homeRow && tray.col === coin.homeCol) {
        return tray;
      }
    }
    return null;
  }

  getTrayStateById(trayId) {
    for (let index = 0; index < this.trayStates.length; index += 1) {
      if (this.trayStates[index].id === trayId) {
        return this.trayStates[index];
      }
    }
    return null;
  }

  getTrayAtPoint(x, y) {
    for (let index = 0; index < this.trayStates.length; index += 1) {
      const tray = this.trayStates[index];
      const point = this.getCellPoint(tray.col, tray.row);
      const halfW = this.ds(BOARD.trayW * 0.65);
      const halfH = this.ds(BOARD.trayH * 0.58);
      if (x >= point.x - halfW && x <= point.x + halfW && y >= point.y - halfH && y <= point.y + halfH) {
        return tray;
      }
    }
    return null;
  }

  canDropCoinIntoTray(sourceTray, destinationTray, level, count = 1) {
    if (!sourceTray || !destinationTray || sourceTray === destinationTray) {
      return false;
    }
    if (destinationTray.coins.length >= TRAY_CAPACITY || count <= 0) {
      return false;
    }
    if (!destinationTray.coins.length) {
      return true;
    }
    return destinationTray.coins[destinationTray.coins.length - 1] === level;
  }

  checkDeadlockGameOver() {
    if (this.isEnding || !this.isBoardDeadlocked()) {
      return;
    }

    this.finishGame({ outcome: "fail" });
  }

  isBoardDeadlocked() {
    if (this.hasAnyTrayCapacity()) {
      return false;
    }
    if (this.getCompletedTrayCoinIds().length) {
      return false;
    }
    if (this.canPurchaseActiveCardFromBoard()) {
      return false;
    }
    return !this.hasAnyLegalTransfer();
  }

  hasAnyTrayCapacity() {
    for (let index = 0; index < this.trayStates.length; index += 1) {
      if (this.trayStates[index].coins.length < TRAY_CAPACITY) {
        return true;
      }
    }
    return false;
  }

  canPurchaseActiveCardFromBoard() {
    return Boolean(
      this.activeCard &&
        !this.activeCard.product.purchased &&
        this.getCompletedTrayIdsForLevel(this.activeCard.product.value).length
    );
  }

  hasAnyLegalTransfer() {
    for (let sourceIndex = 0; sourceIndex < this.trayStates.length; sourceIndex += 1) {
      const sourceTray = this.trayStates[sourceIndex];
      if (!sourceTray.coins.length) {
        continue;
      }

      const level = sourceTray.coins[sourceTray.coins.length - 1];
      const count = this.getFrontStackCount(sourceTray);
      for (let destinationIndex = 0; destinationIndex < this.trayStates.length; destinationIndex += 1) {
        if (this.canDropCoinIntoTray(sourceTray, this.trayStates[destinationIndex], level, count)) {
          return true;
        }
      }
    }
    return false;
  }

  isTopCoin(coin, tray) {
    return Boolean(coin && tray && coin.slotIndex === tray.coins.length - 1);
  }

  getFrontStackCount(tray) {
    if (!tray?.coins.length) {
      return 0;
    }

    const level = tray.coins[tray.coins.length - 1];
    let count = 0;
    for (let index = tray.coins.length - 1; index >= 0; index -= 1) {
      if (tray.coins[index] !== level) {
        break;
      }
      count += 1;
    }
    return count;
  }

  getFrontStackSprites(tray, count) {
    const sprites = this.trayCoinSprites.get(tray.id) || [];
    const stackSprites = [];
    const startIndex = Math.max(tray.coins.length - count, 0);
    for (let index = startIndex; index < tray.coins.length; index += 1) {
      const sprite = sprites[index];
      if (sprite?.visible) {
        stackSprites.push(sprite);
      }
    }
    return stackSprites;
  }

  getTopCoinInTray(tray) {
    if (!tray?.coins.length) {
      return null;
    }

    const sprites = this.trayCoinSprites.get(tray.id);
    const topIndex = tray.coins.length - 1;
    const topCoin = sprites?.[topIndex];
    return topCoin?.visible ? topCoin : null;
  }

  isTrayComplete(tray) {
    if (!tray || tray.coins.length !== TRAY_CAPACITY) {
      return false;
    }
    const level = tray.coins[0];
    for (let index = 1; index < tray.coins.length; index += 1) {
      if (tray.coins[index] !== level) {
        return false;
      }
    }
    return true;
  }

  getTrayCoinOffset(index) {
    return {
      x: 0,
      y: -20 + index * 4.2,
    };
  }

  getCoinHomePoint(coin) {
    return this.getCellPoint(coin.homeCol, coin.homeRow);
  }

  getCoinPoint(coin) {
    return coin ? { x: coin.x, y: coin.y } : null;
  }

  getDropPoint(col, row) {
    return this.getCellPoint(col, row);
  }

  getCellPoint(col, row) {
    return {
      x: this.dx(BOARD.trayCenters[col]),
      y: this.dy(BOARD.coinY[row]),
    };
  }

  scaleRect(rect) {
    return {
      x: this.dx(rect.x),
      y: this.dy(rect.y),
      w: this.ds(rect.w),
      h: this.ds(rect.h),
    };
  }

  dx(value) {
    return this.layout.offsetX + value * this.layout.scale;
  }

  dy(value) {
    return this.layout.offsetY + value * this.layout.scale;
  }

  ds(value) {
    return value * this.layout.scale;
  }

  drawGradientBackground(width, height) {
    const top = 0xc8d8e0;
    const middle = 0x7eecd4;
    this.background.clear();
    this.background.fillGradientStyle(top, top, middle, middle, 1);
    this.background.fillRect(0, 0, width, height * 0.5);
    this.background.fillGradientStyle(middle, middle, top, top, 1);
    this.background.fillRect(0, height * 0.5, width, height * 0.5);
  }

  fitInside(image, maxWidth, maxHeight) {
    const scale = Math.min(maxWidth / Math.max(image.width, 1), maxHeight / Math.max(image.height, 1));
    image.setDisplaySize(image.width * scale, image.height * scale);
  }

  handleResize(gameSize) {
    const width = Math.max(gameSize?.width || this.scale.width, 1);
    const height = Math.max(gameSize?.height || this.scale.height, 1);
    this.cameras.main.setSize(width, height);
    this.applyResponsiveLayout({ width, height });
  }

  finishGame(options = {}) {
    if (this.isEnding) {
      return;
    }

    const outcome = options.outcome || "success";
    const shouldPlayAudio = options.playAudio !== false;
    const delayMs = typeof options.delayMs === "number" ? options.delayMs : 620;
    this.isEnding = true;
    this.buildModeTimer?.remove(false);
    this.buildModeTimer = null;
    this.handTween?.stop();
    this.hand.setVisible(false);
    if (shouldPlayAudio && outcome === "fail") {
      this.audio.play("wrongAnswer");
    }
    adEnd();
    this.time.delayedCall(delayMs, () => {
      this.scene.start("EndScene");
    });
  }
}
