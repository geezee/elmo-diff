# elmo-diff

[![Build Status](https://travis-ci.org/geezee/elmo-diff.svg?branch=master)](https://travis-ci.org/geezee/elmo-diff)
[![Coverage Status](https://coveralls.io/repos/github/geezee/elmo-diff/badge.svg)](https://coveralls.io/github/geezee/elmo-diff)

Originally [elm-diff](../../../elm-diff), the library has been rewritten in ECMAScript 6
due to performance issues. The algorithm is inspired from Myers' diffing algorithm
that can be found [here](https://neil.fraser.name/writing/diff/myers.pdf), however
it is modified to make it probabilistic and quicker.

This library is not meant to visualize diffs between two strings. Its job is to
produce a diff from two strings and reconstruct a string from a source and a diff.

## Example

```js
// Finding the difference between two strings can be done in two ways

// detailed way:
const diff = new Diff("ABCABBA", "CBABAC");
const path = diff.computePath();
const serialized = diff.serialize(path);
console.log(serialized); // "0,1,1:B,5,5:C"

// or using the wrapper
console.log(Diff.diff("ABCABBA", "CBABAC")); // "0,1,1:B,5,5:C"

// to apply a diff to string
console.log(Diff.apply("ABCABBA", serialized)); // "CBABAC"
```

## Format

The format of the diff can be described as follows:

```
diff ::= <edit> | <edit> , <diff>
edit ::= <remove> | <insert>
remove ::= <index>
insert ::= <index> : <character>

index ::= \d
character ::= .
```

For example the diff `0,1:c,7,8:d` describes the operations:
* delete character at index 0
* insert character `c` at index 1
* delete character at index 7
* insert character `d` at index 8

## API

### `Diff#constructor(source, target)`

* `source` (string) the original string.
* `target` (string) the target string.

Refer to the documentation inside [src/diff.js](./src/diff.js) for a detailed
documentation of every non-static method of the class.

### `static Diff.diff(source, target[, trials = 3])`

* `source` (string) the original string.
* `target` (string) the target string.
* `trials` (uint) the number of trials to do before returning the shortest path found (default 3).

**@return (string)**

Output a serialized diff path. Due to the probabilistic nature of the algorithm
the operation is done many times, the shortest diff is chosen to be returned.
By default 3 trials are done.

### `static Diff.apply(input, serializedPath)`

* `input` (string) the input to apply the diff to.
* `serializedPath` (string) a serialized diff produced by the module

**@return (string)**

Assuming the format of `serializedPath` is as expected, output the edit operations
described in the diff to the input.

(In theory) the following should always be correct:
```js
Diff.apply(str1, Diff.serialize(str1, str2)) == str2
```

## A bit more about the algorithm

The algorithm traverses the edit graph much like how an A\* algorithm would find
the shortest path with two exceptions:
- the algorithm terminates as soon as it reaches the end
- the algorithm uses a custom priority queue whose popping operation is probabilistic;
  a popped element is a sample chosen at random from the queue where each element's
  probability of being chosen is related to its priority.


## License

See [LICENSE](./LICENSE)
