import { FaDefinition, FaNode, FaUpdate, Transition } from '../types';

/**
 * Apply an update to a compact FA definition (flat Record<string, Transition[]>).
 *
 * Steps (in order):
 * 1. remove: delete the named top-level keys; also prune every remaining FA's
 *    transitions whose 3rd element (target state) is one of the removed names.
 * 2. add: upsert the provided keys (existing entries are replaced, new ones are added).
 *
 * The source is not mutated — a deep-cloned result is returned.
 */
export function updateCompactFA(source: FaDefinition, update: FaUpdate): FaDefinition {
    const result: Record<string, Transition[]> = JSON.parse(JSON.stringify(source));

    const toRemove = new Set(update.remove ?? []);

    for (const name of toRemove) {
        delete result[name];
    }

    // Prune transitions referencing removed FAs from all surviving FAs.
    for (const transitions of Object.values(result)) {
        const arr = transitions as Transition[];
        const filtered = arr.filter(t => !toRemove.has(t[2]));
        arr.length = 0;
        arr.push(...filtered);
    }

    if (update.add) {
        for (const [name, value] of Object.entries(update.add)) {
            result[name] = JSON.parse(JSON.stringify(value)) as Transition[];
        }
    }

    return result;
}

/**
 * Apply an update to an extended (full/declaration) FA definition.
 *
 * Steps (in order):
 * 1. remove: recursively locate each named FA in the tree; remove it from its
 *    parent's states map and prune the parent's ts of any transition targeting it.
 * 2. add: for each entry, recursively locate the FA by name and replace it entirely.
 *    If the name matches the root key, the root node is replaced.
 *
 * The source is not mutated — a deep-cloned result is returned.
 */
export function updateFullFA(source: FaDefinition, update: FaUpdate): FaDefinition {
    const result: FaDefinition = JSON.parse(JSON.stringify(source));

    for (const name of (update.remove ?? [])) {
        const rootNode = Object.values(result)[0] as FaNode;
        removeFromNode(rootNode, name);
    }

    if (update.add) {
        const rootKey = Object.keys(result)[0];
        for (const [name, newNode] of Object.entries(update.add)) {
            if (name === rootKey) {
                result[rootKey] = JSON.parse(JSON.stringify(newNode));
            } else {
                const rootNode = Object.values(result)[0] as FaNode;
                replaceInNode(rootNode, name, newNode as FaNode);
            }
        }
    }

    return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function removeFromNode(node: FaNode, targetName: string): boolean {
    if (!node.states) return false;

    if (targetName in node.states && isSubFaNode(node.states[targetName])) {
        delete node.states[targetName];
        node.ts = node.ts.filter(t => t[2] !== targetName);
        return true;
    }

    for (const stateValue of Object.values(node.states)) {
        if (isSubFaNode(stateValue) && removeFromNode(stateValue as FaNode, targetName)) {
            return true;
        }
    }

    return false;
}

function replaceInNode(node: FaNode, targetName: string, newNode: FaNode): boolean {
    if (!node.states) return false;

    if (targetName in node.states) {
        node.states[targetName] = JSON.parse(JSON.stringify(newNode));
        return true;
    }

    for (const stateValue of Object.values(node.states)) {
        if (isSubFaNode(stateValue) && replaceInNode(stateValue as FaNode, targetName, newNode)) {
            return true;
        }
    }

    return false;
}

function isSubFaNode(value: unknown): boolean {
    return (
        typeof value === 'object' &&
        value !== null &&
        'ts' in value &&
        Array.isArray((value as FaNode).ts)
    );
}
