---
name: shell-scripting
description: >
  Use this skill whenever someone asks to write, debug, or improve a POSIX sh, bash, or zsh script —
  whether it's a one-liner, a CI/CD pipeline, an SSH automation across multiple servers,
  or a full CLI tool. This skill triggers on: writing shell scripts from scratch, parsing
  command-line arguments (--input, --output, --verbose flags), handling errors and exit
  codes, processing files (CSV, log files, config files), using trap for cleanup on failure,
  creating timestamped backups, running commands in parallel across multiple hosts, and
  automating any CLI workflow. Also use when asking about shell concepts like here documents,
  process substitution, subshells, signal trapping, or how to safely handle whitespace/
  filenames with spaces. Explicitly DO NOT trigger for Python or Node.js CLI tools —
  those use cases belong in their own language ecosystems.
license: MIT
compatibility: Requires a POSIX-like Unix environment; examples are labeled for POSIX sh, Bash, or Zsh.
metadata:
  category: development
  author: tomkabel
  source:
    repository: https://github.com/tomkabel/brazen-bazaar
    path: skills/shell-scripting
    ref: 73fdf5af774dd40829f7f99b3751c752548c2e6e
---

# Shell Scripting

Shell scripting is the art of automating tasks through the Unix shell - combining
built-in commands, control flow, and process management to build reliable CLI tools
and automation workflows. This skill covers production-quality POSIX sh, Bash,
and Zsh scripting: robust error handling, portable argument parsing, safe file
operations, and the idioms that separate fragile one-liners from scripts that
hold up in production.

---

## When to use this skill

Trigger this skill when the user:
- Asks to write or review a POSIX `sh`, Bash, or Zsh script
- Needs to parse command-line arguments or flags
- Wants to automate a CLI workflow or task runner
- Asks about exit codes, signal trapping, or error handling in shell
- Needs to process files, lines, or streams from the terminal
- Asks about here documents, process substitution, or subshells
- Needs a script for a clearly identified shell target: POSIX `sh`, Bash, or Zsh

Do NOT trigger this skill for:
- Python or Node.js CLI tools (shell is the wrong tool for complex logic)
- Scripts that require structured data parsing at scale (use a real language instead)

---

## Choose the shell target first

Do not claim one snippet is portable if it uses shell-specific features. POSIX
`sh`, Bash, and Zsh overlap, but their strict modes, arrays, tests, traps, and
globbing differ enough that production examples must be labeled by target.

### POSIX `sh`

POSIX `sh` syntax avoids arrays, `[[ ]]`, `local`, process substitution, and
`pipefail`:

```sh
#!/bin/sh
set -eu

[ "$#" -eq 1 ] || {
  printf 'Usage: %s <file>\n' "$0" >&2
  exit 2
}

file=$1
if [ -f "$file" ]; then
  printf '%s\n' "$file exists"
fi
```

### Bash

Bash examples may use arrays, `[[ ]]`, `local`, process substitution, and
`pipefail`:

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

args=("$@")
if [[ ${#args[@]} -eq 0 ]]; then
  printf 'Usage: %s <file>...\n' "$0" >&2
  exit 2
fi
```

### Zsh

Zsh examples should use Zsh isolation and Zsh-native options:

```zsh
#!/usr/bin/env zsh
emulate -L zsh
setopt err_exit pipe_fail no_unset

typeset -a args
args=("$@")
if (( ${#args[@]} == 0 )); then
  print -u2 "Usage: $0 <file>..."
  exit 2
fi
```

---

## Key principles

1. **Use strict mode for the selected shell only** - Bash, Zsh, and POSIX `sh`
   have different option sets and failure semantics.

   Bash:

   ```bash
   set -Eeuo pipefail
   shopt -s inherit_errexit 2>/dev/null || true
   ```

   Zsh:

   ```zsh
   emulate -L zsh
   setopt err_exit pipe_fail no_unset
   ```

   POSIX `sh` has no `pipefail`. Use `set -eu`, and when pipeline status
   matters, split the pipeline so each stage can be checked:

   ```sh
   set -eu

   tmp=$(mktemp "${TMPDIR:-/tmp}/pipeline.XXXXXX") || exit 1
   trap 'rm -f "$tmp"' 0 HUP INT TERM

   if produce_rows >"$tmp"; then
     :
   else
     status=$?
     printf 'ERROR: produce_rows failed with exit code %s\n' "$status" >&2
     exit "$status"
   fi

   if sort_rows <"$tmp" >output.txt; then
     :
   else
     status=$?
     printf 'ERROR: sort_rows failed with exit code %s\n' "$status" >&2
     exit "$status"
   fi

   rm -f "$tmp"
   trap - 0 HUP INT TERM
   ```

2. **Quote everything** - Always double-quote variable expansions: `"$var"`, `"$@"`,
   `"${array[@]}"`. Unquoted variables break on whitespace and glob characters. The
   only exceptions are intentional word splitting and arithmetic contexts.

3. **Check dependencies upfront** - Verify required commands exist before the script
   runs. Fail fast at the top with a clear error, not halfway through a destructive
   operation.

4. **Use functions for reuse and readability** - Extract logic into named functions.
   Bash and Zsh functions support `local`; POSIX `sh` does not require it, so avoid
   `local` in POSIX examples. A `main()` function at the bottom is idiomatic for
   non-trivial Bash and Zsh scripts.

5. **Prefer the right built-ins for the target shell** - In Bash and Zsh, use `[[ ]]`
   over `[ ]` when you need pattern matching or safer conditionals. In POSIX `sh`, use
   `[ ]`. Prefer `${var##*/}` over `basename` and `${#str}` over `wc -c` when the
   syntax is supported. Use `printf` over `echo` for reliable output formatting.

---

## Core concepts

**Exit codes** - Every command returns an integer 0-255. `0` means success; any
non-zero value means failure. Use `$?` to read the last exit code. Use explicit
`exit N` to return meaningful codes from scripts. The `||` and `&&` operators
branch on exit code.

**File descriptors** - `0` = stdin, `1` = stdout, `2` = stderr. Redirect stderr
with `2>file` or merge it into stdout with `2>&1`. Use `>&2` to write errors to
stderr so they don't pollute captured output.

**Subshells** - Parentheses `(cmd)` run commands in a child process. Changes to
variables, `cd`, or `set` inside a subshell do not affect the parent. Command
substitution `$(cmd)` also runs in a subshell and captures its stdout.

**Variable scoping** - All variables are global by default. Bash and Zsh support
`local` inside functions to limit scope; POSIX `sh` does not require `local`, so
avoid it in portable scripts. In Bash, `declare -r` creates read-only variables,
`declare -a` declares arrays, and `declare -A` declares associative arrays
(bash 4+).

**IFS (Internal Field Separator)** - Controls how bash splits words and lines.
Default is space/tab/newline. When reading files line by line, set `IFS=` to
prevent trimming of leading/trailing whitespace: `while IFS= read -r line`.

---

## Common tasks

### Robust Bash script template with trap cleanup

Every production Bash script should separate `EXIT` cleanup from signal handling.
Signal handlers should clean up, restore the default handler, and re-raise the
signal so supervisors and callers see the expected signal-derived status.

```bash
#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit 2>/dev/null || true

# --- constants ---
resolve_bash_script_path() {
  local source=${BASH_SOURCE[0]}
  local dir link

  while [ -L "$source" ]; do
    dir=$(cd -P "$(dirname "$source")" >/dev/null 2>&1 && pwd -P) || return 1
    link=$(readlink "$source") || return 1
    if [[ $link == /* ]]; then
      source=$link
    else
      source=$dir/$link
    fi
  done

  dir=$(cd -P "$(dirname "$source")" >/dev/null 2>&1 && pwd -P) || return 1
  printf '%s/%s\n' "$dir" "$(basename "$source")"
}

SCRIPT_NAME=$(basename "$0")
SCRIPT_PATH=$(resolve_bash_script_path) || exit 1
SCRIPT_DIR=${SCRIPT_PATH%/*}
TMP_DIR=$(mktemp -d) || exit 1
cleanup_done=0

# --- cleanup ---
cleanup_resources() {
  if (( cleanup_done )); then
    return 0
  fi
  cleanup_done=1
  rm -rf "$TMP_DIR"
}

on_exit() {
  local exit_code=$?
  trap - EXIT
  cleanup_resources
  if (( exit_code != 0 )); then
    printf 'ERROR: %s failed with exit code %s\n' "$SCRIPT_NAME" "$exit_code" >&2
  fi
  exit "$exit_code"
}

on_signal() {
  local signal_name=$1
  local signal_number=$2
  trap - EXIT "$signal_name"
  cleanup_resources
  trap - "$signal_name"
  kill -s "$signal_name" "$$" 2>/dev/null || exit $((128 + signal_number))
  exit $((128 + signal_number))
}

trap on_exit EXIT
trap 'on_signal INT 2' INT
trap 'on_signal TERM 15' TERM

# --- dependency check ---
require_cmd() {
  if ! command -v "$1" &>/dev/null; then
    printf "ERROR: required command '%s' not found\n" "$1" >&2
    exit 1
  fi
}
require_cmd curl
require_cmd jq

# --- main logic ---
main() {
  printf 'Running %s from %s\n' "$SCRIPT_NAME" "$SCRIPT_DIR"
  # ... your logic here
}

main "$@"
```

The `EXIT` trap handles normal success and failure. `INT` and `TERM` handlers
clean up exactly once, then re-raise the signal so metrics preserve statuses such
as `130` for `INT` and `143` for `TERM`. `BASH_SOURCE[0]` identifies the Bash
source file path, but it does not resolve a symlink chain by itself; the
`readlink` loop plus `cd -P` traces symlinks to the physical script path.

### Preventing "tar bomb" when archiving directories

If your script archives a directory that may contain the output file itself (e.g.,
backing up the current directory into it), use `--exclude` to prevent tar from
attempting to archive its own output:

```bash
restore_trap() {
  local saved=$1 signal=$2
  if [[ -n $saved ]]; then
    eval "$saved"
  else
    trap - "$signal"
  fi
}

create_backup() {
  local source="$1"
  local output_dir="$2"
  local timestamp tarball base_name dir_name status
  local old_err old_int old_term

  timestamp="$(date '+%Y%m%d_%H%M%S')"
  base_name="$(basename "$source")"
  dir_name="$(dirname "$source")"

  # Clean up potential trailing slashes and avoid double slashes
  tarball="${output_dir%/}/${base_name}_${timestamp}.tar.gz"

  old_err=$(trap -p ERR || true)
  old_int=$(trap -p INT || true)
  old_term=$(trap -p TERM || true)

  restore_backup_traps() {
    restore_trap "$old_err" ERR
    restore_trap "$old_int" INT
    restore_trap "$old_term" TERM
  }

  cleanup_partial_backup() {
    rm -f "$tarball"
    restore_backup_traps
  }

  backup_signal() {
    local signal_name=$1 signal_number=$2
    cleanup_partial_backup
    kill -s "$signal_name" "$$" 2>/dev/null || exit $((128 + signal_number))
    exit $((128 + signal_number))
  }

  # Trap in case of interrupt/failure, while preserving the caller's traps.
  trap 'cleanup_partial_backup' ERR
  trap 'backup_signal INT 2' INT
  trap 'backup_signal TERM 15' TERM

  # --exclude prevents "tar bomb" if output dir == source dir
  # >&2 redirects tar stdout to stderr to protect the return value
  status=0
  tar -czf "$tarball" --exclude="$(basename "$tarball")" \
    -C "$dir_name" "$base_name" >&2 || status=$?

  if (( status != 0 )); then
    cleanup_partial_backup
    return "$status"
  fi

  restore_backup_traps
  printf '%s\n' "$tarball"
}
```

Also consider using `realpath` to convert paths to absolute form early in `main`,
which prevents edge cases with relative paths and trailing slashes:

```bash
if command -v realpath &>/dev/null; then
  SOURCE_DIR="$(realpath "$SOURCE_DIR")"
  OUTPUT_DIR="$(realpath "$OUTPUT_DIR")"
fi
```

### Argument parsing with getopts and long opts

Use `getopts` for POSIX-portable short flags. For long options, use a `while/case`
loop with manual shift:

```bash
usage() {
  cat >&2 <<EOF
Usage: $SCRIPT_NAME [OPTIONS] <input>

Options:
  -o, --output <dir>   Output directory (default: ./out)
  -v, --verbose        Enable verbose logging
  -h, --help           Show this help
EOF
  exit "${1:-0}"
}

OUTPUT_DIR="./out"
VERBOSE=false

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -o|--output)
        [[ -n "${2-}" ]] || { echo "ERROR: --output requires a value" >&2; usage 1; }
        OUTPUT_DIR="$2"; shift 2 ;;
      -v|--verbose)
        VERBOSE=true; shift ;;
      -h|--help)
        usage 0 ;;
      --)
        shift; break ;;
      -*)
        echo "ERROR: unknown option '$1'" >&2; usage 1 ;;
      *)
        break ;;
    esac
  done

  INPUT_FILE="${1-}"
  [[ -n "$INPUT_FILE" ]] || { echo "ERROR: input file required" >&2; usage 1; }
  shift

  if [[ $# -gt 0 ]]; then
    echo "ERROR: unexpected argument(s): $*" >&2
    usage 1
  fi
}

parse_args "$@"
```

### File processing - read, write, and temp files safely

```bash
# Read a file line by line without trimming whitespace or interpreting backslashes
while IFS= read -r line; do
  echo "Processing: $line"
done < "$input_file"

# Read into an array
mapfile -t lines < "$input_file"   # bash 4+; equivalent: readarray -t lines

# Write to a file atomically. The temp file must be in the same directory as
# the destination so the final mv is an atomic rename on one filesystem.
stat_mode() {
  stat -c '%a' "$1" 2>/dev/null || stat -f '%Lp' "$1"
}

stat_owner() {
  stat -c '%u:%g' "$1" 2>/dev/null || stat -f '%u:%g' "$1"
}

fsync_path() {
  local path=$1
  if command -v fsync >/dev/null 2>&1 && fsync "$path" >/dev/null 2>&1; then
    return 0
  fi
  if sync -f "$path" >/dev/null 2>&1; then
    return 0
  fi
  sync
}

restore_trap() {
  local saved=$1 signal=$2
  if [[ -n $saved ]]; then
    eval "$saved"
  else
    trap - "$signal"
  fi
}

write_atomic() {
  local target=$1
  local dir base tmp mode owner tmp_owner status
  local old_int old_term old_hup

  dir=$(dirname "$target") || return 1
  base=$(basename "$target") || return 1
  [[ -d $dir ]] || { printf 'ERROR: target directory does not exist: %s\n' "$dir" >&2; return 1; }

  tmp=$(mktemp "${dir}/.${base}.tmp.XXXXXX") || return 1
  old_int=$(trap -p INT || true)
  old_term=$(trap -p TERM || true)
  old_hup=$(trap -p HUP || true)

  cleanup_tmp() {
    [[ -n ${tmp:-} && -e $tmp ]] && rm -f "$tmp"
  }

  restore_write_traps() {
    restore_trap "$old_int" INT
    restore_trap "$old_term" TERM
    restore_trap "$old_hup" HUP
  }

  on_write_signal() {
    local signal_name=$1 signal_number=$2
    cleanup_tmp
    restore_write_traps
    kill -s "$signal_name" "$$" 2>/dev/null || exit $((128 + signal_number))
    exit $((128 + signal_number))
  }

  trap 'on_write_signal INT 2' INT
  trap 'on_write_signal TERM 15' TERM
  trap 'on_write_signal HUP 1' HUP

  status=0
  cat >"$tmp" || status=$?
  if (( status != 0 )); then
    cleanup_tmp
    restore_write_traps
    return "$status"
  fi

  if [[ -e $target ]]; then
    if ! chown --reference="$target" "$tmp" 2>/dev/null; then
      owner=$(stat_owner "$target") || { cleanup_tmp; restore_write_traps; return 1; }
      tmp_owner=$(stat_owner "$tmp") || { cleanup_tmp; restore_write_traps; return 1; }
      if [[ $owner != "$tmp_owner" ]]; then
        chown "$owner" "$tmp" || { cleanup_tmp; restore_write_traps; return 1; }
      fi
    fi

    if ! chmod --reference="$target" "$tmp" 2>/dev/null; then
      mode=$(stat_mode "$target") || { cleanup_tmp; restore_write_traps; return 1; }
      chmod "$mode" "$tmp" || { cleanup_tmp; restore_write_traps; return 1; }
    fi
  fi

  fsync_path "$tmp" || { cleanup_tmp; restore_write_traps; return 1; }
  mv -f "$tmp" "$target" || { status=$?; cleanup_tmp; restore_write_traps; return "$status"; }
  tmp=
  fsync_path "$dir" || { restore_write_traps; return 1; }
  restore_write_traps
}
printf 'final content\n' | write_atomic "/etc/myapp/config"

# Safe temp file with auto-cleanup from inside a function.
process_with_tempfile() {
  local tmpfile
  tmpfile="$(mktemp "$TMP_DIR/work.XXXXXX")" || return 1
  some_command >"$tmpfile"
  process_result "$tmpfile"
}
```

### String manipulation without external tools

```bash
# Substring extraction: ${var:offset:length}
str="hello world"
echo "${str:6:5}"        # "world"

# Pattern removal (greedy ##, non-greedy #; greedy %%, non-greedy %)
path="/usr/local/bin/myapp"
echo "${path##*/}"       # "myapp"     (strip longest prefix up to /)
echo "${path%/*}"        # "/usr/local/bin" (strip shortest suffix from /)

# Search and replace
filename="report-2024.csv"
echo "${filename/csv/tsv}"   # "report-2024.tsv"   (first match)
echo "${filename//a/A}"      # "report-2024.csv" -> "report-2024.csv" (all matches)

# Case conversion (bash 4+)
lower="${str,,}"         # all lowercase
upper="${str^^}"         # all uppercase
title="${str^}"          # capitalise first character

# String length and emptiness checks
[[ -z "$var" ]] && echo "empty"
[[ -n "$var" ]] && echo "non-empty"
echo "length: ${#str}"

# Check if string starts/ends with a pattern (no grep needed)
[[ "$str" == hello* ]] && echo "starts with hello"
[[ "$str" == *world ]] && echo "ends with world"
```

### Parallel execution with xargs and GNU parallel

```bash
# xargs: run up to 4 jobs in parallel, one arg per job
find . -name "*.log" -print0 \
  | xargs -0 -P4 -I{} gzip "{}"

# xargs with a shell function (must export it first)
process_file() {
  local f="$1"
  echo "Processing $f"
  # ... work ...
}
export -f process_file
find . -name "*.csv" -print0 \
  | xargs -0 -P"$(nproc)" -I{} bash -c 'process_file "$@"' _ {}

# GNU parallel (more features: progress, retry, result collection)
# parallel --jobs 4 --bar gzip ::: *.log
# parallel -j4 --results /tmp/out/ ./process.sh ::: file1 file2 file3

# Manual background jobs with wait
pids=()
for host in "${hosts[@]}"; do
  ssh "$host" uptime &
  pids+=($!)
done
for pid in "${pids[@]}"; do
  wait "$pid" || echo "WARN: job $pid failed" >&2
done
```

### POSIX-compatible building blocks

Use this style only when the script target is POSIX `sh`. Bash and Zsh features
such as arrays, `[[ ]]`, `local`, process substitution, and `pipefail` are not
portable to POSIX `sh`.

```sh
# Diagnostic shell detection. Prefer a clear shebang over runtime guessing.
detect_shell() {
  if [ -n "${BASH_VERSION-}" ]; then
    printf 'bash %s\n' "$BASH_VERSION"
  elif [ -n "${ZSH_VERSION-}" ]; then
    printf 'zsh %s\n' "$ZSH_VERSION"
  else
    printf '%s\n' "sh (POSIX)"
  fi
}

# POSIX-safe array alternative (use positional parameters)
set -- alpha beta gamma
for item do
  printf '%s\n' "$item"
done

# Use $(...) not backticks - both portable, but $() is nestable
result=$(printf '%s - %s\n' "$(date)" "$(whoami)")

# Avoid bashisms when targeting /bin/sh:
#   [[ condition ]]       -> [ condition ]
#   arrays                -> positional parameters or delimited strings
#   local name=value      -> plain assignments, or use Bash/Zsh instead
#   set -o pipefail       -> check each stage manually
#   echo -e               -> printf

printf '%s\n' "Safe output with no echo flag issues"
```

### Interactive prompts and colored output

```bash
# Color constants (no-op when not a terminal)
setup_colors() {
  if [[ -t 1 ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
    BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'
  else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; RESET=''
  fi
}
setup_colors

log_info()    { printf "${GREEN}[INFO]${RESET}  %s\n" "$*"; }
log_warn()    { printf "${YELLOW}[WARN]${RESET}  %s\n" "$*" >&2; }
log_error()   { printf "${RED}[ERROR]${RESET} %s\n" "$*" >&2; }

# Yes/no prompt
confirm() {
  local prompt="${1:-Continue?} [y/N] "
  local reply
  read -r -p "$prompt" reply
  [[ "${reply,,}" == y || "${reply,,}" == yes ]]
}

# Prompt with default value
prompt_with_default() {
  local prompt="$1" default="$2" value
  read -r -p "$prompt [$default]: " value
  echo "${value:-$default}"
}

# Spinner for long operations
spin() {
  local pid=$1 msg="${2:-Working...}"
  local frames=('|' '/' '-' '\')
  local i=0
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r%s %s" "${frames[i++ % 4]}" "$msg"
    sleep 0.1
  done
  printf "\r\033[K"  # clear the spinner line
}
```

---

## Gotchas

1. **`set -e` swallows non-zero exits in conditionals** - `set -e` does NOT exit on non-zero returns inside `if`, `while`, `until`, or `||`/`&&` chains. A command like `if some_command; then` will not trigger `-e` if `some_command` fails - this is correct behavior but surprises people who expect `-e` to be a global safety net.

2. **`local` does not isolate errors from `set -e`** - `local var=$(command_that_fails)` always returns exit code 0 because `local` itself succeeds. The subcommand failure is silently swallowed. Declare `local var` on one line, then `var=$(command_that_fails)` on the next so `set -e` can catch it.

3. **`mktemp` without `-d` creates a file, not a directory** - `TMP=$(mktemp)` creates a temp file. If you then try `mkdir "$TMP/subdir"` it fails. Use `mktemp -d` when you need a temp directory.

4. **Do not use the same handler for `EXIT` and signals** - A shared `trap cleanup EXIT INT TERM` can run cleanup twice and can turn a signal into a misleading status. Keep `EXIT` cleanup separate from signal handlers, and have signal handlers re-raise the signal or exit with `128 + signal_number`.

5. **Word splitting on array expansion without `[@]`** - `"${arr[*]}"` expands the array as a single word joined by `IFS`; `"${arr[@]}"` expands each element as a separate word. Using `*` instead of `@` when passing arrays to functions causes multi-word elements to silently merge.

6. **Command substitution captures stdout, not stderr** - When you call a function via `$(func)` and that function runs `tar -czf`, any stdout from `tar` pollutes your return value. Redirect command stdout to stderr within functions that return data: `tar -czf "$tarball" ... >&2`

---

## Anti-patterns

| Anti-pattern | Why it's wrong | What to do instead |
|---|---|---|
| Missing target-appropriate error handling | Errors in pipelines and unset variables can be silently ignored, causing downstream data corruption | Use Bash `set -Eeuo pipefail`, Zsh `setopt err_exit pipe_fail no_unset`, or POSIX `sh` `set -eu` with manual pipeline checks |
| Unquoted variable: `rm -rf $dir` | If `$dir` is empty or contains spaces, the command destroys unintended paths | Always quote: `rm -rf "$dir"` |
| Parsing `ls` output | `ls` output is designed for humans; filenames with spaces or newlines break word splitting | Use `find ... -print0 \| xargs -0` or a `for f in ./*` glob |
| Using `cat file \| grep` (useless cat) | Spawns an extra process for no reason | Use input redirection: `grep pattern file` |
| `if [ $? -eq 0 ]` | Testing `$?` after the fact is fragile - any intervening command resets it | Test the command directly: `if some_command; then ...` |
| Heredoc with leading whitespace | Indented heredoc content with `<<EOF` includes the indentation literally | Use `<<-EOF` to strip leading tabs (not spaces), or use `printf` |

---

## References

For detailed reference content, see:

- `references/bash-cheatsheet.md` - Quick reference for bash built-ins, parameter
  expansion, test operators, and special variables
- `references/zsh-cheatsheet.md` - Quick reference for zsh-specific features
  including glob qualifiers, expansion modifiers (`:t`, `:h`, `:r`, `:e`),
  native floating point, and the `emulate -L zsh` script isolation pattern

When writing zsh scripts, always load `references/zsh-cheatsheet.md` for the most
accurate guidance. Zsh has significant differences from Bash in array indexing
(1-based vs 0-based), variable quoting (no forced word splitting by default),
file path modifiers, and powerful glob qualifiers.

---

## Zsh vs Bash: Key Differences

If you receive a prompt to write a zsh script (or if `ZSH_VERSION` is set), prioritize
these differences over Bash patterns:

| Feature | Bash | Zsh |
|---|---|---|
| Array indexing | 0-based: `${arr[0]}` | 1-based: `${arr[1]}` |
| Case modification | `${var,,}`, `${var^^}` (Bash 4+) | `${var:l}`, `${var:u}` |
| Filename modifiers | `${path##*/}`, `${path%/*}` | `${path:t}`, `${path:h}`, `${path:r}`, `${path:e}` |
| Quoting variables | MUST quote: `"$var"` | Quoting optional (no auto word-split) |
| Floating point | Requires `awk` or `bc` | Native via `typeset -F` |
| Script isolation | N/A | `emulate -L zsh` locks down environment |
| Script path | `${BASH_SOURCE[0]}` | `${${(%):-%x}:A:h}` |
| MULTIOS | Not supported | `cmd > f1 > f2` writes to multiple files |
| Glob qualifiers | Basic `**` glob | `*(.)` files, `*(/)` dirs, `*(m-1)` modified |

Zsh also has glob qualifiers for filtering (`*(.)` for files only, `*(/)` for
directories, `*(m-1)` for modified in last day) and sorting (`*(om)` newest first).
See `references/zsh-cheatsheet.md` for the full reference.
