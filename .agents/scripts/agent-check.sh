#!/usr/bin/env bash
# Native structural observations; source-specific Claude analytics are not implemented.
# Supports --root DIR.
HERE="$(cd "$(dirname "$0")" && pwd)"
script="$HERE/../../scripts/codex/native-helper-check.mjs"
args=()
case "$(uname -s 2>/dev/null)" in
  MINGW*|MSYS*|CYGWIN*)
    command -v cygpath >/dev/null 2>&1 || { echo "agent-check: cygpath is required for native Node paths" >&2; exit 1; }
    script=$(cygpath -w "$script") || exit 1
    while [ "$#" -gt 0 ]; do
      if [ "$1" = --root ] && [ "$#" -gt 1 ]; then
        args+=("$1"); shift
        case "$1" in /*) converted=$(cygpath -w "$1") || exit 1; args+=("$converted") ;; *) args+=("$1") ;; esac
      else args+=("$1"); fi
      shift
    done ;;
  *) args=("$@") ;;
esac
exec node "$script" role "${args[@]}"
