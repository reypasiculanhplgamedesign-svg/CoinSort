const { MultiSelect } = require('enquirer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const ITERATIONS = ['10clicks', '60sec', 'full'];

// Create a function to ensure directory exists
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function copyRecursive(src, dest) {
    // Create destination directory if it doesn't exist
    ensureDir(dest);

    // Read source directory contents
    const items = fs.readdirSync(src);

    items.forEach(item => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);

        const stats = fs.statSync(srcPath);

        if (stats.isDirectory()) {
            // If it's a directory, recursively copy it
            copyRecursive(srcPath, destPath);
        } else {
            // If it's a file, copy it directly
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

function copyBuildOutput(network, buildType, iteration, targetDir) {
    let sourceDir;

    if (buildType === 'split') {
        sourceDir = `dist-split-${network}-${iteration}`;
    } else {
        sourceDir = `dist-inline-${network}-${iteration}`;
    }

    //console.log(`Looking for build in: ${sourceDir}`);

    if (!fs.existsSync(sourceDir)) {
        throw new Error(`Build directory ${sourceDir} not found. Current directory: ${process.cwd()}`);
    }

    try {
        // Copy all contents recursively
        copyRecursive(sourceDir, targetDir);
        //console.log(`Successfully copied ${sourceDir} to ${targetDir}`);

        // Clean up the source directory
        fs.rmSync(sourceDir, { recursive: true, force: true });
    } catch (err) {
        console.error(`Error during copy operation:`, err);
        throw err;
    }
}

// Function to execute build command
function buildNetwork(network, buildType, iteration) {
    return new Promise((resolve, reject) => {
        const buildDir = path.join('ad-builds', iteration, network, buildType);
        ensureDir(buildDir);

        console.log(`\x1b[1m\x1b[32mBuilding \x1b[34m${network}\x1b[32m ${iteration} (${buildType})...\x1b[0m`);

        // Set environment variables directly in the process.env
        const env = {
            ...process.env,
            AD_NETWORK: network,
            ITERATION_MODE: iteration
        };

        const command = `npm run build:${buildType}`;

        exec(command, { env }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error building ${network} (${buildType}):`, stderr);
                reject(error);
                return;
            }

            // Debug
            /* console.log('Current directory:', process.cwd());
            console.log('Directory contents:', fs.readdirSync('.')); */

            try {
                copyBuildOutput(network, buildType, iteration, buildDir);
                console.log(`✓ ${network} ${iteration} ${buildType} build complete`);
                resolve(stdout);
            } catch (err) {
                console.error(`Error copying build output for ${network} (${buildType}):`, err);
                reject(err);
            }
        });
    });
}

const prompt = new MultiSelect({
    name: 'value',
    message: 'Pick your ad networks to build',
    limit: 12,
    choices: [
        { name: 'All', value: 'all' },
        { name: 'Unity Ads', value: 'unityads' },
        { name: 'IronSource', value: 'ironsource' },
        { name: 'Applovin', value: 'applovin' },
        { name: 'Mintegral', value: 'mintegral' },
        { name: 'Meta', value: 'meta' },
        { name: 'Google', value: 'google' },
        { name: 'Vungle', value: 'vungle' },
        { name: 'Ad Colony', value: 'adcolony' },
        { name: 'TikTok', value: 'tiktok' },
        { name: 'Kayzen', value: 'kayzen' },
        { name: 'Moloco', value: 'moloco' }
    ],
    result(names) {


        if (names.includes('All')) {
            return this.choices
                .filter(choice => choice.value !== 'all')
                .map(choice => choice.value);
        }
        return names.map(name => this.choices.find(choice => choice.name === name).value);
    }
});

prompt.run()
    .then(async (networks) => {
        console.log('Selected networks:', networks);

        if (networks.length === 0) {
            console.error('No networks selected. Exiting...');
            process.exit(1);
        }

        // Clean up previous builds
        if (fs.existsSync('ad-builds')) {
            fs.rmSync('ad-builds', { recursive: true, force: true });
        }

        try {
            for (const iteration of ITERATIONS) {
                for (const network of networks) {
                    await Promise.all([
                        buildNetwork(network, 'inline', iteration),
                        // buildNetwork(network, 'split', iteration)
                    ]);
                }
            }
            console.log('\n\x1b[1m\x1b[32m\nAll builds completed successfully!\x1b[0m');
        } catch (error) {
            console.error('Build process failed:', error);
            process.exit(1);
        }
    })
    .catch(console.error);
