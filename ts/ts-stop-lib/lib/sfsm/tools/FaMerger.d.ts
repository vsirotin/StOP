import { FaDefinition } from '../types';
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
export declare function mergeFAs(definitions: FaDefinition[]): MergeFaResult;
//# sourceMappingURL=FaMerger.d.ts.map