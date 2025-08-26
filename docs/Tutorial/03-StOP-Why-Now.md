## Why a New Programming Approach Has Become Necessary

Before proceeding to describe the details of the proposed approach, I would like to answer a question that may have already arisen in the reader's mind: why has the author decided to propose it to widespread attention precisely now?

Indeed, concepts such as states and "containers" for states - finite automata of all possible varieties - have not only been applied in IT for decades, but have also been universally studied in computer science courses for a very long time.

Moreover, even at the dawn of computerization, great hopes were associated with them. For example, in the eighties, the well-known specialist Doug Ross from SofTech company predicted that in the future, 80 to 90% of information products would be based on finite automaton theory [2].

Repeated attempts were made to write libraries for working with states in popular programming languages, for example [3].

During the heyday of UML, attempts emerged to create direct interpreters of UML diagrams into code (Executable UML [4]).

And finally, in the world of large systems, especially in the enterprise world, there exists a large number of tools for creating and subsequently executing various kinds of processes (workflows).

Is all this not sufficient? Or does the author see some trend that logically leads to the necessity of using a new concept?

Both.

The trend of programming automation is practically as old as programming itself. When transitioning from assembly language to algorithmic languages, programmers lost the headache of worrying about loading commands and data into fast registers. Then problems with null pointers became a thing of the past. The power of libraries grew, where one function call freed developers from the necessity of writing hundreds, or even thousands of lines of code. Powerful IDEs appeared, allowing for laying foundations, efficiently developing, compiling, and even deploying software systems to servers.

But quite recently, quantity began to transform into quality. I'm referring to the emergence of modern AI systems, including programming automation based on GPT. These innovations not only spawned a programming style in dialogue with AI, but also led to a shift from graphical "form-based" interfaces to dialogue-mode interfaces.

Today, the market demands systems that interact with various AI-based agents and with which users communicate as they would with humans in dialogue mode, by voice or in chat. Such systems, from the user's perspective, are "multi-faceted" or, expressed in technical language - can act in various roles.

And although I have previously often and successfully used concepts of state, role, and finite automata in my projects, considering the above, I decided to attempt to "push states inside objects" and thereby make them represent multiple roles to the external world.

Well, now it's time to move on to a detailed enumeration of the approach's features (or requirements for it) and concrete examples.

## References

[2] Doug Ross, SofTech predictions on finite automaton theory applications (1980s)
[3] State-Oriented Programming. Miko Samek and Paul Montgomery. Link (checked at 1.7.2025): https://github.com/QuantumLeaps/State-Oriented-Programming/blob/master/State-Oriented_Programming.pdf
[4] Stephen Mellor, Marc Balcer, Elizabeth Ryan. Executable UML: A Foundation for Model-Driven Architecture. Addison-Wesley Professional. 2002. ISBN-13  :  978-0201748048.