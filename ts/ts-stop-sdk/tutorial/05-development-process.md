## AI-supported Development Process

Development process according StOP - State Oriented Programming paradigms is supported with skills for AI-agents. 

All relevant skills together with examples and help-files are collected in one directory.

Skills are delivered inside SToP SDK NPM project and can be also loaded from [GitHub](https://github.com/vsirotin/StOP/blob/2b4c86114254a7a7a1c89103958c769755eb0b5d/.github/skills/state-oriented-programming)

The process contains the steps, listed in the table below. The `*
` in the output column is a placeholder for the name of the project. 
The AI-supported skills are listed in the last column.

| N. | Step name| Step description | Step-Output |AI-supported skills |
|--|--|--|--|--|
|1|User Story Definition|Creating of User Story inclusive structure description|*-user-story.md|stop-user-story-writer|
|2|Business Model Definition|Creating of Business Model according special rules and format|Many files include BPMN-like state machine|business-modeller|
|3|SFSM modeling|Transformation Business Model into SFSM model|Many files include extended SFSM and tests|stop-sfsm-modeller|
|4|Integration SFSM in production code|Sure, step-by-step integration of SFSM into production code.|Many files depends on project structure|stop-sfsm-integrator|

When on some step some defect will be detected, the process can be repeated from the step where the defect was developed.

This chapter will be extended in the future with more details and examples for each step.