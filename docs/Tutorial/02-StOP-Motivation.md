# StOP Motivation

## Introduction, or What's Wrong with OOP

In my article [1], I expressed the conviction that programming (in the broad sense of the word) is the materialization of ideas, or more precisely - the materialization of programmers' mental models (representations of the domain to be implemented in software) into code. However, this process does not occur directly. When planning the implementation of parts of a future system, a programmer inevitably constructs a mental model of the future program code in their head, and then directly "materializes" this model into code in one programming language or another.

Viewing programming from this perspective, it becomes obvious that the programming process - i.e., the translation of mental models into programming language code - will be more effective the closer the capabilities provided by programming languages are to people's basic mental models.

The concepts of modern programming languages are much closer to our mental models than they were in the era of widespread assembly language use or early algorithmic languages. I don't mean basic programming language elements like arrays or loops, but powerful concepts of object-oriented programming (OOP), such as classes, polymorphism, or inheritance. Very effective paradigms in certain domains, such as functional or reactive programming, have been built on top of them.

However, object-oriented programming with its central element - the object as a collection of attributes and functions - is clearly insufficient for effectively materializing mental models of modern real or imaginary entities. An object from OOP describes simple technical elements well, or complex elements considered from only one perspective.

Let's consider a classic example from object-oriented programming textbooks. From an abstract Employee class, concrete Engineer and Manager classes are built, from which a Director class is constructed. The last three classes inherit the attributes and functions of Employee, but also have their own specific attributes for their profession or role in the organization.

But in real life, it happens that an Engineer can also act in the role of a Manager or vice versa! To reflect such situations within the OOP framework, it's necessary to go beyond the concept and apply various kinds of superstructures.

Yet the ability to act in different roles is a characteristic property of complex technical and social systems.

The same airplane in the air and on the taxiway represents very different technical systems; your mobile phone during a call, text exchange, chat, or video display behaves completely differently. And you, dear readers, throughout the day exist in a large number of different states and roles.

Currently, in OOP and corresponding programming languages, the dialectically related concepts of state and role are not defined.

It's time to correct this deficiency.

## Role and State

In the context we're considering (mental models on one side and programming in the broad sense of the word on the other), the concepts of role and state are dialectically connected.

Let's start with the concept of role.

At an intuitive and unconscious level, small children encounter these concepts when they notice that mom singing a lullaby before bedtime and the same mom feeding them with a spoon are actually different. They differ in the words spoken, actions, and reactions to the child's actions. We can say that the same mom acted in different roles in these two cases. Speaking in programming terms - the same object named "mom" uses different interfaces in relation to the child.

When the child grows up, they will master at least several roles themselves. For example - a student at school and a striker on the neighborhood team. Intuitively, they will understand that being in different roles requires different kinds of mindset, concentration, thoughts in their head, etc. In other words - different states.

In this example, we see that the concepts of role and state are closely related, can be properly considered and understood only in conjunction, and that deepening understanding of one of these concepts automatically leads to deepening understanding of the other. That is, they are dialectically connected.

Note that this applies not only to the relationship between mother and child, not only to various social domains, but also to technical ones. The airplane mentioned above can fly and move on the runway, acting in the first case as an aircraft and in the second - as a ground vehicle.

At the same time, the concept of role always concerns the external aspects of the considered technical, social, etc. object, its ways of interacting with other objects in the world external to it. State, on the contrary, reflects its internal configuration, current internal parameters, sometimes - structure.

## References

[1] Viktor Sirotin. RPSE: Reification as Paradigm of Software Engineering  
https://arxiv.org/abs/1810.01904