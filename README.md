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
diff ::= <edit> | <edit> ',' <diff>
edit ::= <remove> | <insert>
remove ::= <index> | <index> '-' <index>
insert ::= <index> ':' <character>+

index ::= \d+
character ::= [^,\] | '\,' | '\\'
```

For example the diff `0,1:c,7,8:de,10-15` describes the operations:
* delete character at index 0
* insert character `c` at index 1
* delete character at index 7
* insert string `de` at index 8
* delete all characters from index `10` to `15`

## API

### `Diff#constructor(source, target)`

* `source` (string) the original string.
* `target` (string) the target string.

Refer to the documentation inside [src/diff.js](./src/diff.js) for a detailed
documentation of every non-static method of the class.

### `Diff#setSampleDecider(decider)`

* `decider` (function) must return a boolean.

**@return (this)**

Change the function that decides whether to sample or pop during the computation
of the path.

### `Diff#setPostStep(postStep)`

* `postStep` (function)

Set a function to be called after every step of the path computation.

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
Diff.apply(str1, Diff.diff(str1, str2)) == str2
```

## A bit more about the algorithm

The algorithm traverses the edit graph much like how an A\* algorithm would find
the shortest path with the exception that popping is probabilistic. This entails
that the path found may not be the shortest one, however this allows to easily
explore potentially interesting parts of the edit graph.

The score function of a node `n` is:

    score(n) = max(n.x + n.y,  n.x + n.y - d(n, e)  - 2 * n.rootpathLength

where `d` is the l2 norm, `e` is the target to reach in the graph, and
`n.rootpathLength` is the length of the chain of parents to get from `n` to the root.

In every iteration of the algorithm there is a choice to either pick a sample
or to pop from the queue. The condition is:

    random() < t ^ -0.45

where `t` is the number of iteration

### Benchmarks

These numbers are based on 100 trials.

```
> npm run benchmark

Let t be the iteration number


function        time    length          min     max     range
1/t             4.5     1879.38         1835    1885    50
1/sqrt(t)       5.53    1868.72         1787    1897    110
1/log(t)        8.45    1864.28         1789    1905    116
t^-0.666        4.84    1872.22         1791    1891    100
t^-0.333        7.07    1859.26         1781    1899    118
t^-0.125        89.13   1889.6          1833    1933    100
exp(-t/2)       3.97    1881            1881    1881    0
```

With some interesting candidates with 1,000 trials

```
function        time    length          min     max     range
t^-0.666 [1k]   4.85    1874.4          1827    1891    64
t^-0.500 [1k]   4.97    1863.28         1817    1889    72
t^-0.450 [1k]   5.63    1865.1          1775    1895    120
t^-0.333 [1k]   7.09    1859.14         1781    1893    112
```


## License

See [LICENSE](./LICENSE)
