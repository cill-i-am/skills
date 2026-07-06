---
name: anti-sleep
description: Keep a macOS machine awake with caffeinate during long builds, agent runs, downloads, uploads, meetings, or overnight work. Use when the user says keep my Mac awake, prevent sleep, caffeinate, anti-sleep, keep screen on, or keep this running.
---

# Anti Sleep

Use macOS `caffeinate` to prevent sleep for a bounded duration or while a
process runs.

## Defaults

Use display plus idle sleep prevention unless the user asks otherwise:

```sh
caffeinate -d -i -t 7200
```

Common durations:

- 2 hours: `7200`
- 4 hours: `14400`
- 8 hours: `28800`
- 9 hours: `32400`

## Modes

| Command | Use |
|---|---|
| `caffeinate -i -t <seconds>` | prevent idle system sleep |
| `caffeinate -d -i -t <seconds>` | keep display on and prevent idle sleep |
| `caffeinate -d -i -w <PID>` | stay awake until a process exits |
| `caffeinate -i <command>` | run a command while preventing idle sleep |
| `caffeinate -u -t 1` | briefly wake the display |

## Running It

Prefer a visible terminal or background process that the user can stop. Do not
block the agent's only active shell unless the user asked for an attached
process.

Verify:

```sh
pgrep -fl caffeinate
pmset -g assertions | grep -i caffeinate
```

Stop:

```sh
pkill -f "caffeinate"
```

## Report

After starting, tell the user:

- PID
- flags
- duration or watched process
- expected expiry time
- how to stop it

Completion criterion: `caffeinate` is running with the intended flags, or the
response explains why it was not started.
