import { FaDefinition, FaUpdate } from '../types';
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
export declare function updateCompactFA(source: FaDefinition, update: FaUpdate): FaDefinition;
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
export declare function updateFullFA(source: FaDefinition, update: FaUpdate): FaDefinition;
//# sourceMappingURL=FaUpdater.d.ts.map