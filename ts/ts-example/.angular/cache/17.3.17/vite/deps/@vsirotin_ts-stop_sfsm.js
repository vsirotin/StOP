import "./chunk-WDMUDEB6.js";

// node_modules/@vsirotin/ts-stop/lib/esm/sfsm/ExternalWorldHub.js
var ExternalWorldHub = class {
  constructor() {
    this.commandRoutes = /* @__PURE__ */ new Map();
    this.signalSenders = [];
  }
  /**
   * Register a command receiver for the given list of exact command names.
   * Throws if any command name is already registered.
   * Fluent — returns this.
   */
  registerCommandReceiver(commands, receiver) {
    for (const cmd of commands) {
      if (this.commandRoutes.has(cmd)) {
        throw new Error(`ExternalWorldHub: command "${cmd}" is already registered`);
      }
      this.commandRoutes.set(cmd, receiver);
    }
    return this;
  }
  /**
   * Register a signal sender for the given list of signal names.
   * Duplicate signal names across registrations are allowed (same sender may be
   * registered multiple times for documentation clarity), but will not cause
   * double-wiring — connectSignalTarget is called once per registerSignalSender call.
   * Fluent — returns this.
   */
  registerSignalSender(signals, sender) {
    this.signalSenders.push({ signals, sender });
    return this;
  }
  /**
   * Wire this hub to the given SFSM instance:
   * 1. Sets this hub as the SFSM's command receiver.
   * 2. Calls connectSignalTarget(sfsm) on every registered signal sender.
   * Fluent — returns this.
   */
  connectTo(sfsm) {
    sfsm.setCommandReceiver(this);
    for (const { sender } of this.signalSenders) {
      sender.connectSignalTarget(sfsm);
    }
    return this;
  }
  /** ICommandReceiver implementation — dispatches command to the registered receiver. */
  receiveCommand(command, data) {
    const receiver = this.commandRoutes.get(command);
    if (!receiver) {
      const registered = [...this.commandRoutes.keys()].join(", ");
      throw new Error(`ExternalWorldHub: no receiver registered for command "${command}". Registered commands: [${registered}]`);
    }
    receiver.receiveCommand(command, data);
  }
  /** Returns all command names that have a registered receiver (for diagnostics / validation). */
  getRegisteredCommands() {
    return [...this.commandRoutes.keys()];
  }
  /** Returns all signal names that have a registered sender (for diagnostics / validation). */
  getRegisteredSignals() {
    return this.signalSenders.flatMap((e) => e.signals);
  }
};

// node_modules/@vsirotin/ts-stop/lib/esm/sfsm/FaResolver.js
var FaResolver = class {
  constructor(definition) {
    this.definition = definition;
    this.index = /* @__PURE__ */ new Map();
    this.buildIndex();
  }
  /** Returns the resolved FA for the given name, or throws if not found. */
  get(name) {
    const fa = this.index.get(name);
    if (!fa) {
      throw new Error(`SFSM: FA "${name}" not found in definition.`);
    }
    return fa;
  }
  /** Returns the name of the root FA.
   *
   * For single-key definitions (compact single FA or extended FA), the sole key is the root.
   * For multi-key compact definitions (all values are Transition[]), the root is the FA whose
   * name is never referenced as a target state (3rd element) in any other FA's transitions.
   */
  getRootName() {
    const keys = Object.keys(this.definition);
    if (keys.length === 1) {
      return keys[0];
    }
    const allCompact = keys.every((k) => Array.isArray(this.definition[k]));
    if (!allCompact) {
      throw new Error(`SFSM: Multi-key FA definition must use compact format (all values must be Transition[]).`);
    }
    const referenced = /* @__PURE__ */ new Set();
    for (const key of keys) {
      const transitions = this.definition[key];
      for (const t of transitions) {
        referenced.add(t[2]);
      }
    }
    const roots = keys.filter((k) => !referenced.has(k));
    if (roots.length !== 1) {
      throw new Error(`SFSM: Cannot determine root FA. Candidates: [${roots.join(", ")}]. All FA names: [${keys.join(", ")}].`);
    }
    return roots[0];
  }
  buildIndex() {
    const entries = Object.entries(this.definition);
    const allCompact = entries.every(([, v]) => Array.isArray(v));
    if (allCompact && entries.length > 1) {
      this.buildCompactMultiIndex();
    } else {
      const rootName = this.getRootName();
      const rootValue = this.definition[rootName];
      if (Array.isArray(rootValue)) {
        const node = { ts: rootValue };
        this.index.set(rootName, {
          name: rootName,
          transitions: rootValue,
          subFaNames: /* @__PURE__ */ new Set(),
          node
        });
      } else {
        this.indexNode(rootName, rootValue);
      }
    }
  }
  buildCompactMultiIndex() {
    const definedFaNames = new Set(Object.keys(this.definition));
    for (const [name, value] of Object.entries(this.definition)) {
      const transitions = value;
      const subFaNames = new Set(transitions.map((t) => t[2]).filter((target) => definedFaNames.has(target)));
      const node = { ts: transitions };
      this.index.set(name, { name, transitions, subFaNames, node });
    }
  }
  indexNode(name, node) {
    const subFaNames = /* @__PURE__ */ new Set();
    if (node.states) {
      for (const [stateName, stateValue] of Object.entries(node.states)) {
        if (this.isSubFa(stateValue)) {
          subFaNames.add(stateName);
          this.indexNode(stateName, stateValue);
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
  isSubFa(value) {
    return typeof value === "object" && value !== null && "ts" in value && Array.isArray(value.ts);
  }
};

// node_modules/@vsirotin/ts-stop/lib/esm/sfsm/Sfsm.js
var Sfsm = class {
  constructor(options = {}) {
    var _a, _b;
    this.resolver = null;
    this.stack = [];
    this.commandReceiver = null;
    this.log = [];
    this.processing = false;
    this.signalQueue = [];
    this.options = {
      byMissingData: (_a = options.byMissingData) !== null && _a !== void 0 ? _a : "error",
      byMissingTransition: (_b = options.byMissingTransition) !== null && _b !== void 0 ? _b : "error"
    };
  }
  /** Register the single command receiver for this SFSM instance. */
  setCommandReceiver(receiver) {
    this.commandReceiver = receiver;
  }
  /**
   * Load a FA definition and initialise the engine.
   * The root FA is pushed onto the stack with active state "I".
   * No signal is sent automatically — the caller is responsible for
   * sending the first signal (e.g. "TS.s") to drive out of state I.
   */
  loadFA(definition) {
    this.resolver = new FaResolver(definition);
    const rootName = this.resolver.getRootName();
    this.stack = [{ faName: rootName, currentState: "I" }];
    this.log = [];
    this.processing = false;
    this.signalQueue = [];
  }
  /**
   * Send a signal to the SFSM.
   * If called re-entrantly (from within a command receiver), the signal
   * is queued and will be processed after the current step finishes.
   */
  receiveSignal(signal, data) {
    if (this.processing) {
      this.signalQueue.push({ signal, data });
      return;
    }
    this.processSignal(signal, data);
    while (this.signalQueue.length > 0) {
      const next = this.signalQueue.shift();
      this.processSignal(next.signal, next.data);
    }
  }
  /** Returns the accumulated log entries. */
  getLog() {
    return [...this.log];
  }
  /** Returns the current FA name stack (bottom = index 0, head = last). */
  getCurrentStack() {
    return this.stack.map((f) => f.faName);
  }
  /** Returns the active state of the head FA. */
  getHeadState() {
    if (this.stack.length === 0)
      throw new Error("SFSM: not initialised");
    return this.stack[this.stack.length - 1].currentState;
  }
  // ── Core engine ─────────────────────────────────────────────────────────
  processSignal(signal, data) {
    if (!this.resolver || this.stack.length === 0) {
      throw new Error("SFSM: call loadFA() before sending signals");
    }
    this.processing = true;
    try {
      this.applySignal(signal, data);
    } finally {
      this.processing = false;
    }
  }
  /**
   * Rule 2: find a matching transition, searching from head down the stack.
   * Returns { frameIndex, transition } or null if not found anywhere.
   */
  findTransition(signal) {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const frame = this.stack[i];
      const fa = this.resolver.get(frame.faName);
      const match = fa.transitions.find((t) => t[0] === frame.currentState && t[1] === signal);
      if (match) {
        return { frameIndex: i, toState: match[2], command: match[3] };
      }
    }
    return null;
  }
  applySignal(signal, data) {
    var _a, _b, _c, _d;
    const result = this.findTransition(signal);
    if (!result) {
      this.handleMissingTransition(signal);
      return;
    }
    const { frameIndex, toState, command } = result;
    const stackBefore = this.getCurrentStack();
    const stateBefore = this.stack[frameIndex].currentState;
    const bubbledUp = frameIndex < this.stack.length - 1;
    if (bubbledUp) {
      this.stack.splice(frameIndex + 1);
    }
    this.stack[frameIndex].currentState = toState;
    const rule = bubbledUp ? "2.2.2.1" : "2.1";
    let sentCommand;
    let commandName;
    let receiver;
    if (command) {
      sentCommand = command;
      const meta = this.resolveCommandMeta(frameIndex, command);
      commandName = meta === null || meta === void 0 ? void 0 : meta.name;
      receiver = meta === null || meta === void 0 ? void 0 : meta.receiver;
      const commandData = command.endsWith("$") ? data : void 0;
      if (command.endsWith("$") && data === void 0) {
        this.handleMissingData(signal, command);
      }
      (_a = this.commandReceiver) === null || _a === void 0 ? void 0 : _a.receiveCommand(command, commandData);
    }
    const logEntry = {
      step: this.log.length + 1,
      stack: stackBefore,
      state: stateBefore,
      stateName: (_b = this.resolveStateMeta(frameIndex, stateBefore)) === null || _b === void 0 ? void 0 : _b.name,
      signal,
      signalName: (_c = this.resolveSignalMeta(frameIndex, signal)) === null || _c === void 0 ? void 0 : _c.name,
      rule,
      newStack: this.getCurrentStack(),
      newState: toState,
      newStateName: (_d = this.resolveStateMeta(frameIndex, toState)) === null || _d === void 0 ? void 0 : _d.name,
      command: sentCommand,
      commandName,
      receiver
    };
    this.log.push(logEntry);
    const headFa = this.resolver.get(this.stack[frameIndex].faName);
    if (headFa.subFaNames.has(toState)) {
      this.stack.push({ faName: toState, currentState: "I" });
      this.applySignal(signal, data);
      return;
    }
    if (toState.startsWith("E_")) {
      if (this.stack.length === 1) {
        this.stack[0].currentState = "I";
      } else {
        this.stack.pop();
        this.applySignal(signal, data);
      }
    }
  }
  // ── Meta resolution helpers ──────────────────────────────────────────────
  resolveStateMeta(frameIndex, state) {
    var _a;
    const fa = this.resolver.get(this.stack[frameIndex].faName);
    return (_a = fa.node.states) === null || _a === void 0 ? void 0 : _a[state];
  }
  resolveSignalMeta(frameIndex, signal) {
    var _a;
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const fa = this.resolver.get(this.stack[i].faName);
      if ((_a = fa.node.signals) === null || _a === void 0 ? void 0 : _a[signal])
        return fa.node.signals[signal];
    }
    return void 0;
  }
  resolveCommandMeta(frameIndex, command) {
    var _a;
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const fa = this.resolver.get(this.stack[i].faName);
      if ((_a = fa.node.commands) === null || _a === void 0 ? void 0 : _a[command])
        return fa.node.commands[command];
    }
    return void 0;
  }
  // ── Policy handlers ──────────────────────────────────────────────────────
  handleMissingTransition(signal) {
    var _a;
    const policy = (_a = this.options.byMissingTransition) !== null && _a !== void 0 ? _a : "error";
    const msg = `SFSM: no transition for signal "${signal}" in state "${this.getHeadState()}" (FA: ${this.getCurrentStack().join(">")})`;
    if (policy === "error")
      throw new Error(msg);
    if (policy === "log_warning")
      console.warn(msg);
  }
  handleMissingData(signal, command) {
    var _a;
    const policy = (_a = this.options.byMissingData) !== null && _a !== void 0 ? _a : "error";
    const msg = `SFSM: command "${command}" expects data but signal "${signal}" carries none`;
    if (policy === "error")
      throw new Error(msg);
    if (policy === "log_warning")
      console.warn(msg);
  }
};

// node_modules/@vsirotin/ts-stop/lib/esm/sfsm/FaReducer.js
function reduceFA(definition) {
  const entries = Object.entries(definition);
  if (entries.every(([, v]) => Array.isArray(v))) {
    return definition;
  }
  const result = {};
  const [rootName, rootValue] = entries[0];
  collectNodes(rootName, rootValue, result);
  return result;
}
function collectNodes(name, node, result) {
  result[name] = node.ts;
  if (node.states) {
    for (const [stateName, stateValue] of Object.entries(node.states)) {
      if (isSubFaNode(stateValue)) {
        collectNodes(stateName, stateValue, result);
      }
    }
  }
}
function isSubFaNode(value) {
  return typeof value === "object" && value !== null && "ts" in value && Array.isArray(value.ts);
}

// node_modules/@vsirotin/ts-stop/lib/esm/sfsm/FaUpdater.js
function updateCompactFA(source, update) {
  var _a;
  const result = JSON.parse(JSON.stringify(source));
  const toRemove = new Set((_a = update.remove) !== null && _a !== void 0 ? _a : []);
  for (const name of toRemove) {
    delete result[name];
  }
  for (const transitions of Object.values(result)) {
    const arr = transitions;
    const filtered = arr.filter((t) => !toRemove.has(t[2]));
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
function updateFullFA(source, update) {
  var _a;
  const result = JSON.parse(JSON.stringify(source));
  for (const name of (_a = update.remove) !== null && _a !== void 0 ? _a : []) {
    const rootNode = Object.values(result)[0];
    removeFromNode(rootNode, name);
  }
  if (update.add) {
    const rootKey = Object.keys(result)[0];
    for (const [name, newNode] of Object.entries(update.add)) {
      if (name === rootKey) {
        result[rootKey] = JSON.parse(JSON.stringify(newNode));
      } else {
        const rootNode = Object.values(result)[0];
        replaceInNode(rootNode, name, newNode);
      }
    }
  }
  return result;
}
function removeFromNode(node, targetName) {
  if (!node.states)
    return false;
  if (targetName in node.states && isSubFaNode2(node.states[targetName])) {
    delete node.states[targetName];
    node.ts = node.ts.filter((t) => t[2] !== targetName);
    return true;
  }
  for (const stateValue of Object.values(node.states)) {
    if (isSubFaNode2(stateValue) && removeFromNode(stateValue, targetName)) {
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
    if (isSubFaNode2(stateValue) && replaceInNode(stateValue, targetName, newNode)) {
      return true;
    }
  }
  return false;
}
function isSubFaNode2(value) {
  return typeof value === "object" && value !== null && "ts" in value && Array.isArray(value.ts);
}
export {
  ExternalWorldHub,
  FaResolver,
  Sfsm,
  reduceFA,
  updateCompactFA,
  updateFullFA
};
//# sourceMappingURL=@vsirotin_ts-stop_sfsm.js.map
