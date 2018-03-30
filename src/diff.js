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
class Diff {
    constructor(source, target) {
        this.source = source;
        this.target = target;

        this.counter = 0;

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
        const sampleObj = this.queue.sample();
        const sample = sampleObj.item;

        if (this.isTarget(sample)) return;

        this.queue.remove(sampleObj.index);
        this.getNeighbors(sample).forEach(point => {
            const {x, y} = point;
            const de = Math.hypot(x-this.endpoint.x, y-this.endpoint.y);
            const score = Math.max(x+y, x + y - de);

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

        if (x == this.endpoint.x && y == this.endpoint.y)
            return [ this.endpoint ];
        if (x + 1 <= this.source.length)
            neighbors.push(followDiagonal({ x: x+1, y: y }));
        if (y + 1 <= this.target.length)
            neighbors.push(followDiagonal({ x: x, y: y+1 }));
        if (this.source.charAt(x) == this.target.charAt(y))
            neighbors.push(followDiagonal({ x: x+1, y: y+1 }));

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
    }

    static apply(input, serializedPath) {

    }

}
