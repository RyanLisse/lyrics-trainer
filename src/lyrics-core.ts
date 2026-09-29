/**
 * Pure, DOM-free helpers for the Lyrics Trainer.
 *
 * Everything here is deterministic so it can be unit-tested directly
 * (the original exercise tested re-implemented copies of this logic).
 */

export interface TrainerState {
    idx:   number;
    delay: number;   // milliseconds
}

export const DEFAULT_STATE: Readonly<TrainerState> = { idx: 0, delay: 3000 };
export const MIN_DELAY = 500;
export const MAX_DELAY = 10000;

/** Split raw text into trimmed, non-empty lines. Handles \n and \r\n. */
export function processLyricsText(text: string): string[] {
    return text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

/** Clamp a line index into [0, length - 1]. Returns 0 for empty lyrics. */
export function clampIndex(idx: number, length: number): number {
    if (length <= 0 || !Number.isFinite(idx)) return 0;
    return Math.min(Math.max(Math.trunc(idx), 0), length - 1);
}

/** Index after "Next": wraps from the last line back to the first. */
export function nextIndex(idx: number, length: number): number {
    if (length <= 0) return 0;
    return idx >= length - 1 ? 0 : idx + 1;
}

/** Index after "Previous": stops at the first line. */
export function prevIndex(idx: number): number {
    return idx > 0 ? idx - 1 : 0;
}

/** Percentage of the song reached when showing line `idx` (1 line = 100%). */
export function progressPercent(idx: number, length: number): number {
    if (length <= 0) return 0;
    return Math.round(((clampIndex(idx, length) + 1) / length) * 100);
}

/** Short position text, used for the slider's aria-valuetext. */
export function positionText(idx: number, length: number): string {
    return `Line ${idx + 1} of ${length}`;
}

/** Full sentence for the screen-reader live region. */
export function lineAnnouncement(idx: number, length: number, line: string): string {
    return `${positionText(idx, length)}: ${line}`;
}

/**
 * Parse persisted state defensively. Anything malformed falls back to
 * defaults field-by-field, and the delay is clamped to the slider range.
 */
export function parseState(raw: string | null): TrainerState {
    if (raw === null) return { ...DEFAULT_STATE };
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return { ...DEFAULT_STATE }; }
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_STATE };

    const { idx, delay } = parsed as Partial<Record<keyof TrainerState, unknown>>;
    return {
        idx: typeof idx === 'number' && Number.isFinite(idx) && idx >= 0
            ? Math.trunc(idx) : DEFAULT_STATE.idx,
        delay: typeof delay === 'number' && Number.isFinite(delay)
            ? Math.min(Math.max(delay, MIN_DELAY), MAX_DELAY) : DEFAULT_STATE.delay,
    };
}

/** Direction of a line change, used to pick the slide animation. */
export type Direction = 'forward' | 'backward' | 'none';

export function transitionDirection(from: number, to: number): Direction {
    if (to === from) return 'none';
    return to > from ? 'forward' : 'backward';
}

/* ---------- WCAG contrast (https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio) ---------- */

function hexToRgb(hex: string): [number, number, number] {
    let h = hex.trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Invalid hex colour: ${hex}`);
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

export function relativeLuminance(hex: string): number {
    const [r, g, b] = hexToRgb(hex).map(c => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number {
    const a = relativeLuminance(fg);
    const b = relativeLuminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
