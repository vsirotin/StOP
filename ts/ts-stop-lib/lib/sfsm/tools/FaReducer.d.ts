import { FaDefinition } from '../types';
/**
 * Converts an extended FA definition (nested FaNode tree) into compact format
 * (flat Record<string, Transition[]> with each FA's name as a top-level key).
 *
 * If the input is already in compact multi-FA format (all values are Transition[]),
 * it is returned unchanged.
 *
 * Metadata (state names, descriptions, signal/command metadata) is discarded in the output.
 */
export declare function reduceFA(definition: FaDefinition): FaDefinition;
//# sourceMappingURL=FaReducer.d.ts.map