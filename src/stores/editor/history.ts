import type { EditorPage } from "@/types";

export function clonePage(page: EditorPage): EditorPage {
    return JSON.parse(JSON.stringify(page)) as EditorPage;
}

export function createHistory(page: EditorPage): { history: EditorPage[]; historyIndex: number } {
    return { history: [clonePage(page)], historyIndex: 0 };
}

export function pushHistorySnapshot(
    history: EditorPage[],
    historyIndex: number,
    page: EditorPage,
    limit = 50,
): { history: EditorPage[]; historyIndex: number; changed: boolean } {
    const snapshot = clonePage(page);
    const last = history[historyIndex];
    if (last && JSON.stringify(last) === JSON.stringify(snapshot)) {
        return { history, historyIndex, changed: false };
    }

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(snapshot);

    if (nextHistory.length > limit) {
        nextHistory.shift();
        return { history: nextHistory, historyIndex, changed: true };
    }

    return { history: nextHistory, historyIndex: historyIndex + 1, changed: true };
}

