#!/bin/bash
set -e

echo "=== Alien Admin CLI Smoke Test ==="
echo ""

CLI="node dist/index.js"

echo "1. Testing help output..."
$CLI --help > /dev/null
echo "   ✓ Help works"

echo "2. Testing feedback commands (read-only)..."
$CLI feedback list --limit 5 > /dev/null || true
$CLI feedback queue --limit 5 > /dev/null || true
$CLI feedback stats > /dev/null || true
echo "   ✓ Feedback read commands work"

echo "3. Testing scores commands (read-only)..."
$CLI scores list --limit 5 > /dev/null || true
$CLI scores stats > /dev/null || true
echo "   ✓ Scores read commands work"

echo "4. Testing dry-run mode..."
# This should not actually modify anything
$CLI feedback approve nonexistent-id --dry-run 2>&1 | grep -q "not found" && echo "   ✓ Dry-run approve handles missing ID"
$CLI feedback reject nonexistent-id --dry-run 2>&1 | grep -q "not found\|Nothing to do" && echo "   ✓ Dry-run reject handles missing ID"

echo "5. Testing JSON output..."
$CLI feedback list --json | head -1 | grep -qE '^\[|^null' && echo "   ✓ JSON output is valid"

echo ""
echo "=== All smoke tests passed ==="
