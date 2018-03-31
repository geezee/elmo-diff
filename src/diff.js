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
 * // transform input to output using the representation
 * const output = Diff.apply("ABCABBA", repr);
 *
 * assert(output === "CBABAC");
 * ```
 *
 * [Mye86] - https://neil.fraser.name/writing/diff/myers.pdf
 */
module.exports = class Diff {
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

    step() {
        const surrender = Math.random() < 0.8 / Math.sqrt(this.iteration);
        const sampleObj = surrender ? this.queue.sample() : this.queue.pop();
        const sample = sampleObj.item;

        if (this.isTarget(sample)) return;

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

        this.iteration++;
    }

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

    isTarget({x, y}) {
        return x == this.source.length
            && y == this.target.length;
    }

    computePath() {
        this.step();
        while (!(this.endpoint.id in this.nodes)) {
            this.step();
        }

        const path = [];

        let current = this.endpoint.id;
        do {
            path.push(this.nodes[current]);
            current = this.nodes[current].parent;
        } while (current != null && current != 0);

        path.push(this.newPoint(0, 0));

        return path;
    }

    visualize() {
        var str = "";
        for (var x=0;x<this.source.length;x++) {
            for (var y=0;y<this.target.length;y++)
                str += (x * this.source.length + y in this.nodes) ? 'o' : '-';
            str += "\n";
        }
        return str;
    }

    serialize(path) {
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

        path.reverse();

        let result = "";
        for(var i=0;i<path.length-1;i++) {
            const type = transitionType(path[i], path[i+1]);
            if (type == 'i')
                result += path[i].y + ':' + this.target.charAt(path[i].y) + ',';
            else if (type == 'd')
                result += path[i].x + ',';
        }

        return result.substring(0, result.length-1);
    }

    static apply(input, serializedPath) {
        let delOffset = 0;
        let result = input;

        serializedPath.split(',').forEach(op => {
            if (op.length == 0) return;

            op = op.split(':');
            if (op.length > 1) { // insert [index, char]
                let i = op[0];
                result = result.substring(0, i) + op[1] + result.substring(i);
                delOffset--;
            } else { // delete @ index
                let i = op[0] - delOffset;
                result = result.substring(0, i) + result.substring(i+1);
                delOffset++;
            }
        });

        return result;
    }

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
