## AI-supported Development Process

Development process according StOP - State Oriented Programming paradigms is supported with skills for AI-agents. 

All relevant skills together with examples and help-files are collected in one directory.

The process contains the steps, listed in the table below. The `*
` in the output column is a placeholder for the name of the project. 
The AI-supported skills are listed in the last column.

| N. | Step | Description | Output |AI-supported skills |
|--|--|--|--|--|
|1|User Story Definition|Creating of User Story inclusive structure description|*-user-story.md|stop-user-story-writer|
|2|Use Case Definition|Creating of Use Case according special rules and format|*-use-cases.md|stop-use-case-writer|
|3|SFSM draft|Transformation of Use Cases in a FA-structure, list of extended transitions and command descriptions|*-extended-transitions.md|stop-sfsm-drafter|
|4|Autonomous SFSM test|Test of SFSM without environment|*-sfsm.json|stop-autonomous-sfsm-tester|
|5|Simulation|Development of simulators and testing of all use cases|simulator and runner code|stop-simulation-developer|
|6|Production|Production code development|production code|stop-production-developer|

When on some step some defect will be detected, the process can be repeated from the step where the defect was developed. 
