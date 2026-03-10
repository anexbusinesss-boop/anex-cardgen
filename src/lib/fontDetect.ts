/**
 * Detects whether a string contains Bengali characters.
 * Bengali Unicode block: U+0980 to U+09FF
 */
export function containsBengali(text: string): boolean {
    // Bengali Unicode range: U+0980–U+09FF
    const bengaliRegex = /[\u0980-\u09FF]/;
    return bengaliRegex.test(text);
}

/**
 * Returns the appropriate font family for the given text.
 * If the text contains Bengali characters, use Hind Siliguri.
 * Otherwise, use Trebuchet MS (English).
 */
export function getFontFamily(text: string): string {
    if (containsBengali(text)) {
        return '"Hind Siliguri", sans-serif';
    }
    return '"Trebuchet MS", Trebuchet, Arial, sans-serif';
}

/**
 * Returns a full CSS font string for canvas rendering.
 */
export function getCanvasFont(
    size: number,
    weight: number | string,
    text: string
): string {
    const family = getFontFamily(text);
    return `${weight} ${size}px ${family}`;
}
