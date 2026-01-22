# Alien Abducto-rama Admin CLI

Command-line tool for administering game data stored in Cloudflare KV.

## Prerequisites

- Node.js 18+
- Authenticated with Cloudflare (`wrangler login`)
- Access to the KV namespace

## Installation

```bash
cd tools/admin-cli
npm install
npm run build
npm link  # Makes 'alien-admin' available globally
```

## Usage

### Feedback Commands

```bash
# View public suggestions
alien-admin feedback list
alien-admin feedback list --sort upvotes
alien-admin feedback list --limit 20 --offset 40
alien-admin feedback list --search "multiplayer"
alien-admin feedback list --json
alien-admin feedback list --verbose  # Include voter IDs

# View moderation queue
alien-admin feedback queue
alien-admin feedback queue --json

# View rating statistics
alien-admin feedback stats

# Approve a suggestion (move from queue to public)
alien-admin feedback approve <id>
alien-admin feedback approve <id> --dry-run
alien-admin feedback approve <id> -y  # Skip confirmation

# Reject a suggestion (remove from queue)
alien-admin feedback reject <id>

# Delete a public suggestion
alien-admin feedback delete <id>
```

### Scores Commands

```bash
# View leaderboard
alien-admin scores list
alien-admin scores list --limit 50
alien-admin scores list --json

# View activity statistics
alien-admin scores stats

# Remove a cheater's score
alien-admin scores remove <id>
```

## Options

- `--dry-run`: Show what would happen without making changes
- `--json`: Output raw JSON for scripting
- `-y, --yes`: Skip confirmation prompts
- `--verbose`: Include additional details (e.g., voter IDs)
- `--limit <n>`: Limit number of results
- `--offset <n>`: Skip first N results (for pagination)

## Known Limitations

### No Atomic Operations

Cloudflare KV does not support transactions. Operations that modify data (approve, reject, delete, remove) perform read-modify-write sequences that can race with:

- Other admin CLI invocations
- Game traffic (score submissions, feedback, votes)

**Practical impact**: Low for typical usage. If two admins work simultaneously or a player submits feedback during moderation, one write may overwrite the other.

**Best practices**:
- Coordinate with other admins to avoid simultaneous moderation
- Use `--dry-run` to preview changes
- Review data after bulk operations

## Workflow Example

```bash
# Check what's in the moderation queue
alien-admin feedback queue

# Approve a good suggestion
alien-admin feedback approve 34165c1a-29a0-40ea-b77a-e13bb39af576

# Reject spam
alien-admin feedback reject abc123-spam-id

# Check the result
alien-admin feedback list
```

## Testing

```bash
npm run build
npm test  # Runs smoke tests
```
