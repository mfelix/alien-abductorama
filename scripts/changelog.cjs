const fs = require('fs');
const { execSync } = require('child_process');

const CHANGELOG_FILE = 'changelog.json';
const OUTPUT_FILE = 'js/changelog.js';
const MAX_ENTRIES = 5;
const MAX_MESSAGE_LENGTH = 80;

function truncate(msg) {
    if (msg.length <= MAX_MESSAGE_LENGTH) return msg;
    return msg.slice(0, MAX_MESSAGE_LENGTH - 3) + '...';
}

function loadChangelog() {
    if (fs.existsSync(CHANGELOG_FILE)) {
        return JSON.parse(fs.readFileSync(CHANGELOG_FILE, 'utf8'));
    }
    return [];
}

function saveChangelog(entries) {
    fs.writeFileSync(CHANGELOG_FILE, JSON.stringify(entries, null, 2));
}

function writeOutput(entries) {
    const content = `// Auto-generated changelog - do not edit manually
const CHANGELOG = ${JSON.stringify(entries, null, 2)};
`;
    fs.writeFileSync(OUTPUT_FILE, content);
}

const command = process.argv[2];

if (command === 'add') {
    // Manual add: node scripts/changelog.js add "Message here"
    const message = process.argv[3];
    if (!message) {
        console.log('Usage: node scripts/changelog.js add "Your message"');
        process.exit(1);
    }

    const entries = loadChangelog();
    entries.unshift({
        message: truncate(message),
        timestamp: Date.now()
    });

    const trimmed = entries.slice(0, MAX_ENTRIES);
    saveChangelog(trimmed);
    writeOutput(trimmed);
    console.log(`Added: "${truncate(message)}"`);

} else if (command === 'from-git') {
    // Auto from git: node scripts/changelog.js from-git
    const entries = loadChangelog();

    try {
        const gitMessage = execSync('git log -1 --format="%s"', { encoding: 'utf8' }).trim();
        const gitTimestamp = parseInt(execSync('git log -1 --format="%ct"', { encoding: 'utf8' }).trim()) * 1000;

        // Skip if same as current top entry (prevents duplicates on rebuild)
        if (entries.length > 0 && entries[0].message === truncate(gitMessage)) {
            console.log('Changelog already up to date');
            writeOutput(entries);
            process.exit(0);
        }

        // Skip common non-user-facing commits
        const skipPatterns = [
            /^merge/i,
            /^wip/i,
            /^fixup/i,
            /^squash/i,
            /^revert/i,
            /^chore/i,
            /^docs:/i,
            /^ci:/i,
            /^test:/i
        ];

        if (skipPatterns.some(pattern => pattern.test(gitMessage))) {
            console.log(`Skipping non-user-facing commit: "${gitMessage}"`);
            writeOutput(entries);
            process.exit(0);
        }

        entries.unshift({
            message: truncate(gitMessage),
            timestamp: gitTimestamp
        });

        const trimmed = entries.slice(0, MAX_ENTRIES);
        saveChangelog(trimmed);
        writeOutput(trimmed);
        console.log(`Added from git: "${truncate(gitMessage)}"`);

    } catch (err) {
        console.log('Could not read git commit, using existing changelog');
        writeOutput(entries);
    }

} else {
    // Just regenerate output from existing changelog.json
    const entries = loadChangelog();
    writeOutput(entries);
    console.log('Regenerated js/changelog.js');
}
