"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Result = { 0: { transcript: string } };
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<Result> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type Phase = "idle" | "listening" | "done";
export type Support = { record: boolean; recognise: boolean };

export function speechSupport(): Support {
  const secure = typeof window !== "undefined" && window.isSecureContext;
  return {
    record: secure && typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    recognise: secure && recognitionCtor() !== null,
  };
}

/** Records the learner (for shadowing) and, where the browser allows it, transcribes what was said. */
export function useSpeechPractice() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [heard, setHeard] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<"denied" | "unsupported" | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const recogniser = useRef<Recognition | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const urlRef = useRef<string | null>(null);

  const release = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  const reset = useCallback(() => {
    recogniser.current?.abort();
    if (recorder.current?.state === "recording") recorder.current.stop();
    release();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setAudioUrl(null);
    setHeard("");
    setError(null);
    setPhase("idle");
  }, [release]);

  useEffect(() => reset, [reset]);

  const start = useCallback(async () => {
    reset();
    const support = speechSupport();
    if (!support.record && !support.recognise) return setError("unsupported");
    try {
      if (support.record) {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.current = s;
        const chunks: Blob[] = [];
        const rec = new MediaRecorder(s);
        rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
        rec.onstop = () => {
          if (chunks.length > 0) {
            urlRef.current = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
            setAudioUrl(urlRef.current);
          }
          release();
        };
        recorder.current = rec;
        rec.start();
      }
      const Ctor = recognitionCtor();
      if (support.recognise && Ctor) {
        const r = new Ctor();
        r.lang = "en-US";
        r.interimResults = false;
        r.maxAlternatives = 1;
        r.onresult = (e) => setHeard(Array.from(e.results).map((x) => x[0].transcript).join(" ").trim());
        r.onerror = (e) => e.error === "not-allowed" && setError("denied");
        r.onend = () => {
          if (recorder.current?.state === "recording") recorder.current.stop();
          setPhase("done");
        };
        recogniser.current = r;
        r.start();
      }
      setPhase("listening");
    } catch {
      release();
      setError("denied");
    }
  }, [reset, release]);

  const stop = useCallback(() => {
    if (recogniser.current) recogniser.current.stop();
    else {
      if (recorder.current?.state === "recording") recorder.current.stop();
      setPhase("done");
    }
  }, []);

  return { phase, heard, audioUrl, error, start, stop, reset };
}
