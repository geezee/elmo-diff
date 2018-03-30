/**
 * Swap the items at the provided indeces inside the provided array
 *
 * @param arr   {Array.any} the source array
 * @param i1    {uint} the first index
 * @param i2    {uint} the second index
 */
function swap(arr, i1, i2) {
    const _tmp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = _tmp;
}

/**
 * From the provided indeces, find the one with the highest score in the array
 *
 * @param arr   {Array.{score:uint}} the source array
 * @param i1    {uint} the first index
 * @param i2    {uint} the second index
 */
function i_maxScore(arr, i1, i2) {
    return arr[i1].score >= arr[i2].score ? i1 : i2;
}

module.exports = { swap: swap , i_maxScore: i_maxScore }
