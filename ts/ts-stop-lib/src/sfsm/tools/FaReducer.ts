import { FaDefinition, FaNode, Transition } from '../types';

/**
 * Converts an extended FA definition (nested FaNode tree) into compact format
 * (flat Record<string, Transition[]> with each FA's name as a top-level key).
 *
 * If the input is already in compact multi-FA format (all values are Transition[]),
 * it is returned unchanged.
 *
 * Metadata (state names, descriptions, signal/command metadata) is discarded in the output.
 */
export function reduceFA(definition: FaDefinition): FaDefinition {
    const entries = Object.entries(definition);

    // Already compact: all values are arrays
    if (entries.every(([, v]) => Array.isArray(v))) {
        return definition;
    }

    const result: Record<string, Transition[]> = {};
    const [rootName, rootValue] = entries[0];
    collectNodes(rootName, rootValue as FaNode, result);
    return result;
}

function collectNodes(name: string, node: FaNode, result: Record<string, Transition[]>): void {
    result[name] = node.ts;

    if (node.states) {
        for (const [stateName, stateValue] of Object.entries(node.states)) {
            if (isSubFaNode(stateValue)) {
                collectNodes(stateName, stateValue as FaNode, result);
            }
        }
    }
}

function isSubFaNode(value: unknown): boolean {
    return (
        typeof value === 'object' &&
        value !== null &&
        'ts' in value &&
        Array.isArray((value as FaNode).ts)
    );
}
