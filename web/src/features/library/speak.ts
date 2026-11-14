/**
 * Pronunciation playback.
 * 1. Recorded audio (natural neural voice generated with `bin/audio`) when the item has an `audio_url`.
 * 2. Otherwise the best English voice the browser offers (neural/natural voices are ranked first).
 */
let current: HTMLAudioElement | null = null;
let cachedVoice: SpeechSynthesisVoice | null | undefined;

const NOVELTY = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Junior|Kathy|Organ|Princess|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley/;

function score(v: SpeechSynthesisVoice): number {
  let s = 0;
  if (/Natural|Neural|Online/i.test(v.name)) s += 8;
  if (/Premium|Enhanced/i.test(v.name)) s += 7;
  if (/Google US English/.test(v.name)) s += 5;
  if (/Samantha|Ava|Allison|Evan|Zoe|Nathan|Siri|Aria|Jenny|Guy|Andrew|Emma/.test(v.name)) s += 4;
  if (v.lang === "en-US") s += 3;
  else if (v.lang.startsWith("en")) s += 1;
  if (!v.localService) s += 1;
  if (NOVELTY.test(v.name)) s -= 20;
  return s;
}

function bestVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  if (voices.length === 0) return null; // voices load asynchronously; do not cache the miss
  cachedVoice = voices.sort((a, b) => score(b) - score(a))[0];
  return cachedVoice;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => (cachedVoice = undefined));
}

export function stopSpeaking() {
  current?.pause();
  current = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function playWord(text: string, audioUrl: string | null, rate = 1) {
  stopSpeaking();
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.playbackRate = rate;
    current = audio;
    void audio.play().catch(() => speak(text, rate));
    return;
  }
  speak(text, rate);
}

function speak(text: string, rate: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = bestVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "en-US";
  u.rate = 0.92 * rate;
  window.speechSynthesis.speak(u);
}
