#!/usr/bin/env node
/**
 * Sound Processing Script
 *
 * Discovers sound files in assets/sounds/, converts them to MP3 with
 * normalized volume, and generates a manifest for the game to use.
 *
 * Naming convention: TARGET_TYPE + NUMBER (e.g., COW1.aif, HUMAN2.aif)
 *
 * Usage: node scripts/process-sounds.cjs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '..', 'assets', 'sounds');
const OUTPUT_DIR = path.join(SOUNDS_DIR, 'processed');
const MANIFEST_PATH = path.join(SOUNDS_DIR, 'manifest.json');

// Target volume level for normalization (in dB, negative values are quieter)
// -12dB is a good level for sound effects - audible but not jarring
const TARGET_LOUDNESS = -16;  // LUFS target for integrated loudness
const TARGET_PEAK = -1;       // True peak limit in dB

// Supported input formats
const INPUT_EXTENSIONS = ['.aif', '.aiff', '.wav', '.mp3', '.m4a', '.ogg', '.flac'];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function checkFfmpeg() {
    try {
        execSync('ffmpeg -version', { stdio: 'pipe' });
        return true;
    } catch {
        console.error('Error: ffmpeg is not installed or not in PATH');
        console.error('Install with: brew install ffmpeg');
        process.exit(1);
    }
}

function discoverSoundFiles() {
    const files = fs.readdirSync(SOUNDS_DIR);
    return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return INPUT_EXTENSIONS.includes(ext);
    });
}

function parseFileName(filename) {
    // Extract target type and number from filename
    // Examples: COW1.aif -> { type: 'cow', number: 1 }
    //           HUMAN2.aif -> { type: 'human', number: 2 }
    const name = path.basename(filename, path.extname(filename));
    const match = name.match(/^([A-Za-z]+)(\d+)$/);

    if (!match) {
        console.warn(`Warning: Could not parse filename "${filename}", skipping`);
        return null;
    }

    return {
        type: match[1].toLowerCase(),
        number: parseInt(match[2], 10),
        originalName: name
    };
}

function processSound(inputFile) {
    const inputPath = path.join(SOUNDS_DIR, inputFile);
    const parsed = parseFileName(inputFile);

    if (!parsed) return null;

    const outputFilename = `${parsed.type}${parsed.number}.mp3`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    console.log(`Processing: ${inputFile} -> ${outputFilename}`);

    // Use ffmpeg with loudnorm filter for EBU R128 loudness normalization
    // This is a two-pass process for best results, but single-pass is good enough for SFX
    const ffmpegCmd = [
        'ffmpeg',
        '-y',                    // Overwrite output
        '-i', `"${inputPath}"`,  // Input file
        '-af', `loudnorm=I=${TARGET_LOUDNESS}:TP=${TARGET_PEAK}:LRA=11`,  // Normalize loudness
        '-ar', '44100',          // Sample rate
        '-ac', '1',              // Mono (smaller files, fine for SFX)
        '-b:a', '128k',          // Bitrate
        `"${outputPath}"`
    ].join(' ');

    try {
        execSync(ffmpegCmd, { stdio: 'pipe' });
        return {
            type: parsed.type,
            number: parsed.number,
            file: `assets/sounds/processed/${outputFilename}`
        };
    } catch (error) {
        console.error(`Error processing ${inputFile}:`, error.message);
        return null;
    }
}

function generateManifest(processedFiles) {
    // Group by target type
    const manifest = {};

    for (const file of processedFiles) {
        if (!file) continue;

        if (!manifest[file.type]) {
            manifest[file.type] = [];
        }
        manifest[file.type].push(file.file);
    }

    // Sort each array by the number in the filename for consistency
    for (const type of Object.keys(manifest)) {
        manifest[type].sort();
    }

    return manifest;
}

function main() {
    console.log('Sound Processing Script');
    console.log('=======================\n');

    checkFfmpeg();
    ensureDir(OUTPUT_DIR);

    const soundFiles = discoverSoundFiles();

    if (soundFiles.length === 0) {
        console.log('No sound files found in', SOUNDS_DIR);
        console.log('Expected files like: COW1.aif, HUMAN2.wav, etc.');
        process.exit(0);
    }

    console.log(`Found ${soundFiles.length} sound file(s):\n`);

    const processedFiles = soundFiles.map(file => processSound(file));
    const successCount = processedFiles.filter(f => f !== null).length;

    console.log(`\nProcessed ${successCount}/${soundFiles.length} files successfully\n`);

    const manifest = generateManifest(processedFiles);

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log('Generated manifest:', MANIFEST_PATH);
    console.log('\nManifest contents:');
    console.log(JSON.stringify(manifest, null, 2));
}

main();
