---
name: youtube-transcript
description: Fetch, extract, clean, or save the transcript or captions for a YouTube video. Use when the user asks for a YouTube transcript, captions, subtitles, video text, summary from transcript, or wants a video turned into a local text artifact.
---

# YouTube Transcript

Fetch a YouTube transcript and save a clean local text file before summarizing or
analyzing it. Prefer captions/transcripts over downloading audio.

## Output Location

- If the user is working in a project, save the transcript in the current repo
  or a user-specified path.
- Otherwise save under `~/Downloads`.
- Name the file from channel and title when available:
  `Channel_Title.txt`. Replace spaces with underscores and strip unsafe
  filename characters.

## Primary Local Path

Use `yt-dlp` when available:

```sh
yt-dlp --print "%(channel)s|%(title)s|%(id)s" --skip-download "URL"
yt-dlp --skip-download --write-subs --write-auto-subs \
  --sub-langs "en.*" --sub-format json3 \
  -o "$OUT/$NAME.%(ext)s" "URL"
```

Flatten `json3` captions to text. Preserve a timestamped version only when the
user asks for timestamps; otherwise save readable plain text.

## Fallbacks

- If `yt-dlp` is missing, use available browser, web, or connector tools to
  fetch the transcript.
- If the video is not English, list available subtitles first and choose the
  requested language or the best available caption track.
- If captions are absent, report that clearly. Do not download audio for speech
  recognition unless the user explicitly asks.

## Failure Handling

- On a first `yt-dlp` extractor failure, update `yt-dlp` once when it is already
  installed by a user-managed tool, then retry once.
- On rate limits, bot checks, or sign-in barriers, stop and report the blocker.
  Do not retry in a loop.
- If metadata is unavailable, use the video ID as the filename.

## Follow-On Work

After saving the transcript:

- summarize only from the transcript, not from memory of the video;
- quote sparingly;
- include timestamps only if the transcript source provides them or the user
  asked for timestamped notes.

Completion criterion: a transcript file exists at the reported path, or the
final response names the concrete reason no transcript could be obtained.
