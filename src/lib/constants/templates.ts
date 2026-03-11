/**
 * Shared template-related constants for the public gallery and landing sections.
 */

export const CATEGORIES = [
    "All",
    "Landing Pages",
    "Dashboards",
    "Portfolios",
    "E-Commerce",
    "Blogs",
    "UI Kits"
] as const;

export type Category = (typeof CATEGORIES)[number];

export const TEMPLATE_LIMIT = 12;
export const DEBOUNCE_WAIT = 300;
