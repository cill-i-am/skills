# Install Psychopomp

Psychopomp is an early Rust prototype distributed as source. Install the skill
and the renderer separately. The commands below were exercised on Apple Silicon
macOS; rendering needs a working GPU/Metal adapter. Rust and FFmpeg are also
needed on other platforms, but Homebrew-specific commands do not apply there.

## Install this skill

From a project, install just Psychopomp from this repository:

```sh
npx skills add https://github.com/cill-i-am/skills --skill psychopomp --agent codex --full-depth --copy -y
```

Add `--global` for personal/global installation. Invoke it with `$psychopomp`.

## Install the macOS prerequisites

With Homebrew already installed:

```sh
brew install rust ffmpeg uv imagemagick
brew install oven-sh/bun/bun
```

Rust/Cargo build the renderer and Scene Programs. FFmpeg needs `libx264` for
exports. Bun runs the upstream scripts. ImageMagick builds contact sheets. uv
provides `uvx` for optional local speech transcription. macOS `say` supplies
draft narration. First-use transcription separately downloads MLX Whisper and
its model; the default large model is not required for silent graphics.

## Check out and build the reviewed source

Reuse an existing installation when available. For a fresh checkout, choose a
directory and export `PSYCHOPOMP_ROOT` for the current shell:

```sh
export PSYCHOPOMP_ROOT="${XDG_DATA_HOME:-$HOME/.local/share}/psychopomp"
mkdir -p "$(dirname "$PSYCHOPOMP_ROOT")"
git clone https://github.com/kitlangton/psychopomp.git "$PSYCHOPOMP_ROOT"
cd "$PSYCHOPOMP_ROOT"
git checkout --detach 46fd6121d0c2067f22a176e2187924a9914e9453
cargo build --release --locked -p psychopomp-render
```

The pin is the upstream version reviewed on 2026-10-04. Review upstream changes
before choosing another version, and use that version's checked-in docs and
lockfile. Preserve authored scenes before updating a checkout.

Run the built binary directly as `"$PSYCHOPOMP_ROOT/target/release/psychopomp"`.
To put it on PATH, add that directory to your shell's PATH, or use Cargo's
native install:

```sh
cargo install --locked --path "$PSYCHOPOMP_ROOT/crates/psychopomp-render"
```

Cargo installs the executable under `${CARGO_HOME:-$HOME/.cargo}/bin`; include
that directory on PATH if needed. Keep the source checkout for authoring scenes,
reading documentation, and running upstream scripts. A separately installed
binary must be reinstalled after source updates. No CLI wrapper is required.

## Verify the installation

From the checkout root:

```sh
ffmpeg -hide_banner -encoders | grep libx264
cargo run --release --locked -p agent-demo -- target/agent-demo.json
./target/release/psychopomp plan validate target/agent-demo.json
./target/release/psychopomp plan render target/agent-demo.json output/install-smoke.mp4 --range 0..2 --theme neutral
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of json output/install-smoke.mp4
bun scripts/sheet.ts target/agent-demo.json 0.25,1,1.75 --theme neutral --shutter --out output/install-sheet.jpg
```

The smoke export should be H.264, 1920×1080, 60 fps, and two seconds long. Inspect
the sheet for visible text. This silent test does not verify speech synthesis,
transcription, paid providers, or an interactive desktop presentation.

If Metal reports no adapters inside an agent sandbox, use the environment's
approved GPU execution escalation when available. Installing extra fonts or
retrying the same confined process does not fix GPU access; CommitMono is bundled.

The upstream contact-sheet script replaces `output/sheet-frames`. Use separate
checkouts/output locations for concurrent authoring.
