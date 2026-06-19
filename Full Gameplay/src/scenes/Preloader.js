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
import { imagesBuyButtonWEBP } from "../../media-coin-sort/images_buy-button.webp.js";
import { imagesCoinTrayWEBP } from "../../media-coin-sort/images_coin-tray.webp.js";
import { imagesCoinsCoin1WEBP } from "../../media-coin-sort/images_coins_coin-1.webp.js";
import { imagesCoinsCoin2WEBP } from "../../media-coin-sort/images_coins_coin-2.webp.js";
import { imagesCoinsCoin3WEBP } from "../../media-coin-sort/images_coins_coin-3.webp.js";
import { imagesCoinsCoin4WEBP } from "../../media-coin-sort/images_coins_coin-4.webp.js";
import { imagesCoinsCoin5WEBP } from "../../media-coin-sort/images_coins_coin-5.webp.js";
import { imagesCoinsCoin6WEBP } from "../../media-coin-sort/images_coins_coin-6.webp.js";
import { imagesCoinsCoinSolo1WEBP } from "../../media-coin-sort/images_coins_coin-solo-1.webp.js";
import { imagesCoinsCoinSolo2WEBP } from "../../media-coin-sort/images_coins_coin-solo-2.webp.js";
import { imagesCoinsCoinSolo3WEBP } from "../../media-coin-sort/images_coins_coin-solo-3.webp.js";
import { imagesCoinsCoinSolo4WEBP } from "../../media-coin-sort/images_coins_coin-solo-4.webp.js";
import { imagesCoinsCoinSolo5WEBP } from "../../media-coin-sort/images_coins_coin-solo-5.webp.js";
import { imagesCoinsCoinSolo6WEBP } from "../../media-coin-sort/images_coins_coin-solo-6.webp.js";
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
  { key: "buyButton", data: imagesBuyButtonWEBP },
  { key: "playNowButton", data: imagesPlayNowButtonWEBP },
  { key: "coinTray", data: imagesCoinTrayWEBP },
  { key: "handPointer", data: imagesHandPointerWEBP },
  { key: "starBurst", data: imagesStarBurstWEBP },
  { key: "coin1", data: imagesCoinsCoin1WEBP },
  { key: "coin2", data: imagesCoinsCoin2WEBP },
  { key: "coin3", data: imagesCoinsCoin3WEBP },
  { key: "coin4", data: imagesCoinsCoin4WEBP },
  { key: "coin5", data: imagesCoinsCoin5WEBP },
  { key: "coin6", data: imagesCoinsCoin6WEBP },
  { key: "coinSolo1", data: imagesCoinsCoinSolo1WEBP },
  { key: "coinSolo2", data: imagesCoinsCoinSolo2WEBP },
  { key: "coinSolo3", data: imagesCoinsCoinSolo3WEBP },
  { key: "coinSolo4", data: imagesCoinsCoinSolo4WEBP },
  { key: "coinSolo5", data: imagesCoinsCoinSolo5WEBP },
  { key: "coinSolo6", data: imagesCoinsCoinSolo6WEBP },
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

  base64LoaderComplete() {
    adReady();
    this.scene.start("Game");
  }
}
