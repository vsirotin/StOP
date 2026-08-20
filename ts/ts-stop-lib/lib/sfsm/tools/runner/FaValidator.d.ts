import { FaDefinition } from '../../types';
/**
 * Describes a single validation issue found during FA validation.
 */
export interface IValidationIssue {
    /** The rule number that was violated (1–14). */
    rule: number;
    /** Severity: 'error' (must fix) or 'warning' (advisory). */
    type: 'error' | 'warning';
    /** Human-readable description of the issue. */
    message: string;
    /** Name of the FA where the issue was found, if applicable. */
    faName?: string;
    /** Text representation of the transition that caused the issue, if applicable. */
    transition?: string;
}
/**
 * The result of running validation on a FaDefinition.
 */
export interface IValidationResult {
    /** All errors found (valid = false if this is non-empty). */
    errors: IValidationIssue[];
    /** All warnings found. */
    warnings: IValidationIssue[];
    /** True if no errors were found (warnings are allowed). */
    valid: boolean;
}
/**
 * FaValidator — validates a compact or extended FA definition against a set of
 * rules and returns a list of errors and warnings.
 *
 * Rules:
 *   1.  Input is well-formed JSON (E)
 *   2.  Input can be presented as a tree of FaDefinition objects (E)
 *   3.  No FAs without transitions (E)
 *   4.  No FAs with the same key as siblings in the graph (E)
 *   5.  No FAs with the same name in the whole tree (W)
 *   6.  No signals with the same name in the whole tree (W)
 *   7.  No transition with the same start state and signal (E)
 *   8.  Each FA has exactly one init state ("I", "*.I" or "*:I") (E)
 *   9.  Each sub-FA (not root) has one or more exit states ("E_*", "*.E_", "*:E_") (E)
 *  10.  For each transition targeting an exit state, some ancestor FA has a
 *       transition from the sub-FA name for the forwarded signal (W)
 *  11.  No transitions with exit state as from-state (E)
 *  12.  Each transition's target state exists in the same FA or is a sub-FA name (E)
 *  13.  Each sub-FA is referenced by at least one of its parent's transitions (W)
 *  14.  No unreachable states (states never referenced as a target) (W)
 */
export declare class FaValidator {
    /**
     * Validate a FaDefinition. Accepts both compact (Record<string, Transition[]>)
     * and extended (Record<string, FaNode>) formats.
     *
     * @param definition - The FA definition to validate.
     * @returns An IValidationResult containing all errors and warnings.
     */
    validate(definition: FaDefinition): IValidationResult;
    private indexFa;
    private indexFaNode;
    private buildFaInfo;
    private determineRoot;
    private isEntryState;
    private isExitState;
    private isSubFaNode;
    private transToString;
    private makeError;
    private makeWarn;
}
//# sourceMappingURL=FaValidator.d.ts.map