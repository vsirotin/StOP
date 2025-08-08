/**
 * Utility type to extract non-empty values from transition matrix
 */
type NonEmpty<T> = T extends "" | undefined | null ? never : T;

/**
 * Creates transitions from a 2D matrix representation.
 * 
 * Matrix format:
 * - First row: [undefined, ...states] - column headers
 * - Subsequent rows: [signal, ...transitions] - signal + target states
 * - Empty cells: undefined, null, "", or omitted
 * 
 * @template STATE - Type for states
 * @template SIGNAL - Type for signals
 */
class TransitionMatrix<STATE, SIGNAL> {
    private states: STATE[] = [];
    private signals: SIGNAL[] = [];
    private transitions: { from: STATE; to: STATE; signal: SIGNAL }[] = [];

    /**
     * Creates a transition matrix from a 2D array.
     * 
     * @param matrix - 2D array where:
     *   - matrix[0] = [undefined, ...states] (header row)
     *   - matrix[i] = [signal, target1, target2, ...] (transition rows)
     * 
     * @example
     * ```typescript
     * const matrix = [
     *     [           , "locked"    , "unlocked" ],  // States header
     *     [ "coin"    , "unlocked" ,             ],  // coin transitions  
     *     [ "push"    ,            , "locked"   ]   // push transitions
     * ];
     * ```
     */
    static fromArray<S, G>(
        matrix: Array<Array<S | G | undefined | null | "">>
    ): TransitionMatrix<NonEmpty<S>, NonEmpty<G>> {
        const instance = new TransitionMatrix<NonEmpty<S>, NonEmpty<G>>();
        
        if (matrix.length === 0) {
            throw new Error('Matrix cannot be empty');
        }

        // Extract states from header row (skip first empty cell)
        const headerRow = matrix[0];
        const stateValues = headerRow.slice(1).filter(cell => 
            cell !== undefined && cell !== null && cell !== ""
        );
        
        // Type assertion: assume header row contains only states
        instance.states = stateValues as NonEmpty<S>[];

        // Process each signal row
        for (let rowIndex = 1; rowIndex < matrix.length; rowIndex++) {
            const row = matrix[rowIndex];
            const signal = row[0];

            // Skip rows without valid signal
            if (!signal || signal === "" || signal === null || signal === undefined) {
                continue;
            }

            // Type assertion: assume first column contains only signals
            instance.signals.push(signal as NonEmpty<G>);

            // Process each state column
            for (let colIndex = 1; colIndex < row.length; colIndex++) {
                const targetState = row[colIndex];
                const fromState = instance.states[colIndex - 1];

                // If cell has a value, create transition
                if (targetState && targetState !== "" && targetState !== null && targetState !== undefined && fromState) {
                    // Type assertion: assume cell values are states
                    instance.transitions.push({
                        from: fromState,
                        to: targetState as NonEmpty<S>,
                        signal: signal as NonEmpty<G>
                    });
                }
            }
        }

        return instance;
    }

    /**
     * Get all states from the matrix.
     */
    getStates(): STATE[] {
        return [...this.states];
    }

    /**
     * Get all signals from the matrix.
     */
    getSignals(): SIGNAL[] {
        return [...this.signals];
    }

    /**
     * Get all transitions from the matrix.
     */
    getTransitions(): { from: STATE; to: STATE; signal: SIGNAL }[] {
        return [...this.transitions];
    }

    /**
     * Print the matrix for debugging.
     */
    printMatrix(): void {
        console.log('\nTransition Matrix:');
        
        // Header row
        const header = ['Signal', ...this.states.map(s => String(s))];
        console.log(header.join('\t| '));
        console.log('-'.repeat(header.join('\t| ').length));

        // Signal rows
        for (const signal of this.signals) {
            const row = [String(signal)];
            
            for (const state of this.states) {
                const transition = this.transitions.find(t => 
                    t.from === state && t.signal === signal
                );
                row.push(transition ? String(transition.to) : '');
            }
            
            console.log(row.join('\t| '));
        }
    }
}

/**
 * Helper function to create transition matrix from 2D array.
 * 
 * @template S - State type
 * @template G - Signal type  
 */
function transitionMatrix<S, G>(
    matrix: Array<Array<S | G | undefined | null | "">>
): TransitionMatrix<NonEmpty<S>, NonEmpty<G>> {
    return TransitionMatrix.fromArray<S, G>(matrix);
}

// Export the class and helper function
export { TransitionMatrix, transitionMatrix };