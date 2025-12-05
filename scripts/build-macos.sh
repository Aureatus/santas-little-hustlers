#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
OUTPUT="$DIST_DIR/elf_economy_mac"

mkdir -p "$DIST_DIR"

bun build "$ROOT_DIR/src/main.ts" --compile --outfile "$OUTPUT"

chmod +x "$OUTPUT"

echo "macOS executable built at $OUTPUT"
