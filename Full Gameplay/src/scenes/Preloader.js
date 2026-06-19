import Phaser from "phaser";

import { adReady } from "../networkPlugin";
import { Base64Manager } from "../utils/Base64Manager.js";
import { LoadBase64Audio } from "../utils/LoadBase64Audio.js";

import { audioClickMP3 } from "../../media-coin-sort/audio_click.mp3.js";
import { audioCoinWAV } from "../../media-coin-sort/audio_coin.wav.js";
import { audioFinishedMP3 } from "../../media-coin-sort/audio_finished.mp3.js";
import { audioMergeSuccessMP3 } from "../../media-coin-sort/audio_merge-success.mp3.js";
import { audioMissWAV } from "../../media-coin-sort/audio_miss.wav.js";
import { audioPopWAV } from "../../media-coin-sort/audio_pop.wav.js";
import { audioWrongAnswerWAV } from "../../media-coin-sort/audio_Wrong Answer.wav.js";
import { imagesBuyButtonPNG } from "../../media-coin-sort/images_buy-button.png.js";
import { imagesCoinTrayWEBP } from "../../media-coin-sort/images_coin-tray.webp.js";
import { imagesCoinsCoin1PNG } from "../../media-coin-sort/images_coins_coin-1.png.js";
import { imagesCoinsCoin2PNG } from "../../media-coin-sort/images_coins_coin-2.png.js";
import { imagesCoinsCoin3PNG } from "../../media-coin-sort/images_coins_coin-3.png.js";
import { imagesCoinsCoin4PNG } from "../../media-coin-sort/images_coins_coin-4.png.js";
import { imagesCoinsCoin5PNG } from "../../media-coin-sort/images_coins_coin-5.png.js";
import { imagesCoinsCoin6PNG } from "../../media-coin-sort/images_coins_coin-6.png.js";
import { imagesCoinsCoinSolo1PNG } from "../../media-coin-sort/images_coins_coin-solo-1.png.js";
import { imagesCoinsCoinSolo2PNG } from "../../media-coin-sort/images_coins_coin-solo-2.png.js";
import { imagesCoinsCoinSolo3PNG } from "../../media-coin-sort/images_coins_coin-solo-3.png.js";
import { imagesCoinsCoinSolo4PNG } from "../../media-coin-sort/images_coins_coin-solo-4.png.js";
import { imagesCoinsCoinSolo5PNG } from "../../media-coin-sort/images_coins_coin-solo-5.png.js";
import { imagesCoinsCoinSolo6PNG } from "../../media-coin-sort/images_coins_coin-solo-6.png.js";
import { imagesDealButtonWEBP } from "../../media-coin-sort/images_deal-button.webp.js";
import { imagesFoodsBreadWEBP } from "../../media-coin-sort/images_foods_bread.webp.js";
import { imagesFoodsCerealWEBP } from "../../media-coin-sort/images_foods_cereal.webp.js";
import { imagesFoodsCheeseWEBP } from "../../media-coin-sort/images_foods_cheese.webp.js";
import { imagesFoodsChipBlueWEBP } from "../../media-coin-sort/images_foods_chip-blue.webp.js";
import { imagesFoodsChipRedWEBP } from "../../media-coin-sort/images_foods_chip-red.webp.js";
import { imagesFoodsChipYellowWEBP } from "../../media-coin-sort/images_foods_chip-yellow.webp.js";
import { imagesFoodsChocolateBarWEBP } from "../../media-coin-sort/images_foods_chocolate-bar.webp.js";
import { imagesFoodsCoffeePackWEBP } from "../../media-coin-sort/images_foods_coffee-pack.webp.js";
import { imagesFoodsCookieWEBP } from "../../media-coin-sort/images_foods_cookie.webp.js";
import { imagesFoodsIceChocoWEBP } from "../../media-coin-sort/images_foods_ice-choco.webp.js";
import { imagesFoodsIceCreamWEBP } from "../../media-coin-sort/images_foods_ice-cream.webp.js";
import { imagesFoodsIceVanillaWEBP } from "../../media-coin-sort/images_foods_ice-vanilla.webp.js";
import { imagesFoodsKetchupWEBP } from "../../media-coin-sort/images_foods_ketchup.webp.js";
import { imagesFoodsMilkCartonWEBP } from "../../media-coin-sort/images_foods_milk-carton.webp.js";
import { imagesFoodsOrangeJuiceWEBP } from "../../media-coin-sort/images_foods_orange-juice.webp.js";
import { imagesFoodsSodaCanWEBP } from "../../media-coin-sort/images_foods_soda-can.webp.js";
import { imagesHandPointerWEBP } from "../../media-coin-sort/images_hand-pointer.webp.js";
import { imagesLogoWEBP } from "../../media-coin-sort/images_logo.webp.js";
import { imagesMergeButtonWEBP } from "../../media-coin-sort/images_merge-button.webp.js";
import { imagesPlayNowButtonWEBP } from "../../media-coin-sort/images_play-now-button.webp.js";
import { imagesStarBurstWEBP } from "../../media-coin-sort/images_star-burst.webp.js";

const imageAssets = [
  { key: "logo", data: imagesLogoWEBP },
  { key: "dealButton", data: imagesDealButtonWEBP },
  { key: "mergeButton", data: imagesMergeButtonWEBP },
  { key: "buyButton", data: imagesBuyButtonPNG },
  { key: "playNowButton", data: imagesPlayNowButtonWEBP },
  { key: "coinTray", data: imagesCoinTrayWEBP },
  { key: "handPointer", data: imagesHandPointerWEBP },
  { key: "starBurst", data: imagesStarBurstWEBP },
  { key: "coin1", data: imagesCoinsCoin1PNG },
  { key: "coin2", data: imagesCoinsCoin2PNG },
  { key: "coin3", data: imagesCoinsCoin3PNG },
  { key: "coin4", data: imagesCoinsCoin4PNG },
  { key: "coin5", data: imagesCoinsCoin5PNG },
  { key: "coin6", data: imagesCoinsCoin6PNG },
  { key: "coinSolo1", data: imagesCoinsCoinSolo1PNG },
  { key: "coinSolo2", data: imagesCoinsCoinSolo2PNG },
  { key: "coinSolo3", data: imagesCoinsCoinSolo3PNG },
  { key: "coinSolo4", data: imagesCoinsCoinSolo4PNG },
  { key: "coinSolo5", data: imagesCoinsCoinSolo5PNG },
  { key: "coinSolo6", data: imagesCoinsCoinSolo6PNG },
  { key: "foodBread", data: imagesFoodsBreadWEBP },
  { key: "foodCereal", data: imagesFoodsCerealWEBP },
  { key: "foodCheese", data: imagesFoodsCheeseWEBP },
  { key: "foodChipBlue", data: imagesFoodsChipBlueWEBP },
  { key: "foodChipRed", data: imagesFoodsChipRedWEBP },
  { key: "foodChipYellow", data: imagesFoodsChipYellowWEBP },
  { key: "foodChocolateBar", data: imagesFoodsChocolateBarWEBP },
  { key: "foodCoffeePack", data: imagesFoodsCoffeePackWEBP },
  { key: "foodCookie", data: imagesFoodsCookieWEBP },
  { key: "foodIceChoco", data: imagesFoodsIceChocoWEBP },
  { key: "foodIceCream", data: imagesFoodsIceCreamWEBP },
  { key: "foodIceVanilla", data: imagesFoodsIceVanillaWEBP },
  { key: "foodKetchup", data: imagesFoodsKetchupWEBP },
  { key: "foodMilkCarton", data: imagesFoodsMilkCartonWEBP },
  { key: "foodOrangeJuice", data: imagesFoodsOrangeJuiceWEBP },
  { key: "foodSodaCan", data: imagesFoodsSodaCanWEBP },
];

const audioAssets = [
  { key: "audioClick", data: audioClickMP3 },
  { key: "audioCoin", data: audioCoinWAV },
  { key: "audioFinished", data: audioFinishedMP3 },
  { key: "audioMergeSuccess", data: audioMergeSuccessMP3 },
  { key: "audioMiss", data: audioMissWAV },
  { key: "audioPop", data: audioPopWAV },
  { key: "audioWrongAnswer", data: audioWrongAnswerWAV },
];

export class Preloader extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload() {
    Base64Manager(this, () => this.base64LoaderComplete());

    imageAssets.forEach(({ key, data }) => {
      this.load.image(key, data);
    });
    LoadBase64Audio(this, audioAssets);
  }

  applySmoothTextureFiltering() {
    const linearFilter = Phaser.Textures?.FilterMode?.LINEAR;
    if (typeof linearFilter === "undefined") {
      return;
    }

    imageAssets.forEach(({ key }) => {
      const texture = this.textures.get(key);
      if (texture && typeof texture.setFilter === "function") {
        texture.setFilter(linearFilter);
      }
    });
  }

  base64LoaderComplete() {
    this.applySmoothTextureFiltering();
    adReady();
    this.scene.start("Game");
  }
}
