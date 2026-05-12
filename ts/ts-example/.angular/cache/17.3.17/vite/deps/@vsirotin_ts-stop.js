import "./chunk-TXDUYLVM.js";

// node_modules/@vsirotin/ts-stop/lib/esm/fa/DefaultState.js
var DefaultState = class {
  isDefaultState() {
    return true;
  }
};

// node_modules/@vsirotin/ts-stop/lib/esm/fa/FiniteStateMachine.js
var FiniteStateMachine = class {
  /**
   * Creates a new finite state machine.
   *
   * @param states - Array of all possible states
   * @param signals - Array of all possible signals/events
   * @param transitions - Array of transition rules defining how signals move between states
   * @param startState - The initial state of the machine
   * @param skipValidation - When true, all structural validations are skipped (default: false)
   */
  constructor(states, signals, transitions, startState, skipValidation = false) {
    this.states = states;
    this.signals = signals;
    this.transitions = transitions;
    this.startState = startState;
    this.defaultState = null;
    const defaultStates = states.filter((state) => this.isDefaultState(state));
    if (!skipValidation) {
      if (defaultStates.length > 1) {
        throw new Error(`ERROR-STOP-01: Multiple states implement IDefaultState interface. Only one state can handle invalid signals. Found ${defaultStates.length} states with IDefaultState.`);
      }
      this.validateDanglingReferences();
      this.validateOutputSignalStates();
      this.validateOutputSignalCycles();
      this.validateUnreachableStates();
    }
    if (defaultStates.length === 1) {
      this.defaultState = defaultStates[0];
    }
    this.currentState = startState;
    this.tryProcessStateWithOutputSignal();
    this.executeEntryAction(this.currentState);
  }
  /**
   * Gets the current state of the state machine.
   *
   * @returns The current state
   */
  getCurrentState() {
    return this.currentState;
  }
  /**
   * Processes a signal and potentially transitions to a new state with action execution.
   *
   * This method:
   * 1. Finds a matching transition for the current state and signal
   * 2. If found and the target state is different:
   *    a. Executes beforeExitAction on current state (if implemented)
   *    b. Changes to the new state
   *    c. Executes afterEntryAction on new state (if implemented)
   * 3. Returns the resulting state
   *
   * @param signal - The signal/event to process
   * @returns The resulting state after processing the signal
   */
  sendSignal(signal) {
    const transition = this.transitions.find((t) => t.from === this.currentState && t.signal === signal);
    if (transition) {
      this.executeStateTransition(transition);
    } else if (this.defaultState) {
      this.executeStateActions(this.defaultState);
    }
    this.tryProcessStateWithOutputSignal();
    return this.currentState;
  }
  tryProcessStateWithOutputSignal() {
    if (this.isStateWithOutputSignal(this.currentState)) {
      this.executeStateActions(this.currentState);
      const stateWithOutputSignal = this.currentState;
      const outputSignal = stateWithOutputSignal.getOutputSignal();
      if (outputSignal !== null && outputSignal !== void 0) {
        this.sendSignal(outputSignal);
      }
    }
  }
  validateUnreachableStates() {
    const reachable = /* @__PURE__ */ new Set();
    const queue = [this.startState];
    reachable.add(this.startState);
    while (queue.length > 0) {
      const current = queue.shift();
      for (const t of this.transitions) {
        if (t.from === current && !reachable.has(t.to)) {
          reachable.add(t.to);
          queue.push(t.to);
        }
      }
    }
    for (const state of this.states) {
      if (this.isDefaultState(state))
        continue;
      if (!reachable.has(state)) {
        throw new Error(`ERROR-STOP-08: State '${state}' is unreachable from start state '${this.startState}'. All non-default states must be reachable from the start state via the transition graph.`);
      }
    }
  }
  validateDanglingReferences() {
    const stateSet = new Set(this.states);
    const signalSet = new Set(this.signals);
    if (!stateSet.has(this.startState)) {
      throw new Error(`ERROR-STOP-03: Start state '${this.startState}' is not in the states array. The start state must be one of the provided states.`);
    }
    for (const t of this.transitions) {
      if (!stateSet.has(t.from)) {
        throw new Error(`ERROR-STOP-04: Transition references unknown state '${t.from}' as 'from'. All transition states must be in the states array.`);
      }
      if (!stateSet.has(t.to)) {
        throw new Error(`ERROR-STOP-05: Transition references unknown state '${t.to}' as 'to'. All transition states must be in the states array.`);
      }
      if (!signalSet.has(t.signal)) {
        throw new Error(`ERROR-STOP-06: Transition references unknown signal '${String(t.signal)}'. All transition signals must be in the signals array.`);
      }
    }
  }
  validateOutputSignalStates() {
    for (const state of this.states) {
      if (this.isStateWithOutputSignal(state)) {
        const hasOutgoing = this.transitions.some((t) => t.from === state);
        if (!hasOutgoing) {
          throw new Error(`ERROR-STOP-02: Configuration error: State '${state}' implements IStateWithOutputSignal but has no outgoing transitions. States with output signals must have at least one outgoing transition.`);
        }
      }
    }
  }
  validateOutputSignalCycles() {
    const outputStateSet = new Set(this.states.filter((s) => this.isStateWithOutputSignal(s)));
    if (outputStateSet.size < 2)
      return;
    const adj = /* @__PURE__ */ new Map();
    for (const state of outputStateSet) {
      adj.set(state, this.transitions.filter((t) => t.from === state && outputStateSet.has(t.to)).map((t) => t.to));
    }
    const visited = /* @__PURE__ */ new Set();
    const onStack = /* @__PURE__ */ new Set();
    const stackPath = [];
    const dfs = (state) => {
      var _a;
      visited.add(state);
      onStack.add(state);
      stackPath.push(state);
      for (const neighbor of (_a = adj.get(state)) !== null && _a !== void 0 ? _a : []) {
        if (onStack.has(neighbor)) {
          const cycleStart = stackPath.indexOf(neighbor);
          const cyclePath = [...stackPath.slice(cycleStart), neighbor];
          throw new Error(`ERROR-STOP-07: Circular dependency detected in output signals: ${cyclePath.map((s) => String(s)).join(" -> ")}. States with output signals cannot form cycles as this creates infinite loops.`);
        }
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }
      onStack.delete(state);
      stackPath.pop();
    };
    for (const state of outputStateSet) {
      if (!visited.has(state)) {
        dfs(state);
      }
    }
  }
  isStateWithOutputSignal(state) {
    const obj = state;
    return typeof obj === "object" && obj !== null && typeof obj.getOutputSignal === "function";
  }
  executeStateTransition(transition) {
    const oldState = this.currentState;
    const newState = transition.to;
    if (oldState !== newState) {
      this.executeExitAction(oldState);
      this.currentState = newState;
      this.executeEntryAction(newState);
    }
  }
  executeStateActions(state) {
    this.executeEntryAction(state);
    this.executeExitAction(state);
  }
  /**
   * Type guard to check if a state is an instance of DefaultState class.
   *
   * @param state - The state to check
   * @returns true if the state is an instance of DefaultState
   */
  isDefaultState(state) {
    return state instanceof DefaultState;
  }
  /**
   * Type guard to check if a state implements IStateWithAfterEntryAction.
   *
   * @param state - The state to check
   * @returns true if the state implements afterEntryAction method
   */
  hasAfterEntryAction(state) {
    return typeof state === "object" && state !== null && "afterEntryAction" in state && typeof state.afterEntryAction === "function";
  }
  /**
   * Type guard to check if a state implements IStateWithBeforeExitAction.
   *
   * @param state - The state to check
   * @returns true if the state implements beforeExitAction method
   */
  hasBeforeExitAction(state) {
    return typeof state === "object" && state !== null && "beforeExitAction" in state && typeof state.beforeExitAction === "function";
  }
  /**
   * Executes the afterEntryAction on a state if it implements IStateWithAfterEntryAction.
   *
   * @param state - The state to execute the entry action on
   */
  executeEntryAction(state) {
    if (this.hasAfterEntryAction(state)) {
      state.afterEntryAction();
    }
  }
  /**
   * Executes the beforeExitAction on a state if it implements IStateWithBeforeExitAction.
   *
   * @param state - The state to execute the exit action on
   */
  executeExitAction(state) {
    if (this.hasBeforeExitAction(state)) {
      state.beforeExitAction();
    }
  }
  /**
   * Gets all possible states.
   *
   * @returns Array of all states
   */
  getAllStates() {
    return [...this.states];
  }
  /**
   * Gets all possible signals.
   *
   * @returns Array of all signals
   */
  getAllSignals() {
    return [...this.signals];
  }
  /**
   * Checks if a given signal is valid from the current state.
   *
   * @param signal - The signal to check
   * @returns true if the signal can trigger a transition from the current state
   */
  isValidSignalFromCurrentState(signal) {
    return this.transitions.some((t) => t.from === this.currentState && t.signal === signal);
  }
  /**
   * Gets all valid signals from the current state.
   *
   * @returns Array of signals that can trigger transitions from the current state
   */
  getValidSignalsFromCurrentState() {
    return this.transitions.filter((t) => t.from === this.currentState).map((t) => t.signal);
  }
  /**
   * Gets all transitions.
   *
   * @returns Array of all transitions
   */
  getTransitions() {
    return [...this.transitions];
  }
  /**
   * Checks if a signal is valid in the state machine.
   * @param signal - The signal to check
   * @returns True if the signal is valid, false otherwise.
   */
  hasSignal(signal) {
    return this.getAllSignals().includes(signal);
  }
  /**
   * Checks if a given state exists in the state machine.
   *
   * @param state - The state to check
   * @returns true if the state exists, false otherwise
   */
  hasState(state) {
    return this.getAllStates().includes(state);
  }
  /**
  * Gets the default state that handles invalid signals.
  *
  * @returns The default state or null if none exists
  */
  getDefaultState() {
    return this.defaultState;
  }
  /**
   * Checks if the state machine has a default state.
   *
   * @returns true if a default state exists
   */
  hasDefaultState() {
    return this.defaultState !== null;
  }
};

// node_modules/@vsirotin/ts-stop/lib/esm/fa/MatrixBasedStateMachine.js
var MatrixBasedStateMachine = class extends FiniteStateMachine {
  /**
   * Creates a new matrix-based finite state machine.
   *
   * @param matrix - The transition matrix defining all states, signals, and transitions
   * @param startState - Optional. The initial state of the machine. If not provided,
   *                     the first state from the matrix (first column in header row) will be used.
   *                     If provided, must be one of the states in the matrix.
   *
   * @throws {Error} If matrix has no states
   * @throws {Error} If startState is provided but not found in the matrix states
   *
   * @example
   * ```typescript
   * // Constructor with explicit start state
   * const matrix = transitionMatrix([
   *     [           , "locked"    , "unlocked" ],
   *     [ "coin"    , "unlocked" ,             ],
   *     [ "push"    ,            , "locked"   ]
   * ]);
   * super(matrix, "unlocked"); // Start in unlocked state
   *
   * // Constructor with auto start state (uses first state)
   * super(matrix); // Automatically starts in "locked" state
   * ```
   *
   * @example
   * ```typescript
   * // TurnstileMatrix implementation from test/Turnstile/TurnstileMatrix.ts
   * class TurnstileMatrix extends MatrixBasedStateMachine<string, string> {
   *     constructor() {
   *         const matrix = transitionMatrix([
   *             [           , "locked"    , "unlocked" ],
   *             [ "coin"    , "unlocked" ,             ],
   *             [ "push"    ,            , "locked"   ]
   *         ]);
   *
   *         // Two ways to call the constructor:
   *         super(matrix, "locked");  // Option 1: Explicit start state
   *         // OR
   *         super(matrix);            // Option 2: Auto start state (uses "locked")
   *     }
   *
   *     insertCoin(): string { return this.sendSignal('coin'); }
   *     pushThrough(): string { return this.sendSignal('push'); }
   *     isLocked(): boolean { return this.getCurrentState() === 'locked'; }
   *     isUnlocked(): boolean { return this.getCurrentState() === 'unlocked'; }
   * }
   * ```
   */
  constructor(matrix, startState) {
    const states = matrix.getStates();
    if (states.length === 0) {
      throw new Error("Matrix must contain at least one state");
    }
    let actualStartState;
    if (startState !== void 0) {
      if (!states.includes(startState)) {
        throw new Error(`Start state '${String(startState)}' not found in matrix states: [${states.map((s) => String(s)).join(", ")}]`);
      }
      actualStartState = startState;
    } else {
      actualStartState = states[0];
    }
    super(matrix.getStates(), matrix.getSignals(), matrix.getTransitions(), actualStartState);
    this.matrix = matrix;
  }
  /**
   * Gets the transition matrix used by this state machine.
   *
   * @returns The transition matrix
   */
  getMatrix() {
    return this.matrix;
  }
};

// node_modules/@vsirotin/ts-stop/lib/esm/fa/TransitionMatrix.js
var TransitionMatrix = class _TransitionMatrix {
  constructor() {
    this.states = [];
    this.signals = [];
    this.transitions = [];
  }
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
  static fromArray(matrix) {
    const instance = new _TransitionMatrix();
    if (matrix.length === 0) {
      throw new Error("Matrix cannot be empty");
    }
    const headerRow = matrix[0];
    const stateValues = headerRow.slice(1).filter((cell) => cell !== void 0 && cell !== null && cell !== "");
    instance.states = stateValues;
    for (let rowIndex = 1; rowIndex < matrix.length; rowIndex++) {
      const row = matrix[rowIndex];
      const signal = row[0];
      if (!signal || signal === "" || signal === null || signal === void 0) {
        continue;
      }
      instance.signals.push(signal);
      for (let colIndex = 1; colIndex < row.length; colIndex++) {
        const targetState = row[colIndex];
        const fromState = instance.states[colIndex - 1];
        if (targetState && targetState !== "" && targetState !== null && targetState !== void 0 && fromState) {
          instance.transitions.push({
            from: fromState,
            to: targetState,
            signal
          });
        }
      }
    }
    return instance;
  }
  /**
   * Get all states from the matrix.
   */
  getStates() {
    return [...this.states];
  }
  /**
   * Get all signals from the matrix.
   */
  getSignals() {
    return [...this.signals];
  }
  /**
   * Get all transitions from the matrix.
   */
  getTransitions() {
    return [...this.transitions];
  }
};
function transitionMatrix(matrix) {
  return TransitionMatrix.fromArray(matrix);
}
export {
  DefaultState,
  FiniteStateMachine,
  MatrixBasedStateMachine,
  TransitionMatrix,
  transitionMatrix
};
//# sourceMappingURL=@vsirotin_ts-stop.js.map
