---
name: anti-sleep
description: Keep a macOS laptop awake with Amphetamine and Computer Use during long builds, agent runs, downloads, uploads, meetings, or overnight work. Use when the user says keep my Mac awake, prevent sleep, Amphetamine, anti-sleep, keep screen on, or keep this running.
---

# Anti Sleep

Use the macOS Amphetamine app to prevent sleep for a bounded duration. Prefer
controlling Amphetamine through Computer Use so the visible app state matches
what the user sees. Only use `caffeinate` if the user explicitly asks for that
fallback.

Use terminal commands only for availability checks, launching the app, and
verifying macOS power assertions. Do not rely on fixed screen coordinates; read
the UI and choose the equivalent visible Amphetamine command.

## Defaults

Use display plus idle sleep prevention unless the user asks otherwise. Default
to a bounded 2-hour Amphetamine session.

Common durations:

- 2 hours: default
- 4 hours: long build or download
- 8 hours: workday
- 9 hours: overnight
- indefinite: only when the user explicitly asks

## Primary Path: Amphetamine With Computer Use

When the task requires operating Amphetamine, use the Computer Use skill/tool to
interact with the app UI:

1. Check whether Amphetamine is installed:
   ```sh
   mdfind 'kMDItemFSName == "Amphetamine.app"'
   ```
2. Launch it if needed:
   ```sh
   open -a Amphetamine
   ```
3. Use Computer Use to read the screen and operate Amphetamine:
   - open the Amphetamine menu bar item or app window;
   - choose the command to start a new session;
   - choose a duration matching the user's request;
   - disable display sleep / keep the display awake unless the user says the
     display may sleep;
   - avoid indefinite sessions unless explicitly requested.
4. Verify the session through visible UI state and terminal assertions.

Menu labels vary by Amphetamine version. Prefer the visible option that clearly
means "start session", "keep awake", "duration", or "display sleep allowed"
rather than assuming exact labels.

## Running It

Prefer a bounded Amphetamine session. Do not start an indefinite session unless
the user asked for it. Computer Use actions that change local app settings are
allowed for this purpose because the user explicitly asked to keep the laptop
awake. If Amphetamine asks for macOS automation, accessibility, or notification
permissions, stop and ask the user to approve the prompt.

Verify:

```sh
pmset -g assertions | grep -i -E 'Amphetamine|PreventUserIdle|NoDisplaySleep'
```

Also use Computer Use to confirm Amphetamine shows an active session and the
expected duration or end time.

Stop with Computer Use:

- open the Amphetamine menu bar item or app window;
- choose the visible command to end or stop the current session.

If the user explicitly asks for a terminal fallback, use `caffeinate`:

```sh
caffeinate -d -i -t 7200
```

## Report

After starting, tell the user:

- Amphetamine session state
- duration
- expected expiry time
- whether display sleep is prevented
- how to stop it

Completion criterion: Amphetamine reports an active session with the intended
duration/display-sleep behavior, macOS power assertions are consistent with an
awake session, or the response explains why it was not started.
