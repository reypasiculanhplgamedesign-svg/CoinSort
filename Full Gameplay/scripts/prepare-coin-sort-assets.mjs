import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = path.join(root, "public", "assets");
const outputRoot = path.join(sourceRoot, "coin-sort");

const imageAssets = [
  ["images/img/gamebg.png", "images/game-bg.webp", { quality: 70 }],
  ["images/img/endcardbg.png", "images/endcard-bg.webp", { quality: 72 }],
  ["images/img/original logo.png", "images/logo.webp", { quality: 76 }],
  ["images/img/sunrays.png", "images/sunrays.webp", { quality: 72 }],
  ["images/img/Deal.png", "images/deal-button.webp", { quality: 78 }],
  ["images/img/Merge.png", "images/merge-button.webp", { quality: 78 }],
  ["images/img/cos_buy-button.png", "images/buy-button.webp", { quality: 78 }],
  ["images/img/download-btn.png", "images/download-button.webp", { quality: 78 }],
  ["images/img/endscreen-play now.png", "images/play-now-button.webp", { quality: 78 }],
  ["images/img/Tray 1.png", "images/coin-tray.webp", { quality: 78 }],
  ["images/img/hand-pointer.png", "images/hand-pointer.webp", { quality: 78 }],
  ["images/Star Burst.webp", "images/star-burst.webp", { quality: 76 }],

  ["images/Coins/1 Top View 1.png", "images/coins/coin-1.webp", { quality: 82 }],
  ["images/Coins/2 Top View 1.png", "images/coins/coin-2.webp", { quality: 82 }],
  ["images/Coins/3 Top View 1.png", "images/coins/coin-3.webp", { quality: 82 }],
  ["images/Coins/4 Top View 1.png", "images/coins/coin-4.webp", { quality: 82 }],
  ["images/Coins/5 Top View 1.png", "images/coins/coin-5.webp", { quality: 82 }],
  ["images/Coins/6 Top View 1.png", "images/coins/coin-6.webp", { quality: 82 }],
  ["images/Coins/1-coin-solo.png", "images/coins/coin-solo-1.webp", { quality: 82 }],
  ["images/Coins/2-coin-solo.png", "images/coins/coin-solo-2.webp", { quality: 82 }],
  ["images/Coins/3-coin-solo.png", "images/coins/coin-solo-3.webp", { quality: 82 }],
  ["images/Coins/4-coin-solo.png", "images/coins/coin-solo-4.webp", { quality: 82 }],
  ["images/Coins/5-coin-solo.png", "images/coins/coin-solo-5.webp", { quality: 82 }],
  ["images/Coins/6-coin-solo.png", "images/coins/coin-solo-6.webp", { quality: 82 }],

  ["images/Foods/COS_Grocery_Items_bread 1.png", "images/foods/bread.webp", { quality: 78 }],
  ["images/Foods/COS_Grocery_Items_cheese 2.png", "images/foods/cheese.webp", { quality: 78 }],
  ["images/Foods/COS_Grocery_Items_chocolate_bar 1.png", "images/foods/chocolate-bar.webp", { quality: 78 }],
  ["images/Foods/COS_Grocery_Items_coffee_pack 1.png", "images/foods/coffee-pack.webp", { quality: 78 }],
  ["images/Foods/COS_Grocery_Items_cookie 1.png", "images/foods/cookie.webp", { quality: 78 }],
  ["images/Foods/icecream-assets-chocolate.png", "images/foods/ice-choco.webp", { quality: 68 }],
  ["images/Foods/icecream-assets-vanilla.png", "images/foods/ice-vanilla.webp", { quality: 68 }],
  ["images/Foods/food-assets-chips-b.png", "images/foods/chip-blue.webp", { quality: 66 }],
  ["images/Foods/food-assets-chips-b (1).png", "images/foods/chip-yellow.webp", { quality: 66 }],
  ["images/Foods/food-assets-chips-b (2).png", "images/foods/chip-red.webp", { quality: 66 }],
  ["images/Foods/COS_Grocery_Items_milk_carton 1.png", "images/foods/milk-carton.webp", { quality: 78 }],
  ["images/Foods/COS_Grocery_Items_soda_can 2.png", "images/foods/soda-can.webp", { quality: 78 }],
  ["images/Foods/food-assets-cereal 1.png", "images/foods/cereal.webp", { quality: 78 }],
  ["images/Foods/food-assets-ketchup 1.png", "images/foods/ketchup.webp", { quality: 78 }],
  ["images/Foods/food-assets-orange-juice 2.png", "images/foods/orange-juice.webp", { quality: 78 }],
  ["images/Foods/food-assets-icecream 1.png", "images/foods/ice-cream.webp", { quality: 78 }],
];

const audioAssets = [
  ["images/Clips/Click.mp3", "audio/click.mp3"],
  ["images/Clips/Cartoon Upgrade 1.mp3", "audio/merge-success.mp3"],
  ["images/Clips/pop.wav", "audio/pop.wav"],
  ["images/Clips/miss.wav", "audio/miss.wav"],
  ["images/Clips/Coin.wav", "audio/coin.wav"],
  ["audio/Finished.mp3", "audio/finished.mp3"],
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function resetOutput() {
  fs.mkdirSync(outputRoot, { recursive: true });
}

async function convertImage([source, output, options]) {
  const sourcePath = path.join(sourceRoot, source);
  const outputPath = path.join(outputRoot, output);
  ensureDir(outputPath);
  await sharp(sourcePath)
    .webp(options)
    .toFile(outputPath);
  console.log(`image: ${source} -> coin-sort/${output}`);
}

function copyAudio([source, output]) {
  const sourcePath = path.join(sourceRoot, source);
  const outputPath = path.join(outputRoot, output);
  ensureDir(outputPath);
  fs.copyFileSync(sourcePath, outputPath);
  console.log(`audio: ${source} -> coin-sort/${output}`);
}

resetOutput();
for (const asset of imageAssets) {
  await convertImage(asset);
}
for (const asset of audioAssets) {
  copyAudio(asset);
}
