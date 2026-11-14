"""Make the voice files listed in the manifest (api/tmp/audio-manifest.json, from `bin/rails audio:manifest`).

Usage: python generate.py MANIFEST OUT_DIR [--limit N]
Entries: {file, voice, text}                      -> one clip, spoken with a Kokoro voice
         {file, concat: [clip files], gap: 0.4}   -> clips joined with a short pause (dialogues)
Existing files are skipped, so it can stop and resume at any time.
"""
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.request

MODELS = os.path.join(os.path.dirname(__file__), "models")
RELEASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
MODEL = "kokoro-v1.0.onnx"
VOICES = "voices-v1.0.bin"


def ensure_models():
    os.makedirs(MODELS, exist_ok=True)
    for name in (MODEL, VOICES):
        path = os.path.join(MODELS, name)
        if not os.path.exists(path):
            print(f"downloading {name} ...", flush=True)
            urllib.request.urlretrieve(RELEASE + name, path + ".part")
            os.replace(path + ".part", path)


def to_mp3(samples, rate, path):
    part = path + ".part"
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(rate), "-ac", "1", "-i", "pipe:0",
         "-codec:a", "libmp3lame", "-b:a", "64k", "-f", "mp3", part],
        input=samples.astype("float32").tobytes(), check=True,
    )
    os.replace(part, path)


def concat(files, gap, out_path):
    """Join mp3 clips with `gap` seconds of silence between them."""
    inputs, filters, labels = [], [], []
    for i, f in enumerate(files):
        inputs += ["-i", f]
        filters.append(f"[{i}:a]aresample=24000,aformat=channel_layouts=mono[a{i}]")
        labels.append(f"[a{i}]")
        if i < len(files) - 1:
            filters.append(f"anullsrc=r=24000:cl=mono,atrim=duration={gap}[s{i}]")
            labels.append(f"[s{i}]")
    graph = ";".join(filters) + f";{''.join(labels)}concat=n={len(labels)}:v=0:a=1[out]"
    part = out_path + ".part"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[out]",
                    "-codec:a", "libmp3lame", "-b:a", "64k", "-f", "mp3", part], check=True)
    os.replace(part, out_path)


def main():
    manifest, out = sys.argv[1], sys.argv[2]
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None
    clips = json.load(open(manifest))
    os.makedirs(out, exist_ok=True)
    single = [c for c in clips if "text" in c and not os.path.exists(os.path.join(out, c["file"]))][:limit]
    joined = [c for c in clips if "concat" in c and not os.path.exists(os.path.join(out, c["file"]))]
    print(f"{len(clips)} entries: {len(single)} clips and {len(joined)} dialogues to make", flush=True)

    if single:
        ensure_models()
        from kokoro_onnx import Kokoro  # imported late: listing work needs no model

        kokoro = Kokoro(os.path.join(MODELS, MODEL), os.path.join(MODELS, VOICES))
        start = time.time()
        for i, clip in enumerate(single, 1):
            try:
                samples, rate = kokoro.create(clip["text"], voice=clip["voice"], speed=clip.get("speed", 1.0), lang="en-us")
                to_mp3(samples, rate, os.path.join(out, clip["file"]))
            except Exception as error:  # one bad line must not stop the batch
                print(f"FAIL {clip['file']} {clip['text']!r}: {error}", flush=True)
            if i % 25 == 0 or i == len(single):
                print(f"{i}/{len(single)} clips, {time.time() - start:.0f}s", flush=True)

    for clip in joined:
        files = [os.path.join(out, f) for f in clip["concat"]]
        if all(os.path.exists(f) for f in files):
            concat(files, clip.get("gap", 0.4), os.path.join(out, clip["file"]))
    print("done", flush=True)


if __name__ == "__main__":
    main()
