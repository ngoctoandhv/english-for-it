/** "a", "a and b", "a, b and c". */
export function joinList(items: string[]): string {
  const list = items.map((s) => s.trim()).filter(Boolean);
  if (list.length <= 1) return list[0] ?? "";
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

/** Trims and removes a trailing full stop so the sentence can add its own. */
export function clean(text: string): string {
  return text.trim().replace(/[.\s]+$/, "");
}

/** Shows a visible placeholder like "[date]" when the learner has not filled a field yet. */
export function orPlaceholder(value: string | undefined, label: string): string {
  const v = clean(value ?? "");
  return v || `[${label}]`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API is unavailable on non-secure origins (http on a LAN IP): fall back to a hidden textarea.
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}
