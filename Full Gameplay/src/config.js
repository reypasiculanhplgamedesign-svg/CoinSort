const buildMode = process.env.BUILD_MODE || process.env.ITERATION_MODE || "FULL";

export const config = {
  adNetworkType: process.env.AD_NETWORK || "applovin",
  googlePlayStoreLink: "https://play.google.com/store/apps/details?id=com.MoodGames.CoinSort&hl=en",
  appleStoreLink: "https://apps.apple.com/us/app/coin-sort/id6446354191",
  buildMode, // "10_CLICKS" | "60_SECONDS" | "FULL"
  iterationMode: buildMode,
  autoRedirectOnEnd: true,
};
