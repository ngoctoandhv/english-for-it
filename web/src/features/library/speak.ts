/** Plays recorded audio when present, otherwise falls back to the browser's speech synthesis. */
export function playWord(term: string, audioUrl: string | null) {
  if (audioUrl) {
    void new Audio(audioUrl).play().catch(() => speak(term));
    return;
  }
  speak(term);
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}
