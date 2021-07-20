/**
 * Created by tim on 12/10/15.
 */

/**
 * Singleton object that keeps track of options (eventually, level params)
 */
var geigerOptions;

geigerOptions = {
    showDistance : false,
    scooperRadius : 10,
    deathPossible : false,
    useRandom : false,

    /**
     * Make sure the internal variables match the checkboxes.
     * Also called by geigerManager.newGame().
     */
    reconcile : function() {
        this.showDistance = document.getElementById("showDistance").checked;
        var tRadiusValue = document.getElementById("radius").value;
        this.scooperRadius = Number(tRadiusValue);
        this.deathPossible = document.getElementById("deathPossible").checked;
        this.useRandom = document.getElementById("useRandom").checked;
    },

    getSaveObject : function() {
        var tState = {
            showDistance : this.showDistance,
            scooperRadius : document.getElementById("radius").value,    //  the text, for restore
            deathPossible : this.deathPossible,
            useRandom : this.useRandom
        };

        return tState;
    },

    restoreFrom : function( iState ) {
        document.getElementById("showDistance").checked = iState.showDistance;
        document.getElementById("radius").value = iState.scooperRadius;
        document.getElementById("deathPossible").checked = iState.deathPossible;
        document.getElementById("useRandom").checked = iState.useRandom;
        this.reconcile();
    }

}