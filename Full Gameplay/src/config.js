const buildMode = process.env.BUILD_MODE || process.env.ITERATION_MODE || "FULL";

export const config = {
  adNetworkType: process.env.AD_NETWORK || "applovin",
  googlePlayStoreLink: "https://play.google.com/store/games?hl=en",
  appleStoreLink: "https://www.apple.com/ph/app-store/",
  buildMode, // "10_CLICKS" | "60_SECONDS" | "FULL"
  iterationMode: buildMode,
  autoRedirectOnEnd: true,
};
