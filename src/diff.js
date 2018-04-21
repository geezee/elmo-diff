const PriorityQueue = require('./queue.js');

/**
 * A quick diffing algorithm inspired by [Mye86]. This implementation does not
 * always provide the smallest diff, or the "best". The algorithm can find a
 * diff that has a small (edit) length.
 *
 * @author george
 *
 * @example
 * ```
 * // to setup the diff algorithm
 * const diff = new Diff("ABCABBA", "CBABAC");
 *
 * // compute a short edit path
 * const path = diff.computePath();
 *
 * // diffing representation
 * const repr = diff.serialize(path);
 *
 * // or you can do it directly like this
 * const repr2 = Diff.diff("ABCABBA", "CBABAC");
 *
 * // transform input to output using the representation
 * const output = Diff.apply("ABCABBA", repr);
 *
 * assert(output === "CBABAC");
 * ```
 *
 * [Mye86] - https://neil.fraser.name/writing/diff/myers.pdf
 */
module.exports = class Diff {

    /**
     * Initialize the environment for the diffing.
     *
     * @param source    {string} the original string
     * @param target    {string} the target string
     */
    constructor(source, target) {
        if (source == "") throw "Source cannot be empty";
        if (target == "") throw "Target cannot be empty";

        this.source = source;
        this.target = target;

        this.iteration = 0;

        this.queue = new PriorityQueue();
        this.queue.push(this.newPoint(0, 0), 1);

        this.nodes = {};

        this.endpoint = this.newPoint(this.source.length, this.target.length);

        this.sampleDecider = () =>
            Math.random() < Math.pow(this.iteration, -0.45);

        this.postStep = function() { };
    }

    /**
     * Change the function that decides whether to sample or pop during the
     * computation of the path.
     *
     * @param decider {function : _ -> Bool}
     *
     * @return {Diff}
     */
    setSampleDecider(decider) {
        if (typeof decider == "function")
            this.sampleDecider = decider;
        return this;
    }

    /**
     * Set a function to be called after every step of the path computation.
     *
     * @param postStep {function}
     *
     * @return {Diff}
     */
    setPostStep(postStep) {
        if (typeof postStep == "function")
            this.postStep = postStep;
        return this;
    }

    newPoint(x, y) {
        return {
            x: x,
            y: y,
            id: x * this.source.length + y,
            dlength: 0,
            parent: null
        };
    }

    /**
     * Perform a step in computing a path
     */
    step() {
        this.iteration++;

        const shouldSample = this.sampleDecider();
        const sampleObj = shouldSample ? this.queue.sample() : this.queue.pop();
        const sample = sampleObj.item;

        if (this.isTarget(sample))
            return true;

        this.queue.remove(sampleObj.index);
        this.getNeighbors(sample).forEach(point => {
            const {x, y, dlength} = point;
            const de = Math.hypot(x-this.endpoint.x, y-this.endpoint.y);
            const score = Math.max(x+y, x + y - de) - 2 * dlength;

            point.dlength = sample.dlength + 1;

            if (point.id in this.nodes && this.nodes[point.id].dlength > point.dlength) {
                this.nodes[point.id].parent = sample.id;
                this.nodes[point.id].dlength = point.dlength;
            } else {
                point.parent = sample.id;
                this.queue.push(point, score);
                this.nodes[point.id] = point;
            }
        });

        this.postStep();

        return false;
    }

    /**
     * Compute the possible neighbors in the edit graph. If it's possible to
     * go along a diagonal, i.e. there is no changes to be done then the diagonal
     * point is the only neighbor. Otherwise the node to the right/bottom of the
     * node are the neighbors
     *
     * @param node    {Object.{x: uint, y: uint}} the node to compute its neighbors
     *
     * @return {List.{x: uint, y: uint}}
     */
    getNeighbors({x, y}) {
        const followDiagonal = ({x, y}) => {
            while (x < this.source.length && y < this.target.length
                && this.source.charAt(x) == this.target.charAt(y)) {
                x++;
                y++;
            }
            return this.newPoint(x, y);
        }

        const neighbors = [];
        const hasDiagonal = this.source.charAt(x) == this.target.charAt(y);

        if (x == this.endpoint.x && y == this.endpoint.y)
            return [ this.endpoint ];
        if (!hasDiagonal) {
            if (x + 1 <= this.source.length)
                neighbors.push(followDiagonal({ x: x+1, y: y }));
            if (y + 1 <= this.target.length)
                neighbors.push(followDiagonal({ x: x, y: y+1 }));
        } else neighbors.push(followDiagonal({ x: x+1, y: y+1 }));

        return neighbors
    }

    /**
     * Check if the point in question is the target node in the edit graph,
     * i.e. the bottom-most right-most node in the edit graph
     *
     * @return {boolean}
     */
    isTarget({x, y}) {
        return x == this.source.length
            && y == this.target.length;
    }

    /**
     * Perform iteration steps till the endpoint is reached, then compute a
     * path from the endpoint to the start and return it. The list starts with
     * the endpoint and ends with the starting point. In the list any node at
     * index i will have its parent at index i+1.
     *
     * @return {List.{x: uint, y: uint}}
     */
    computePath() {
        while(!this.step());

        const path = [];

        let current = this.endpoint.id;
        do {
            path.push(this.nodes[current]);
            current = this.nodes[current].parent;
        } while (current != null && current != 0);

        path.push(this.newPoint(0, 0));

        return path;
    }

    /**
     * Draw the edit graph with visited nodes highlighted
     *
     * @return {string}
     */
    visualize() {
        var str = "";
        for (var x=0;x<this.source.length;x++) {
            for (var y=0;y<this.target.length;y++)
                str += (x * this.source.length + y in this.nodes) ? 'o' : '-';
            str += "\n";
        }
        return str;
    }

    /**
     * Produce a representation of a path according to the format described
     * in the README file. Usually the input to this function is a result
     * of calling Diff#computePath()
     *
     * @param path  {List.{x: uint, y: uint}} the path to serialize
     *
     * @return {string}
     */
    serialize(path) {
        /* A transition is an insert (along y) or a delete (along x), it's also
         * followed by a tail; a long diagonal. To find the transition type
         * between (x1, y1) and (x2, y2) we need to unwind the diagonal and
         * then we can decide
         */
        function transitionType(src, trgt) {
            let source = { x: src.x, y: src.y },
                target = { x: trgt.x, y: trgt.y };

            if (source.x == target.x && source.y == target.y)
                throw "No transition can be done";

            let m = Math.min( Math.abs(source.x - target.x),
                              Math.abs(source.y - target.y) );
            target.x -= m;
            target.y -= m;

            if (source.x == target.x && source.y + 1 == target.y) return "i";
            else if (source.x + 1 == target.x && source.y == target.y) return "d";
        }

        function char_escape(chr) {
            switch (chr) {
                case ',': return '\\,';
                case '\\': return '\\\\';
                default: return chr;
            }
        }

        path.reverse();

        let result = "";
        for(var i=0;i<path.length-1;i++) {
            const par = i - 1 > 0 ? path[i-1] : null;
            const node = path[i];
            const succ = i + 1 < path.length - 1 ? path[i+1] : null;

            const type = transitionType(path[i], path[i+1]);

            if (succ != null) succ.parent_type = type;
            if (node != null) node.type = type;
            if (succ !== null) succ.type = transitionType(path[i+1], path[i+2]);

            // Sorry for the ugly syntax, i'll explain:
            if (type == 'i') {
                /* It's not efficient to output `4:A,5:B,6:C`, it's better to store
                 * it as `4:ABC`. This merger of inserts can be decided in the second,
                 * third, etc... insert. It's not only sufficient to test if the parent
                 * is also an insert, consider `0:A,1:B,3:C` it's not correct to merge
                 * it as `0:ABC`, the correct way would be `0:AB,3:C`. So the current
                 * insert index must be the successor of the parent's
                 */
                let c = char_escape(this.target.charAt(node.y));
                let validPar = typeof par === 'object' && par !== null;

                result += node.parent_type == 'i' && validPar && par.y + 1 == node.y
                    ? c
                    : ',' + node.y + ':' + c;

            } else if (type == 'd') {
                /* It's also not efficient to output `7,8,9,10,11,12,13,14` instead
                 * we can output `7-14`
                 *
                 * The start of a range satisfies one of the following:
                 * i.   start of the path
                 * ii.  parent is an insert
                 * iii. parent doesn't delete at the previous index
                 *
                 * The end of a range satisfies one of the following:
                 * i.   end of the path
                 * ii.  successor is an insert
                 * iii. successor doesn't delete at the next index
                 *
                 * Singletons satisfy both start and end of path.
                 */
                const start = (par === null)
                           || (par !== null &&
                                   ((par.type == 'i')
                                 || (par.type == 'd' && par.x + 1 < node.x)));

                const end = (succ === null)
                         || (succ !== null &&
                                  ((succ.type == 'i')
                                || (succ.type == 'd' && succ.x - 1 > node.x)));

                if (start) result += ',' + node.x; // singletons and start of ranges
                if (!start && end) result += '-' + node.x; // end of ranges
            }
        }

        return result.substr(1);
    }

    /**
     * Assuming the format of `serializedPath` is as expected, output the edit
     * operations described in the diff to the input.
     *
     * @param input {string} the input to apply the diff to.
     * @param serializedPath {string} a serialized diff produced by the module
     *
     * @return {string}
     */
    static apply(input, serializedPath) {
        let delOffset = 0;
        let result = input;

        function apply_op(op) {
            let matches;
            if ((matches = /^(\d+):(.*)$/g.exec(op)) !== null) {
                let i = parseInt(matches[1]);
                result = result.substring(0, i) + matches[2] + result.substring(i);
                delOffset -= matches[2].length;
            } else if ((matches = /^(\d+)-(\d+)$/g.exec(op)) !== null) {
                let start = parseInt(matches[1]) - delOffset,
                    end = parseInt(matches[2]) - delOffset;
                result = result.substring(0, start) + result.substring(end+1);
                delOffset += end - start + 1;
            } else if ((matches = /^(\d+)$/g.exec(op)) !== null) {
                let i = parseInt(op) - delOffset;
                result = result.substring(0, i) + result.substring(i+1);
                delOffset++;
            } else {
                throw "Operation not valid: " + op;
            }
        }

        let op = '';
        let escaped = false;

        for (var i=0;i<serializedPath.length;i++) {
            if (serializedPath.charAt(i) == ',' && !escaped) {
                apply_op(op);
                op = '';
            } else if (serializedPath.charAt(i) == '\\' && !escaped) {
                escaped = true;
                continue;
            } else {
                op += serializedPath.charAt(i);
                escaped = false;
            }
        }

        if (op.length > 0) {
            apply_op(op);
        }

        return result;
    }

    /**
     * Output a serialized diff path. Due to the probabilistic nature of the
     * algorithm the operation is done many times, the shortest diff is chosen
     * to be returned. By default 3 trials are done.
     *
     * @param source    {string} the original string
     * @param target    {string} he target string
     * @param trials    {uint} the number of trials to do before returning the
     *                  shortest path found (default 3)
     *
     * @return {string}
     */
    static diff(source, target, trials = 3) {
        let shortest = null;
        for(var _=0;_<trials;_++) {
            const diff = new Diff(source, target);
            const path = diff.computePath();
            if (shortest == null || path.length < shortest.length)
                shortest = path;
        }
        return new Diff(source, target).serialize(shortest);
    }

}
