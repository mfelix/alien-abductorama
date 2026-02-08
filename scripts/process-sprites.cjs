#!/usr/bin/env node
/**
 * Sprite Animation Processing Script
 *
 * Discovers animation frame folders in assets/, sorts frames numerically,
 * and generates a manifest for the game to load at runtime.
 *
 * Convention: Place sequentially numbered PNG files in a folder named after
 * the asset (e.g., assets/human/frame_001.png, assets/human/frame_002.png).
 * Any naming scheme works as long as files sort naturally by the numbers in
 * their filenames.
 *
 * Usage: node scripts/process-sprites.cjs
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const MANIFEST_PATH = path.join(ASSETS_DIR, 'sprites-manifest.json');

// Only consider PNG frames
const FRAME_EXTENSION = '.png';

function discoverAnimationFolders() {
    const entries = fs.readdirSync(ASSETS_DIR, { withFileTypes: true });
    const folders = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        // Skip non-sprite directories
        if (entry.name === 'sounds') continue;

        const folderPath = path.join(ASSETS_DIR, entry.name);
        const files = fs.readdirSync(folderPath);
        const frames = files.filter(f => path.extname(f).toLowerCase() === FRAME_EXTENSION);

        if (frames.length > 0) {
            folders.push({ name: entry.name, path: folderPath, frames });
        }
    }

    return folders;
}

function sortFrames(frames) {
    return frames.slice().sort((a, b) => {
        // Extract all numbers from filenames and compare by the last number
        // This handles: frame_001.png, 1.png, human_walk_01.png, etc.
        const numsA = a.match(/\d+/g);
        const numsB = b.match(/\d+/g);

        if (!numsA || !numsB) return a.localeCompare(b);

        const numA = parseInt(numsA[numsA.length - 1], 10);
        const numB = parseInt(numsB[numsB.length - 1], 10);
        return numA - numB;
    });
}

function main() {
    console.log('Sprite Animation Processing Script');
    console.log('===================================\n');

    const folders = discoverAnimationFolders();

    if (folders.length === 0) {
        console.log('No animation folders found in', ASSETS_DIR);
        console.log('Expected: assets/<name>/ containing numbered PNG files');
        // Write empty manifest so the game doesn't fail to fetch it
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify({}, null, 2));
        return;
    }

    const manifest = {};

    for (const folder of folders) {
        const sorted = sortFrames(folder.frames);
        manifest[folder.name] = sorted.map(f => `assets/${folder.name}/${f}`);
        console.log(`${folder.name}: ${sorted.length} frame(s)`);
        sorted.forEach((f, i) => console.log(`  [${i}] ${f}`));
    }

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`\nGenerated manifest: ${MANIFEST_PATH}`);
    console.log(JSON.stringify(manifest, null, 2));
}

main();
