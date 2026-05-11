import { FaDefinition, FaNode, Transition } from './types';

/**
 * Resolved, flat representation of one FA ready for engine processing.
 */
export interface ResolvedFa {
    name: string;
    transitions: Transition[];
    /** Keys of states that are themselves sub-FAs (have their own ts list). */
    subFaNames: Set<string>;
    node: FaNode;
}

/**
 * Parses a raw FaDefinition and builds a flat index of all FAs by name.
 *
 * A state entry is considered a sub-FA if its value object contains a "ts" key.
 * Leaf states (no "ts") are plain named states.
 */
export class FaResolver {

    private index = new Map<string, ResolvedFa>();

    constructor(private definition: FaDefinition) {
        this.buildIndex();
    }

    /** Returns the resolved FA for the given name, or throws if not found. */
    get(name: string): ResolvedFa {
        const fa = this.index.get(name);
        if (!fa) {
            throw new Error(`SFSM: FA "${name}" not found in definition.`);
        }
        return fa;
    }

    /** Returns the name of the root FA (the single top-level key). */
    getRootName(): string {
        const keys = Object.keys(this.definition);
        if (keys.length !== 1) {
            throw new Error(`SFSM: FA definition must have exactly one root FA, found: ${keys.join(', ')}`);
        }
        return keys[0];
    }

    private buildIndex(): void {
        const rootName = this.getRootName();
        const rootValue = this.definition[rootName];

        if (Array.isArray(rootValue)) {
            // Compact format: value is directly a Transition[]
            const node: FaNode = { ts: rootValue as Transition[] };
            this.index.set(rootName, {
                name: rootName,
                transitions: rootValue as Transition[],
                subFaNames: new Set(),
                node
            });
        } else {
            this.indexNode(rootName, rootValue as FaNode);
        }
    }

    private indexNode(name: string, node: FaNode): void {
        const subFaNames = new Set<string>();

        if (node.states) {
            for (const [stateName, stateValue] of Object.entries(node.states)) {
                if (this.isSubFa(stateValue)) {
                    subFaNames.add(stateName);
                    this.indexNode(stateName, stateValue as FaNode);
                }
            }
        }

        this.index.set(name, {
            name,
            transitions: node.ts,
            subFaNames,
            node
        });
    }

    /** A state value is a sub-FA if it has a "ts" array property. */
    private isSubFa(value: unknown): boolean {
        return (
            typeof value === 'object' &&
            value !== null &&
            'ts' in value &&
            Array.isArray((value as FaNode).ts)
        );
    }
}
