/**
 * Generates a deterministic linear gradient based on a string seed.
 * Useful for consistent placeholder backgrounds.
 */
export function getGradient(seed: string = "") {
    const colors = [
        "linear-gradient(135deg, #6366f1, #8b5cf6)",
        "linear-gradient(135deg, #3b82f6, #2dd4bf)",
        "linear-gradient(135deg, #f59e0b, #ef4444)",
        "linear-gradient(135deg, #10b981, #3b82f6)",
        "linear-gradient(135deg, #ec4899, #8b5cf6)",
        "linear-gradient(135deg, #14b8a6, #0ea5e9)",
    ];
    const s = seed || "default";
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
}
