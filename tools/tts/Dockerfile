# Makes the app's voice files with Kokoro (open model, Apache-2.0) on the CPU. Run through bin/audio.
FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg curl && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir kokoro-onnx==0.6.1 soundfile==0.14.0
WORKDIR /app
