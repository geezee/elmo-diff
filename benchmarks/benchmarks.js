const Diff = require('../src/diff.js');

const str1 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vi" +
    "vamus eget interdum enim, sit amet placerat justo. Donec suscipit fe" +
    "ugiat nunc non luctus. Etiam at ante auctor, viverra urna ut, effici" +
    "tur justo. Proin tincidunt commodo sapien, ut blandit augue placerat" +
    "id. Nunc lobortis justo sit amet leo interdum, non auctor elit biben" +
    "dum. In hac habitasse platea dictumst. Aenean varius fermentum diam " +
    "semper gravida. Maecenas ultrices venenatis leo, non porta diam vive" +
    "rra et. Maecenas in ante faucibus, blandit tellus ac, venenatis odio" +
    ". Duis massa quam, interdum id elit eget, ultricies dictum enim. Sed" +
    "dictum pharetra ipsum, eget placerat tortor sodales eget. Quisque en" +
    "im sapien, cursus ut eleifend ut, blandit finibus mauris.  Aliquam f" +
    "inibus venenatis lorem in vehicula. Fusce arcu enim, cursus in lorem" +
    "a, semper faucibus lacus. Nullam rhoncus felis sed egestas vulputate" +
    ". Sed sapien leo, hendrerit vel nibh sed, commodo porttitor mi. Null" +
    "a nec sollicitudin lacus, non tristique sapien.";

const str2 = "Proin efficitur eros eu varius varius. Aenean quis diam ac " +
    "orci porttitor vulputate. Cras vitae fringilla libero, at dictum nun" +
    "c. Sed rutrum eu orci eu bibendum. Nam pharetra vulputate lacus, in " +
    "cursus libero porta nec. Aenean finibus arcu ex, ac scelerisque nequ" +
    "e convallis vel. Nullam eu suscipit nisi. Pellentesque rhoncus portt" +
    "itor nulla interdum mattis. Aliquam et sagittis dolor, eu volutpat f" +
    "elis. Ut vitae sem arcu. Praesent sed sem ac leo auctor feugiat. Don" +
    "ec dapibus arcu velit, vehicula pretium dui viverra in. Suspendisse " +
    "tristique suscipit congue.  Maecenas ultrices venenatis leo, non por" +
    "ta diam viverra et. Maecenas in ante faucibus, blandit tellus ac, ve" +
    "nenatis odio. Duis massa quam, interdum id elit eget, ultricies dict" +
    "um enim. Sed dictum pharetra ipsum, eget placerat tortor sodales ege" +
    "t. Quisque enim sapien, cursus ut eleifend ut, blandit finibus mauri" +
    "s. Aliquam finibus VENEnatis lorem In Vehicula. Fusce arcu ENIM, CUR" +
    "sus eth in lorem ar faucibus lacus. nULLAM rhonfelis sed gs th hta  " +
    "vulPuTatEsed sapien leO,  HENdrerel NIBH SED, Commodo portloe la nec" +
    "sollics, nonRISTIque sapien. ";

const benchmark = function(name, code, N=100) {
    const round = a => Math.round(a * 100) / 100;
    let total = 0;
    let length = 0;
    let min = str1.length + str2.length;
    let max = 0;
    for(var i=0;i<N;i++) {
        const start = new Date().getTime();
        const value = code();
        const end = new Date().getTime();

        total += (end - start) / N;
        length += value / N;
        min = Math.min(min, value);
        max = Math.max(max, value);
    }
    console.log(name+''+round(total)+'\t'+round(length)+'\t\t'+min+'\t'+max+'\t'+(max-min));
}

const makeSuite = function(name, sampleDecider, postStep) {
    var namepad = "                "; // 16 whitespaces
    name += namepad.substring(0, 16 - name.length);
    name = name.substring(0, 16);

    benchmark(name, function() {
        let n = 0, t = 0;
        const diff = new Diff(str1, str2);

        diff.setPostStep((typeof postStep == "function") ?
            (() => { t++; postStep(); }) : (() => t++));

        diff.setSampleDecider(() => Math.random () < sampleDecider(n++, t));

        return diff.computePath().length;
    });
};

console.log('Let t be the iteration number\n\n');

console.log('function\ttime\tlength\t\tmin\tmax\trange');

makeSuite('1/t', (n, t) => 1 / t);
makeSuite('1/sqrt(t)', (n, t) => 1 / Math.sqrt(t));
makeSuite('1/log(t)', (n, t) => 1 / Math.log(t));
makeSuite('t^-0.666', (n, t) => Math.pow(t, -2.0/3));
makeSuite('t^-0.333', (n, t) => Math.pow(t, -1.0/3));
makeSuite('t^-0.125', (n, t) => Math.pow(t, -0.125));
makeSuite('exp(-t/2)', (n, t) => Math.exp(-t/2));

console.log('');

makeSuite('t^-0.666 [1k]', (n, t) => Math.pow(t, -2.0/3), 1000);
makeSuite('t^-0.500 [1k]', (n, t) => 1 / Math.sqrt(t), 1000);
makeSuite('t^-0.450 [1k]', (n, t) => Math.pow(t, -0.45), 1000);
makeSuite('t^-0.333 [1k]', (n, t) => Math.pow(t, -1.0/3), 1000);
