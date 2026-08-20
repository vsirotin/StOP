import { FaDefinition } from '../types';
import { reduceFA } from './FaReducer';

export interface MergeFaResult {
    merged: FaDefinition;
    warnings: string[];
}

/**
 * Merges multiple FA definitions into one compact multi-FA object.
 *
 * Each input is reduced first (same semantics as reduceFA). If an input is
 * already compact, reduceFA returns it unchanged.
 *
 * On duplicate FA keys, the later input overwrites the previous one and a
 * warning entry is emitted.
 */
export function mergeFAs(definitions: FaDefinition[]): MergeFaResult {
    const merged: FaDefinition = {};
    const warnings: string[] = [];

    for (let fileIndex = 0; fileIndex < definitions.length; fileIndex++) {
        const reduced = reduceFA(definitions[fileIndex]);

        for (const [faName, transitions] of Object.entries(reduced)) {
            if (Object.prototype.hasOwnProperty.call(merged, faName)) {
                warnings.push(`Duplicate FA key '${faName}' encountered at input #${fileIndex + 1}. Last definition wins.`);
            }
            merged[faName] = transitions;
        }
    }

    return { merged, warnings };
}
