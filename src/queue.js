const helpers = require('./helpers.js');

/**
 * An implementation of a max-priority queue using a binary heap. The queue also
 * allows for weighted random sampling based on the priority of every item.
 *
 * All priorities are assumed to be non-negative integers.
 *
 * Here's the runtime for every operation assuming the queue has n items:
 *
 * size                 O(1)
 * isEmpty()            O(1)
 * push(item, score)    O(log n)
 * pop()                O(log n)
 * remove(index)        O(log n)
 * sample()             O(n)
 *
 * @author george
 */
module.exports = class PriorityQueue {
    constructor() {
        this.items = [];
    }

    /**
     * Find the size of the priority queue
     *
     * @return number
     */
    get size() {
        return this.items.length;
    }

    /**
     * Check if the queue is empty or not
     *
     * @return boolean
     */
    isEmpty() {
        return this.size == 0;
    }

    /**
     * Push the provided item on the queue with the provided priority
     *
     * @param item  {any} the item to be pushed
     * @param score {uint} the priority of the item
     *
     * @return PriorityQueue allows chaining
     */
    push(item, score) {
        let i = this.size;
        this.items.push({ item: item, score: score });

        while (i > 0) {
            let parent = Math.floor((i-1) / 2);

            if (this.items[parent].score < this.items[i].score)
                helpers.swap(this.items, i, parent);
            else break;

            i = parent;
        }

        return this;
    }

    /**
     * Retrieve the element with the highest priority and remove it from the
     * priority queue
     *
     * @return any
     */
    pop() {
        return this.remove(0);
    }

    /**
     * Retrieve the element with the highest priority without removing it from
     * the priority queue
     *
     * @return any
     */
    peep() {
        if (this.size > 0) return this.items[0];
    }

    /**
     * Retrieve a sample from the queue. The sample is chosen at random according
     * to its relative weight wrt to the queue elements. The element is not
     * removed from the queue
     *
     * @return any
     */
    sample() {
        if (this.size == 0) return;

        var sample = null;

        for (var i = 0; i < this.size; i++) {
            const item = this.items[i];
            item.key = Math.pow(Math.random(), 1.0 / (item.score+1));
            item.index = i;

            if (i < 1) sample = this.items[i];
            else if (item.key > sample.key) sample = item;
        }

        return sample;
    }

    /**
     * Remove the element from the queue with the provided index. The index
     * is relative to the implementation.
     *
     * @param index {uint} the index of the element to remove
     *
     * @return any
     */
    remove(index) {
        if (index >= this.size) return;

        helpers.swap(this.items, index, this.size-1);
        const root = this.items.pop();

        let i = index;
        while (i < this.size) {
            let child1 = 2 * i + 1;
            let child2 = 2 * i + 2;
            let max_child = 0;

            if (child1 >= this.size) break;
            else if (child2 >= this.size) max_child = child1;
            else max_child = helpers.i_maxScore(this.items, child1, child2);

            if (this.items[max_child].score > this.items[i].score) {
                helpers.swap(this.items, i, max_child);
                i = max_child;
            } else break;
        }

        return root;
    }

    /**
     * Return a string representation of a queue
     *
     * @return string
     */
    get toString() {
        return this.items.map(i => i.item + ' ('+i.score+')').join(', ');
    }
}
