# elmo-diff

Originally [elm-diff](../../../elm-diff), the library has been rewritten in ECMAScript 6
due to performance issues. The algorithm is inspired from Myers' diffing algorithm
that can be found [here](https://neil.fraser.name/writing/diff/myers.pdf), however
it is modified to make it probabilistic and quicker.

The algorithm traverses the edit graph much like how an A\* algorithm would find
the shortest path with two exceptions:
- the algorithm terminates as soon as it reaches the end
- the algorithm uses a custom priority queue whose popping operation is probabilistic;
  a popped element is a sample chosen at random from the queue where each element's
  probability of being chosen is related to its priority.

The library is still in development
