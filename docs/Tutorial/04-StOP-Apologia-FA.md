## Apologia for Finite Automata

The approach proposed below consists of using finite automata (FA) as the "primary" means for programming the behavior of modern software systems, particularly those oriented toward human interaction and utilizing various types of agents, including AI-based ones.

On one hand, in academic circles there were many enthusiasts who proposed and even imposed in their courses, books, and articles the widespread use of FA. Unfortunately, the respected professors could not convince the technical community of the possibility of their truly wide application, since they did not offer understandable methodologies and convenient tools for using FA.

On the other hand, in some specialized, narrow areas of programming, for example, in compiler construction, FA have played a central role for decades. The FA used in these areas are sometimes very diverse, interesting, and critically important. However, FA have not yet broken out of these areas into the mainstream of programming.

What's the issue?

From my point of view, programming still suffers from the "assembly language legacy," when a program was understood as a set of data and operators. Since then, theoretical and practical computer science have advanced very far in understanding and developing methods for working with data. Data structures such as sets, lists, and arrays have been identified, studied, and implemented as language elements. For more complex data structures such as trees or sets of relationally interconnected tables, powerful tools external to programming languages have appeared in the form of libraries or databases.

But the generalization of the operator from assembly language became the very vague concept of an algorithm.

As a result, the prevailing concept of object-oriented programming today defines an object as a collection of data and functions for processing it. (I won't go into the details of object definitions by opposing OOP schools here, but am trying to reflect the essence).

And as a result, when programmers begin to analyze a new problem and comprehend approaches to its solution, they manage to "discern" in the problem statement the data structures inherent to the described object, but they simply don't see the behavioral structures inherent to it.

I can imagine that over time, a separate term will be used to denote behavioral structures. For now, we will use this one, understanding it as patterns that allow us to better understand, implement, and verify object behavior.

As I mentioned above, modern programmers don't "see" behavioral structures.

To "see" something, you need to "know" it and be able to distinguish it from dissimilar and similar things. Children achieve this through numerous training sessions with repetitions. But at the beginning there are annoying failures. A small child seems to have learned to distinguish dad from mom and babble "Mama" and "Papa" at the sight of them, but when an uncle with a mustache like dad's approaches their crib, the child greets him with the word "Papa"!

Adults have it easier. In order to classify something, they can use a formal definition. They apply the formal definition to the object or phenomenon being classified and make a decision about its belonging to a category. However, they still need to have a "trained eye" to see candidates for classification. Stories about detectives known from literature provide many examples of this. Therefore, below we will not only give a definition of FA, but will also consider some examples of FA of various types.