// Translates admin field labels, hints and option labels through the dictionary; unknown text is shown as written.
type T = (key: string) => string;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export function adminText(t: T, text: string): string {
  const key = `admin.t.${slug(text)}`;
  const out = t(key);
  return out === key ? text : out;
}
