import { useShallow } from "zustand/react/shallow";
import { useEditorStore } from "@/stores/editorStore";

export const useEditorShellState = () => useEditorStore(useShallow((s) => ({
    page: s.page,
    undo: s.undo,
    redo: s.redo,
    deleteBlock: s.deleteBlock,
    duplicateBlock: s.duplicateBlock,
    selectedBlockId: s.selectedBlockId,
    historyIndex: s.historyIndex,
    history: s.history,
    addBlock: s.addBlock,
    moveBlock: s.moveBlock,
    selectBlock: s.selectBlock,
    updateBlock: s.updateBlock,
    activeDrag: s.activeDrag,
    setActiveDrag: s.setActiveDrag,
    activeRouteId: s.activeRouteId,
    wizard: s.wizard,
    closeWizard: s.closeWizard,
    addRoute: s.addRoute,
})));

export const useEditorToolbarState = () => useEditorStore(useShallow((s) => ({
    page: s.page,
    viewMode: s.viewMode,
    isDirty: s.isDirty,
    historyIndex: s.historyIndex,
    history: s.history,
    setViewMode: s.setViewMode,
    undo: s.undo,
    redo: s.redo,
    updateTitle: s.updateTitle,
    updateSlug: s.updateSlug,
    updateMeta: s.updateMeta,
    updateTheme: s.updateTheme,
    updatePageData: s.updatePageData,
    markClean: s.markClean,
    activeRouteId: s.activeRouteId,
    setActiveRoute: s.setActiveRoute,
    addRoute: s.addRoute,
    openTemplatePicker: s.openTemplatePicker,
    openWizard: s.openWizard,
})));

export const useEditorCanvasState = () => useEditorStore(useShallow((s) => ({
    page: s.page,
    viewMode: s.viewMode,
    selectBlock: s.selectBlock,
    updateTheme: s.updateTheme,
    activeRouteId: s.activeRouteId,
    waveEditorPos: s.waveEditorPos,
    setWaveEditorPos: s.setWaveEditorPos,
    textEditorPos: s.textEditorPos,
    setTextEditorPos: s.setTextEditorPos,
    selectedBlockId: s.selectedBlockId,
})));

export const usePropertiesPanelState = () => useEditorStore(useShallow((s) => ({
    page: s.page,
    selectedBlockId: s.selectedBlockId,
    updateBlock: s.updateBlock,
    activeRouteId: s.activeRouteId,
})));

export const useEditorPageState = () => useEditorStore(useShallow((s) => ({
    page: s.page,
    isDirty: s.isDirty,
    setPage: s.setPage,
    markClean: s.markClean,
})));
