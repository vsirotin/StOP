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
export function updateCompactFA(source, update) {
    var _a;
    const result = JSON.parse(JSON.stringify(source));
    const toRemove = new Set((_a = update.remove) !== null && _a !== void 0 ? _a : []);
    for (const name of toRemove) {
        delete result[name];
    }
    // Prune transitions referencing removed FAs from all surviving FAs.
    for (const transitions of Object.values(result)) {
        const arr = transitions;
        const filtered = arr.filter(t => !toRemove.has(t[2]));
        arr.length = 0;
        arr.push(...filtered);
    }
    if (update.add) {
        for (const [name, value] of Object.entries(update.add)) {
            result[name] = JSON.parse(JSON.stringify(value));
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
export function updateFullFA(source, update) {
    var _a;
    const result = JSON.parse(JSON.stringify(source));
    for (const name of ((_a = update.remove) !== null && _a !== void 0 ? _a : [])) {
        const rootNode = Object.values(result)[0];
        removeFromNode(rootNode, name);
    }
    if (update.add) {
        const rootKey = Object.keys(result)[0];
        for (const [name, newNode] of Object.entries(update.add)) {
            if (name === rootKey) {
                result[rootKey] = JSON.parse(JSON.stringify(newNode));
            }
            else {
                const rootNode = Object.values(result)[0];
                replaceInNode(rootNode, name, newNode);
            }
        }
    }
    return result;
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function removeFromNode(node, targetName) {
    if (!node.states)
        return false;
    if (targetName in node.states && isSubFaNode(node.states[targetName])) {
        delete node.states[targetName];
        node.ts = node.ts.filter(t => t[2] !== targetName);
        return true;
    }
    for (const stateValue of Object.values(node.states)) {
        if (isSubFaNode(stateValue) && removeFromNode(stateValue, targetName)) {
            return true;
        }
    }
    return false;
}
function replaceInNode(node, targetName, newNode) {
    if (!node.states)
        return false;
    if (targetName in node.states) {
        node.states[targetName] = JSON.parse(JSON.stringify(newNode));
        return true;
    }
    for (const stateValue of Object.values(node.states)) {
        if (isSubFaNode(stateValue) && replaceInNode(stateValue, targetName, newNode)) {
            return true;
        }
    }
    return false;
}
function isSubFaNode(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'ts' in value &&
        Array.isArray(value.ts));
}
