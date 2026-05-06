import type { Block, EditorPage } from "@/types";

function updateColProps(b: Block, id: string, updater: (b: Block) => Block): Block {
    const p = b.props;
    let changed = false;
    const newProps = { ...p };

    for (const key of ["col0", "col1", "childBlocks"]) {
        const arr = p[key] as Block[] | undefined;
        if (arr) {
            const next = findAndUpdate(arr, id, updater);
            if (next !== arr) {
                newProps[key] = next;
                changed = true;
            }
        }
    }

    const items = p.items as { id: string, blocks: Block[] }[] | undefined;
    if (items) {
        const nextItems = items.map(item => {
            const nextBlocks = findAndUpdate(item.blocks || [], id, updater);
            if (nextBlocks !== item.blocks) {
                changed = true;
                return { ...item, blocks: nextBlocks };
            }
            return item;
        });
        if (changed) newProps.items = nextItems;
    }

    return changed ? { ...b, props: newProps } : b;
}

function deleteColProps(b: Block, id: string): Block {
    const p = b.props;
    let changed = false;
    const newProps = { ...p };

    for (const key of ["col0", "col1", "childBlocks"]) {
        const arr = p[key] as Block[] | undefined;
        if (arr) {
            const next = findAndDelete(arr, id);
            if (next !== arr) {
                newProps[key] = next;
                changed = true;
            }
        }
    }

    const items = p.items as { id: string, blocks: Block[] }[] | undefined;
    if (items) {
        const nextItems = items.map(item => {
            const nextBlocks = findAndDelete(item.blocks || [], id);
            if (nextBlocks !== item.blocks) {
                changed = true;
                return { ...item, blocks: nextBlocks };
            }
            return item;
        });
        if (changed) newProps.items = nextItems;
    }

    return changed ? { ...b, props: newProps } : b;
}

export function findAndUpdate(blocks: Block[], id: string, updater: (b: Block) => Block): Block[] {
    return blocks.map((b) => {
        if (b.id === id) return updater(b);
        if (b.children?.length) return { ...b, children: findAndUpdate(b.children, id, updater) };
        return updateColProps(b, id, updater);
    });
}

export function findAndDelete(blocks: Block[], id: string): Block[] {
    return blocks.filter((b) => b.id !== id).map((b) => {
        let updated = b.children ? { ...b, children: findAndDelete(b.children, id) } : b;
        updated = deleteColProps(updated, id);
        return updated;
    });
}

export function applyUpdaterDeep(page: EditorPage, activeRouteId: string | null, updater: (blocks: Block[]) => Block[]): void {
    if (page.globalBlocks) {
        if (page.globalBlocks.header) {
            page.globalBlocks.header = updater([page.globalBlocks.header])[0] || null;
        }
        if (page.globalBlocks.footer) {
            page.globalBlocks.footer = updater([page.globalBlocks.footer])[0] || null;
        }
    }
    if (page.routes && activeRouteId) {
        const route = page.routes.find(r => r.id === activeRouteId);
        if (route) {
            route.content = updater(route.content);
        }
    }
}

export function findAndRemoveBlock(blocks: Block[], id: string): { newBlocks: Block[], removed: Block | null } {
    let removed: Block | null = null;
    const newBlocks = blocks.filter(b => {
        if (b.id === id) { removed = b; return false; }
        return true;
    }).map(b => {
        const updated = { ...b };
        if (updated.children && !removed) {
            const res = findAndRemoveBlock(updated.children, id);
            if (res.removed) { removed = res.removed; updated.children = res.newBlocks; }
        }
        const col0 = updated.props.col0 as Block[] | undefined;
        if (col0 && !removed) {
            const res = findAndRemoveBlock(col0, id);
            if (res.removed) { removed = res.removed; updated.props = { ...updated.props, col0: res.newBlocks }; }
        }
        const col1 = updated.props.col1 as Block[] | undefined;
        if (col1 && !removed) {
            const res = findAndRemoveBlock(col1, id);
            if (res.removed) { removed = res.removed; updated.props = { ...updated.props, col1: res.newBlocks }; }
        }
        const childBlocks = updated.props.childBlocks as Block[] | undefined;
        if (childBlocks && !removed) {
            const res = findAndRemoveBlock(childBlocks, id);
            if (res.removed) { removed = res.removed; updated.props = { ...updated.props, childBlocks: res.newBlocks }; }
        }
        const items = updated.props.items as { id: string, blocks: Block[] }[] | undefined;
        if (items && !removed) {
            const nextItems = items.map(item => {
                if (removed || !item.blocks) return item;
                const res = findAndRemoveBlock(item.blocks, id);
                if (res.removed) {
                    removed = res.removed;
                    return { ...item, blocks: res.newBlocks };
                }
                return item;
            });
            if (removed) updated.props = { ...updated.props, items: nextItems };
        }
        return updated;
    });
    return { newBlocks, removed };
}

export function insertBlockDeep(
    blocks: Block[], insertBlock: Block, targetId: string,
    position: "before" | "after" | "inside" | "inside-start" = "after", childProp?: string
): { newBlocks: Block[], inserted: boolean } {
    let inserted = false;
    const newBlocks: Block[] = [];
    for (const b of blocks) {
        if (b.id === targetId) {
            if (position === "before") {
                newBlocks.push(insertBlock, b);
                inserted = true;
            } else if (position === "after") {
                newBlocks.push(b, insertBlock);
                inserted = true;
            } else if ((position === "inside" || position === "inside-start") && childProp) {
                const updated = { ...b };
                if (childProp === "children") {
                    updated.children = position === "inside-start"
                        ? [insertBlock, ...(updated.children || [])]
                        : [...(updated.children || []), insertBlock];
                    inserted = true;
                } else if (childProp === "col0" || childProp === "col1" || childProp === "childBlocks") {
                    const currentArr = (updated.props[childProp] as Block[]) || [];
                    updated.props = {
                        ...updated.props,
                        [childProp]: position === "inside-start"
                            ? [insertBlock, ...currentArr]
                            : [...currentArr, insertBlock]
                    };
                    inserted = true;
                } else {
                    const items = updated.props.items as any[] | undefined;
                    if (Array.isArray(items)) {
                        const slotIdx = items.findIndex(s => s.id === childProp);
                        if (slotIdx !== -1) {
                            const nextItems = [...items];
                            const currentBlocks = nextItems[slotIdx].blocks || [];
                            nextItems[slotIdx] = {
                                ...nextItems[slotIdx],
                                blocks: position === "inside-start"
                                    ? [insertBlock, ...currentBlocks]
                                    : [...currentBlocks, insertBlock]
                            };
                            updated.props = { ...updated.props, items: nextItems };
                            inserted = true;
                        }
                    }
                }
                newBlocks.push(updated);
            } else {
                newBlocks.push(b);
            }
        } else {
            const updated = { ...b };
            if (updated.children && !inserted) {
                const res = insertBlockDeep(updated.children, insertBlock, targetId, position, childProp);
                if (res.inserted) { updated.children = res.newBlocks; inserted = true; }
            }
            if (!inserted) {
                for (const prop of ["col0", "col1", "childBlocks"]) {
                    const children = updated.props[prop] as Block[] | undefined;
                    if (children && !inserted) {
                        const res = insertBlockDeep(children, insertBlock, targetId, position, childProp);
                        if (res.inserted) { updated.props = { ...updated.props, [prop]: res.newBlocks }; inserted = true; }
                    }
                }
                const items = updated.props.items as { id: string, blocks: Block[] }[] | undefined;
                if (items && !inserted) {
                    const nextItems = items.map(item => {
                        if (inserted || !item.blocks) return item;
                        const res = insertBlockDeep(item.blocks, insertBlock, targetId, position, childProp);
                        if (res.inserted) { inserted = true; return { ...item, blocks: res.newBlocks }; }
                        return item;
                    });
                    if (inserted) { updated.props = { ...updated.props, items: nextItems }; }
                }
            }
            newBlocks.push(updated);
        }
    }
    return { newBlocks, inserted };
}

function isBlock(obj: any): obj is Block {
    return obj && typeof obj === "object" && typeof obj.id === "string" && typeof obj.type === "string" && obj.props;
}

export function recursiveClone(block: Block): Block {
    const newId = crypto.randomUUID();
    const newBlock = { ...block, id: newId };

    // 1. Clone children if they exist
    if (Array.isArray(newBlock.children)) {
        newBlock.children = newBlock.children.map(recursiveClone);
    }

    // 2. Clone props recursively to find any nested blocks
    const newProps = { ...block.props };

    for (const key in newProps) {
        const val = newProps[key];

        if (isBlock(val)) {
            newProps[key] = recursiveClone(val);
        } else if (Array.isArray(val)) {
            newProps[key] = val.map(item => {
                if (isBlock(item)) return recursiveClone(item);
                // Special case for the "items" / slots pattern
                if (item && typeof item === "object" && item.id && Array.isArray(item.blocks)) {
                    return {
                        ...item,
                        id: item.id.startsWith("slot-") ? `slot-${crypto.randomUUID()}` : crypto.randomUUID(),
                        blocks: item.blocks.map(recursiveClone)
                    };
                }
                return item;
            });
        }
    }

    newBlock.props = newProps;
    return newBlock;
}

export function duplicateBlockDeep(blocks: Block[], targetId: string): { newBlocks: Block[], clonedId: string | null } {
    let clonedId: string | null = null;

    const items = blocks.flatMap(b => {
        if (b.id === targetId) {
            const clone = recursiveClone(b);
            clonedId = clone.id;
            return [b, clone];
        }

        let changed = false;
        const newBlock = { ...b };

        // Check standard children
        if (Array.isArray(b.children)) {
            const res = duplicateBlockDeep(b.children, targetId);
            if (res.clonedId) {
                newBlock.children = res.newBlocks;
                clonedId = res.clonedId;
                changed = true;
            }
        }

        // Check all props for potential blocks
        if (!changed) {
            const newProps = { ...b.props };
            for (const key in newProps) {
                const val = newProps[key];
                if (Array.isArray(val)) {
                    // Check if this array contains blocks (or is an items array with blocks)
                    let arrayChanged = false;
                    const nextArray = val.flatMap(item => {
                        if (isBlock(item)) {
                            // If this is the array containing the target, we flatMap it
                            if (item.id === targetId) {
                                const clone = recursiveClone(item);
                                clonedId = clone.id;
                                arrayChanged = true;
                                return [item, clone];
                            }
                        }
                        return [item];
                    });

                    // If we didn't find the target as a direct child of this array,
                    // recurse into each item's children/props
                    if (!arrayChanged) {
                        const deeplyProcessedArray = val.map(item => {
                            if (arrayChanged) return item;

                            if (isBlock(item)) {
                                const res = duplicateBlockDeep([item], targetId);
                                if (res.clonedId) {
                                    arrayChanged = true;
                                    clonedId = res.clonedId;
                                    return res.newBlocks[0];
                                }
                            } else if (item && typeof item === "object" && Array.isArray(item.blocks)) {
                                // Handle the "items" slot pattern
                                const res = duplicateBlockDeep(item.blocks, targetId);
                                if (res.clonedId) {
                                    arrayChanged = true;
                                    clonedId = res.clonedId;
                                    return { ...item, blocks: res.newBlocks };
                                }
                            }
                            return item;
                        });

                        if (arrayChanged) {
                            newProps[key] = deeplyProcessedArray;
                            changed = true;
                        }
                    } else {
                        newProps[key] = nextArray;
                        changed = true;
                    }
                } else if (isBlock(val)) {
                    const res = duplicateBlockDeep([val], targetId);
                    if (res.clonedId) {
                        newProps[key] = res.newBlocks[0];
                        clonedId = res.clonedId;
                        changed = true;
                    }
                }

                if (changed) break;
            }
            if (changed) newBlock.props = newProps;
        }

        return [changed ? newBlock : b];
    });

    return { newBlocks: items, clonedId };
}

