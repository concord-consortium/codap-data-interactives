const random_functions = {

    integer : function(iLower, iUpper) {
        if (iLower > iUpper) {
            const t = iUpper;
            iUpper = iLower;
            iLower = t
        }
        return Math.floor(iLower + (iUpper - iLower + 1) * Math.random());
    },

    float : function(iLower, iUpper) {
        if (iLower > iUpper) {
            const t = iUpper;
            iUpper = iLower;
            iLower = t
        }
        return (iLower + (iUpper - iLower) * Math.random());

    },

    pickFrom : function(iArray) {
        const N = iArray.length;
        return iArray[this.integer(0, N-1)];
    },

    /**
     * Random normal, Box-Muller transform. Use only one value.
     * @param mean
     * @param sd
     * @returns {*}
     */
    randomNormal : function(mean, sd) {
        var t1 = Math.random();
        var t2 = Math.random();

        var tZ = Math.sqrt(-2 * Math.log(t1)) * Math.cos(2 * Math.PI * t2);

        return mean + sd * tZ;
    },

    /**
     * random binomial, done with brute force!
     *
     * @param N     the number of things drawn
     * @param p     the probability of success
     * @returns {number}    the number of successes
     */
    randomBinomial : function(N, p) {

        let out = 0;
        for (let i = 0; i < N; i++) {
            if (Math.random() < p) {
                out++;
            }
        }
        return out;
    },

}