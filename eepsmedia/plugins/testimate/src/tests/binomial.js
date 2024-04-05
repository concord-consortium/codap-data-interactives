const binomial =
    {

        CIbeta: function (n, k, alpha) {
            let upper = 1;
            let lower = 0;
            let upperP = 1 - alpha/2;
            let lowerP = alpha/2;

            //      calling order: jStat.beta.inv( p, alpha, beta );

            if (k === 0) {
                upper = jStat.beta.inv(upperP, k + 1, n - k);
            } else if (k === n) {
                lower = jStat.beta.inv(lowerP, k, n - k + 1);
            } else {
                upper = jStat.beta.inv(upperP, k + 1, n - k);
                lower = jStat.beta.inv(lowerP, k, n - k + 1);
            }
            return [lower, upper];
        },


        findCI: function (n, k, pValue) {
            let upper = 1;
            let lower = 0;

            if (k === 0) {
                upper = this.findInverseCDFValue(n, k, pValue, true);
            } else if (k === n) {
                lower = this.findInverseCDFValue(n, k, pValue, false);
            } else {
                upper = this.findInverseCDFValue(n, k, pValue / 2, true);
                lower = this.findInverseCDFValue(n, k, pValue / 2, false);
            }

            return [lower, upper]; // If no exact match is found within the precision limit
        },

        findInverseCDFValue: function (n, k, target, kOrFewer) {
            const epsilon = 0.001;
            const maxIter = 20;
            let low = 0;
            let high = 1.0;
            let p;

            let itercount = 0;
            console.log(`starting iteration N = ${n}, k = ${k}, target = ${target}, ${kOrFewer ? "k or fewer" : "k or more"}`);
            while (itercount < maxIter) {
                const mid = (low + high) / 2;
                p = mid;

                console.log(`it ${itercount} [${low.toFixed(4)}, ${high.toFixed(4)}]`);
                const cdfp = binomial.CDF(n, k, p, kOrFewer);

                if (kOrFewer) {
                    if (Math.abs(target - cdfp) < epsilon) {
                        console.log(`iteration ${itercount} converges at CDF(${p}) = ${cdfp}`);
                        return p;
                    } else if (cdfp > target) {
                        low = mid;
                    } else {
                        high = mid;
                    }
                } else {    //  k or more
                    if (Math.abs(target - cdfp) < epsilon) {
                        console.log(`iteration ${itercount} converges at CDF(${p}) = ${cdfp}`);
                        return p;
                    } else if (cdfp < target) {
                        low = mid;
                    } else {
                        high = mid;
                    }

                }
                itercount++;
            }
            alert(`fell out of loop itercount = ${itercount}`);
            return null;    //  oops
        },

        /*
                inverseCDF: function (p, n, successProbability) {
                    const epsilon = 1e-10;
                    let low = 0;
                    let high = n;

                    while (low <= high) {
                        const mid = Math.floor((low + high) / 2);
                        const cdfMid = binomial.CDF(mid, n, successProbability);

                        if (Math.abs(cdfMid - p) < epsilon) {
                            return mid;
                        } else if (cdfMid < p) {
                            low = mid + 1;
                        } else {
                            high = mid - 1;
                        }
                    }

                    return null; // If no exact match is found within the precision limit
                },
        */

        /**
         * What is the probability that you have k or fewer (or more) successes in
         * n Bernoulli trials
         * with probability P
         *
         * @param n
         * @param k
         * @param trueP
         * @param kOrFewer
         * * @returns {number}
         * @constructor
         */
        CDF: function (n, k, trueP, kOrFewer) {
            // Function to calculate the cumulative binomial distribution
            /*
                        const binomialCoefficient = binomial.choose(n, k);
                        const probability = binomialCoefficient * Math.pow(trueP, k) * Math.pow(1 - trueP, n - k);
            */

            let cumulativeProbability = 0;

            if (kOrFewer) {
                for (let i = 0; i <= k; i++) {
                    cumulativeProbability += binomial.choose(n, i) * Math.pow(trueP, i) * Math.pow(1 - trueP, n - i);
                }
            } else {        //  we're calculating the probability for k or MORE
                for (let i = n; i >= k; i--) {
                    cumulativeProbability += binomial.choose(n, i) * Math.pow(trueP, i) * Math.pow(1 - trueP, n - i);
                }
            }

            return cumulativeProbability;
        },

        choose: function (n, k) {
            // Function to calculate binomial coefficient (n choose k)
            if (k === 0 || k === n) {
                return 1;
            } else {
                return binomial.choose(n - 1, k - 1) + binomial.choose(n - 1, k);
            }
        },

        //` testing

        calculateCDF: function () {
            const P = Number(document.getElementById("trueProb").value);
            const k = Number(document.getElementById("successes").value);
            const N = Number(document.getElementById("samples").value);

            const NKResult = this.choose(N, k);
            const CDFResultFewer = this.CDF(N, k, P, true);

            const NPtext = `(${N} ${k}) = ${NKResult}`;
            const CDFtext = `result: CDF(${N}, ${k}, at P = ${P}) = ${CDFResultFewer}`;

            document.getElementById("result").innerHTML = `${NPtext} <br> ${CDFtext}`;

            let data = "p,cdf-,cdf+\n";
            for (let p = 0.05; p < 1.0; p += 0.05) {
                const cdfFewer = this.CDF(N, k, p, true);
                const cdfMore = this.CDF(N, k, p, false);
                data += `${p},${cdfFewer},${cdfMore} \n`;
            }

            console.log(data);
        },

        calculateCI: function () {
            const k = Number(document.getElementById("successes").value);
            const N = Number(document.getElementById("samples").value);
            const pValue = Number(document.getElementById("pValue").value);

            //  const result = binomial.findCI(N, k, pValue);
            const resultBeta = binomial.CIbeta(N, k, pValue);
            let CItext = `result: CI(${N}, ${k}, p-hat = (${k / N}) for P-value = ${pValue})`;
            //  CItext += `<br>&emsp;= [${result[0].toFixed(4)}, ${result[1].toFixed(4)}] (brute force)`;
            CItext += `<br>&emsp;= [${resultBeta[0].toFixed(4)}, ${resultBeta[1].toFixed(4)}] (beta)`;

            document.getElementById("result").innerHTML = `${CItext}`;

        }
    }


/*
// Example usage:
const pValue = 0.8; // Probability
const nValue = 10;  // Number of trials
const probSuccess = 0.5; // Probability of success in each trial

const inverseCDFResult = binomialInverseCDF(pValue, nValue, probSuccess);
console.log("Inverse of Cumulative Binomial Distribution:", inverseCDFResult);*/
