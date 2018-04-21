const Diff = require('../src/diff.js');

const source = 'm3lr2xczfuo1ljggqt8ct7';
const target = 'cm3lrv2czfuo1ljggqt8ct7';


let trg = ':-,\\ABCABBA THIS SHOULD BE DISREGARDED';
let src = 'CBABAC XXXX THIS SHOULD BE DISREGARDED XXXXX';

const diff = new Diff(src, trg);

const path = diff.computePath();
const serialized = diff.serialize(path);

const app = Diff.apply(src, serialized);

console.log('<< ', src);
console.log('>> ', trg);
console.log('%%%% ', serialized);
console.log('== ', app + '%');
console.log('?? ', app == trg);
