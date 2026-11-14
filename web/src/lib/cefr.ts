/** CEFR levels used for learners, words, lessons, scenarios and path units. */
export const CEFR_LEVELS = ["a1", "a2", "b1", "b2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];
export const cefrCode = (level: string | null | undefined) => (level ? level.toUpperCase() : "");
