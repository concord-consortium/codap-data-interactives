const random_functions = {

    integer: function (iLower = 1, iUpper = 6) {
        let out = null;
        if (Number.isFinite(iLower) && Number.isFinite(iUpper)) {
            if (iLower > iUpper) {
                const t = iUpper;
                iUpper = iLower;
                iLower = t
            }
            out = Math.floor(iLower + (iUpper - iLower + 1) * Math.random());
        }
        return out;
    },

    float: function (iLower = 0.0, iUpper = 1.0) {
        let out = null;
        if (Number.isFinite(iLower) && Number.isFinite(iUpper)) {
            if (iLower > iUpper) {
                const t = iUpper;
                iUpper = iLower;
                iLower = t
            }
            out = (iLower + (iUpper - iLower) * Math.random());
        }
        return out;
    },

    pickFrom: function (iArray = ["heads", "tails"]) {
        out = null;
        if (Array.isArray(iArray)) {
            const N = iArray.length;
            out = iArray[this.integer(0, N - 1)];
        }
        return out;
    },

    /**
     * Random normal, Box-Muller transform. Use only one value.
     * @param mean
     * @param sd
     * @returns {*}
     */
    randomNormal: function (mean = 0, sd = 1.0) {
        let out = null;
        if (Number.isFinite(mean) && Number.isFinite(sd)) {
            var t1 = Math.random();
            var t2 = Math.random();

            var tZ = Math.sqrt(-2 * Math.log(t1)) * Math.cos(2 * Math.PI * t2);

            out = mean + sd * tZ;
        }
        return out;
    },

    /**
     * random binomial, done with brute force!
     *
     * @param N     the number of things drawn
     * @param p     the probability of success
     * @returns {number}    the number of successes
     */
    randomBinomial: function (N = 10, p = 0.5) {
        let out = null;

        if (Number.isFinite(N) && Number.isFinite(p)) {
            out = 0;
            for (let i = 0; i < N; i++) {
                if (Math.random() < p) {
                    out++;
                }
            }
        }
        return out;
    },

}