const assert = require('assert');
const PriorityQueue = require('../src/queue.js');

describe('PriorityQueue', function() {
    describe('#size()', function() {
        it('size of fresh object is 0', function() {
            assert.equal(new PriorityQueue().size, 0);
        });
        it('size after push is 1', function() {
            assert.equal(new PriorityQueue().push(0, 1).size, 1);
        });
        it('size after push and pop is 0', function() {
            const q = new PriorityQueue();
            q.push(0, 1).pop();
            assert.equal(q.size, 0);
        });
    });


    describe('#isEmpty()', function() {
        it('true for fresh object', function() {
            assert.ok(new PriorityQueue().isEmpty());
        });
        it('false after push', function() {
            assert.ok(! new PriorityQueue().push(1, 0).isEmpty());
        });
        it('true after push and pop', function() {
            const q = new PriorityQueue();
            q.push(0, 1).pop();
            assert.ok(q.isEmpty());
        });
    });


    describe('#pop() and #peep()', function() {
        it('pop/peep empty queue is undefined', function() {
            assert.equal(new PriorityQueue().peep(), undefined);
            assert.equal(new PriorityQueue().pop(), undefined);
        });
        it('pop/peep queue with one element is the inserted element', function() {
            const q = new PriorityQueue();
            q.push(1, 0);
            assert.equal(q.peep().item, 1);
            assert.equal(q.pop().item, 1);
        });
        it('pop/peep queue with two elements returns the one with largest priority', function() {
            const q1 = new PriorityQueue();
            const q2 = new PriorityQueue();
            const bs = Math.random()*200;
            q1.push('a', bs); q1.push('b', bs+1);
            q2.push('b', bs+1); q2.push('b', bs);
            assert.equal(q1.peep().item, 'b');
            assert.equal(q2.peep().item, 'b');
            assert.equal(q1.pop().item, 'b');
            assert.equal(q2.pop().item, 'b');
        });
        it('after pop the queue property is still preserved', function() {
            const q = new PriorityQueue();
            q.push(2, 2).push(11, 11).push(3, 3).push(0, 0).push(5, 5).push(4, 4)
             .push(6, 6).push(7, 7).push(8, 8).push(9, 9).push(10, 10).push(1, 1)
             .push(12, 12).push(13, 13);
            q.pop();

            for (var i=0;2*i+1<q.size;i++) {
                assert.ok(q.items[i].score > q.items[2*i+1].score);
                if (2*i+2 < q.size) assert.ok(q.items[i].score > q.items[2*i+2].score);
            }
        });
    });

    describe('#remove(index)', function() {
        it('should preserve queue property after remove', function() {
            for (var j=1;j<14;j++) {
                const q = new PriorityQueue();
                q.push(2, 2).push(11, 11).push(3, 3).push(0, 0).push(5, 5).push(4, 4)
                 .push(6, 6).push(7, 7).push(8, 8).push(9, 9).push(10, 10).push(1, 1)
                 .push(12, 12).push(13, 13);
                q.remove(i);
                for (var i=0;2*i+1<q.size;i++) {
                    assert.ok(q.items[i].score > q.items[2*i+1].score);
                    if (2*i+2 < q.size) assert.ok(q.items[i].score > q.items[2*i+2].score);
                }
            }
        });
    });


    describe('#sample()', function() {
        it('sampling does actually sample', function() {
            
        });
    });


    describe('#push(item, score)', function() {
        it('queue property holds', function() {
            const q = new PriorityQueue();
            q.push(2, 2).push(11, 11).push(3, 3).push(0, 0).push(5, 5).push(4, 4)
             .push(6, 6).push(7, 7).push(8, 8).push(9, 9).push(10, 10).push(1, 1)
             .push(12, 12).push(13, 13);

            for (var i=0;2*i+1<q.size;i++) {
                assert.ok(q.items[i].score > q.items[2*i+1].score);
                if (2*i+2 < q.size) assert.ok(q.items[i].score > q.items[2*i+2].score);
            }
        });
    });


    describe('misc', function() {
        it('size after a random number of inserts is as expected', function() {
            const q = new PriorityQueue();
            const N = Math.ceil(100 * Math.random());
            for(var i=0;i<N;i++)
                q.push(i, Math.random()*200);
            assert.equal(q.size, N);
        });
        it('size after a random number of inserts/pops is as expected', function() {
            const q = new PriorityQueue();
            const N = Math.ceil(100 * Math.random());
            let inserts = 0; let deletes = 0;
            for(var i=0;i<N;i++) {
                if (Math.random() > 0.5) {
                    q.push(i, Math.random()*200);
                    inserts++;
                } else {
                    if (inserts - deletes > 0) deletes++;
                    q.pop();
                }
            }
            assert.equal(q.size, inserts - deletes);
        });
        it('pushing n elements and popping n will return a (desc) sorted list', function() {
            const N = Math.ceil(200 * Math.random() + 1);
            const q = new PriorityQueue();
            const arr = [];

            for(var i=0;i<N;i++) arr.push(i);
            for(var i=0;i<N/2;i++) {
                const j = Math.floor(Math.random() * N);
                const _tmp = arr[i]; arr[i] = arr[j]; arr[j] = _tmp;
            }

            arr.forEach(elm => q.push(elm, elm));

            assert.equal(q.size, N);

            var i = N;
            while (!q.isEmpty()) {
                i--;
                assert.equal(q.pop().item, i);
            }
        });
    });
});
