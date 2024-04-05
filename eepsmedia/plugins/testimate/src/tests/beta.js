// Implementation of the Beta probability density function
// Without the use of factorials to overcome the problem of getting inf values
// No external libraries required
// For naive implementation, see beta_naive.js (removed by terickson)
// Roy Hung 2019


const beta = {
    PDF: function (x, a, b) {
        // Beta probability density function impementation
        // using logarithms, no factorials involved.
        // Overcomes the problem with large integers
        return Math.exp(this.lnPDF(x, a, b))
    },

    lnPDF: function (x, a, b) {
        // Log of the Beta Probability Density Function
        return ((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)) - this.lnFunc(a, b);
    },

    lnFunc: function (a, b) {
        // Log Beta Function
        // ln(Beta(x,y))
        let foo = 0.0;

        for (let i = 0; i < a - 2; i++) {
            foo += Math.log(a - 1 - i);
        }
        for (let i = 0; i < b - 2; i++) {
            foo += Math.log(b - 1 - i);
        }
        for (let i = 0; i < a + b - 2; i++) {
            foo -= Math.log(a + b - 1 - i);
        }
        return foo;
    },

    func: function (x, y) {
        // Beta Function
        // Beta(x,y) = e^(ln(Beta(x,y))
        return Math.exp(this.lnFunc(x, y));
    }
}