import { defineConfig } from 'vite';
import viteString from 'vite-plugin-string';

const adNetworkType = process.env.AD_NETWORK || 'applovin';
const buildMode = process.env.BUILD_MODE || process.env.ITERATION_MODE || 'FULL';

export default defineConfig({
    define: {
        'process.env.AD_NETWORK': JSON.stringify(adNetworkType),
        'process.env.BUILD_MODE': JSON.stringify(buildMode),
        'process.env.ITERATION_MODE': JSON.stringify(buildMode),
    },
    build: {
        assetsInlineLimit: 2097152,
        sourcemap: false
    },
    server: {
        port: 8080
    },
    plugins: [
        viteString({
            compress: false,
            include: [ "**/*.atlas", "**/*.xml" ] // This will inline all Spine Atlas files and XML files as strings
        })
    ]
});
