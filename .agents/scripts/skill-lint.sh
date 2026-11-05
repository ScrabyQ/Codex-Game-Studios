#!/usr/bin/env bash
# Native structural observations; source-specific Claude analytics are not implemented.
# Supports --root DIR.
HERE="$(cd "$(dirname "$0")" && pwd)"
exec node "$HERE/../../scripts/codex/native-helper-check.mjs" skill "$@"
