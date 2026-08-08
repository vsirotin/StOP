---
name: business-modeler
description: Interactive Business Modeler according to BPMN (Business Process Model and Notation) standard. Given an existing user story, elicits missing details through structured questioning and produces a complete, traceable, professionally written business model artifacts.
metadata:
  author: vsirotin
  version: "1.0"
---


## Prerequisites

User should provide the paths for:
- the `user story` file (e.g., `turnstile/user-story.md`)
- the `directory for output files` (e.g., `turnstile/business-model`)

When this information is not provided, request it from the user before proceeding.

---

## Output Structure

The output directory contains the following files:

```
- business-use-cases.md  # Use cases definition according to BPMN standard.
- swimlanes.md  # Swimlane definitions according to BPMN standard.
- state-machine.md  # State machine definition according to BPMN standard.
```

## Workflow overview

Step 1: Creation of business-use-cases.md
Step 2: Creation of swimlanes.md
Step 3: Creation of state-machine.md (top levels)
Step 4: Extend the state machine in state-machine.md with sub-states

## Workflow details

### Step 1: Creation of business-use-cases.md

#### Action
Use the information from paragraph `Behavioral Overview` in the `user story` to identify and define the business use cases. If the user story file does not contain a `Behavioral Overview` or `Structure Overview` section, inform the user and ask them to provide this information before proceeding. 

Each use case should have:
- a name, 
- a description, 
- list the actors (external objects, e.g. humans) 
- list of involved internal objects.

The description should be a concise description of input, important steps and output of the use case.

Internal objects are the objects from paragraph `Structure Overview` in the `user story` that are involved in the use case.

#### Output Format

By writing of result into file `business-use-cases.md` use the following format like:

```markdown
# UC-<number started with 01>: <use case name>
## Description
<description of the use case>
## Actors
- <actor 1>
- <actor 2>
## Internal objects
- <internal object 1>
- <internal object 2>
```

For example, for the turnstile user story, some business use cases could be defined as follows:

```markdown
# UC-01: Coin Payment, change needed
## Description
The user inserts a valid coin into the coin slot. The turnstile validates the coin, dispenses change if needed, and unlocks the rotating arm for passage and switches the light indicator from red to green. The user retrieves the change from the artifact-box and passes through the turnstile. The push sensor sends a signal to the turnstile and it automatically locks the arm and switches the light indicator back to red.
## Actors
- User
## Internal objects
- Coin slot
- Coin-receiver
- Weight-checker
- Form-checker
- Change dispenser
- Locking mechanism
- Light indicator
- Push sensor

# UC-02: Coin Payment, coin have bad weight
## Description
The user inserts an invalid coin (bad weight)into the coin slot. The turnstile validates the coin, returns it to the user, and remains locked. Light indicator stays red. Sound indicator emits a warning signal.
## Actors
- User
## Internal objects
- Coin slot
- Coin-receiver
- Weight-checker
- Locking mechanism
- Light indicator
- Sound indicator
```

#### Quality check
1. Check if all business cases together are enough to cover the functionality described in paragraph `Behavioral Overview` of the `user story` and so can be used by acceptance test team to verify the system.
2. Check if all internal objects from paragraph `Structure Overview` that participate in behaviors described in `Behavioral Overview` are assigned to at least one use case.
3. Check if all use cases are described in a concise and clear way.
4. Check if all use cases have a unique name and number.
5. Check if all use cases have a description, actors, and internal objects.

When the quality check is passed, proceed to Step 2. Otherwise, ask the user to clarify the use case definitions and repeat Step 1. If after two clarification rounds the quality check still fails, present the best current output to the user with a summary of unresolved issues and ask whether to proceed or abort. 

### Step 2: Creation of swimlanes.md

#### Action

Use the information from paragraph `Behavioral Overview` in the `user story` to identify and try to define the swimlanes according BPMN standard. Divide the internal objects listed in paragraph `Structure Overview` into swimlanes, using paragraph `Behavioral Overview` to understand each object's behavioral role.

#### Output Format

By writing of result into file `swimlanes.md` use the following format like:

```markdown
# Swimlane <sub-process name>

This swimlane contains the objects, that <selection criteria> is responsible for.

<object name> - <role of the object in the sub-process>
```


For example, for the turnstile user story, some swimlanes could be defined as follows:

```markdown

# Swimlane User interaction

This swimlane contains objects that user directly touches or perceives.

coin slot - The slot where the user inserts coins to pay for access.
```
 #### Quality check

Check if: 
1. All objects from paragraph `Behavioral Overview` are assigned to swimlanes. 
2. If some object is assigned to two or more swimlanes, check if it is justified.

When the quality check is passed, proceed to Step 3. Otherwise, ask the user to clarify the swimlane definitions and repeat Step 2.

### Step 3: Creation of state-machine.md (top levels)

#### Action
Use the information from paragraph `Behavioral Overview` in the `user story` and the swimlanes defined in Step 2 to identify and define the top-level states of the system according to BPMN standard.

#### Output Format

By writing of result into file `state-machine.md` use the following format like:

```markdown
# State Machine <system name>

## 1. Top-level States

- <top-level state 1> - <description of the top-level state 1>
- <top-level state 2> - <description of the top-level state 2>
- ...

## 2. Events, that trigger transitions between top-level states

- <event 1> - <description of the event 1>
- <event 2> - <description of the event 2>
- ...

## State machine (textual representation)

STATE <top-level state 1> 
    ON <event 1> -> <top-level state 2>
    <event 2> and <event 3> -> <top-level state 3>
    ...

```

For example, for the turnstile user story, some top-level states could be defined as follows:

```markdown
# State Machine Turnstile

## 1. Top-level States
- Locked - The turnstile is locked and does not allow passage.
- Unlocked - The turnstile is unlocked and allows passage.
...

## 2. Events, that trigger transitions between top-level states
- Coin inserted - A valid coin is inserted into the coin slot.
- Banknote inserted - A valid banknote is inserted into the banknote slot.

## State machine (textual representation)
STATE Locked
    ON Coin inserted -> Payment processing
    ON Banknote inserted -> Payment processing
    ON Hardware fault detected -> ServiceState
STATE Payment processing
    ON CoinValid AND ChangeNeeded AND ChangeAvailable -> Unlocked
    ON CoinValid AND ChangeNeeded AND ChangeNotAvailable -> ServiceState
    ON CoinValid AND ChangeNotNeeded -> Unlocked
    ON BanknoteValid AND ChangeNeeded AND ChangeAvailable -> Unlocked
    ...
...
```

### Step 4: Extend the state machine in state-machine.md with sub-states

#### Action
Use the information from paragraph `Behavioral Overview` in the `user story`, the swimlanes defined in Step 2, and state-machine, defined in Step 3 to identify and define the sub-states of the system according to BPMN standard.

Analyze each event in the state machine and decide if it is an atomic or a composite with internal behaviour. If it is a composite event, define its sub-states and events that trigger transitions between it and parent state.

The main criteria for defining sub-states: Is this event produces by only one object from paragraph `Structure Overview` in the `user story`? If yes, then it is atomic. If no, then it is composite.

For example an event `Coin inserted` is produced by the only object `coin-receiver`. The object `coin-slot`is a candiate, but it is passive.

Otherwise, an event `CoinValid` is produced by many objects: `coin-receiver`, `weight-checker`, `form-checker`. So it is composite and should be replaced with some sub-state. This sub state can have a name `Coin validation` and it can have sub-states `Weight check`, `Form check`. It will have as input parent't input `Coin inserted` and as output parent't output `CoinValid` or `CoinInvalid`.

So the state machine will will be after this extension:

```markdown
## State machine (textual representation)
STATE Locked
    ON Coin inserted -> Payment processing
    ON Banknote inserted -> Payment processing
    ON Hardware fault detected -> ServiceState
STATE Payment processing
    ON Coin inserted -> Coin validation
    ON CoinValid AND ChangeNeeded AND ChangeAvailable -> Unlocked

STATE Coin validation
    ON Coin inserted -> Weight check
...

```

You should try to define recursively sub-states for all composite events in the state machine. If you are not sure about some event, ask the user to clarify it.





