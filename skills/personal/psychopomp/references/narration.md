# Narration

Repository `scripts/narrate.ts` supports a local macOS draft voice and optional
ElevenLabs/Fish Audio. It normalizes clips, transcribes words, and writes a timing
manifest for the Scene Program.

## Local draft

Required commands: `bun`, `say`, `ffmpeg`, `ffprobe`, and `uvx`. Transcription
runs `mlx-whisper` through uv and downloads an MLX Whisper model on first use.
The installation guide includes Bun and uv; it does not pre-download that model.
Check prerequisites before drafting. `WHISPER_MODEL` selects a model; upstream
defaults to `mlx-community/whisper-large-v3-mlx`.

Write clips in `scenes/<name>/narration/script.json`:

```json
{
  "clips": [
    {"id": "change-before", "text": "The request reaches the server, but the reply never returns."},
    {"id": "change-after", "text": "With the fix, the same request receives its reply."},
    {"id": "change-code", "text": "The handler now forwards the result."}
  ]
}
```

Use those example claims only if supported by the actual change. Clip IDs are
unique kebab-case. From the repository root:

```sh
bun scripts/narrate.ts scenes/<name>/narration/script.json --draft
```

Default draft voice: Samantha; `SAY_VOICE` selects an installed voice. Outputs
are `<id>.mp3`, `<id>.words.json`, and `narration.json` beside the script. The
script caches unchanged clips and checkpoints completed generations.

## Phrase timing

Use actual transcript phrases unique in each clip. Avoid acronym or punctuation
anchors that ASR might reformat. Number words match digits. Use `at_after` for
repeated phrases. Read the generated transcript. Re-voicing requires rebuilding
the Scene Plan; replacing audio alone desynchronizes the film.

## Optional paid voices

Use a user-selected provider/voice within authorized scope. Do not copy Kit's
voice ID, clone his voice, send project text, or consume paid credits merely
because a narrated film is requested. Local drafts need no API key.

For authorized ElevenLabs use `engine: "elevenlabs"`, the selected `voice`, and
supported model/settings after checking the installed script and current
provider docs. Upstream uses `eleven_v4`, stability 0.5, similarity 0.7; `speed`
is unsupported. Square-bracket delivery directions may guide speech; verify
they were not spoken. Inject `ELEVENLABS_API_KEY` through the user's secret
mechanism; never save credentials in the skill.

Fish Audio requires `FISH_AUDIO_API_KEY` plus external `fish-say.ts` selected
with `FISH_SAY`. That helper is not bundled or installed by the installation guide. Configure
it before choosing Fish rather than assuming Kit's private OpenCode path exists.
