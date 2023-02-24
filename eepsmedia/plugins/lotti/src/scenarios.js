/**
 * Object containing parameters for all scenarios.
 * The `name` field is the same as the key, that's intentional.
 *
 * In the bulk of the code, we just look at the current scenario, which is `lotti.scenario`
 *
 * @type {{hunters: {result: (function(*, *, *): *), emitData: boolean, rightDoorLook: {image: string, color: string}, left: number[], fadeTime: number, name: string, allowance: boolean, right: number[], leftDoorLook: {image: string, color: string}, timeTillFade: number}, fbola: {result: (function(*, *, *): *), emitData: boolean, rightDoorLook: {image: string, color: string}, left: number[], fadeTime: number, name: string, allowance: boolean, right: number[], leftDoorLook: {image: string, color: string}, timeTillFade: number}, allowance_1: {result: (function(*, *, *): *), emitData: boolean, rightDoorLook: {color: string}, left: number[], fadeTime: number, name: string, allowance: boolean, right: number[], leftDoorLook: {color: string}, timeTillFade: number}, allowance_2: {result: (function(*, *, *): *), emitData: boolean, rightDoorLook: {color: string}, left: number[], fadeTime: number, name: string, allowance: boolean, right: number[], leftDoorLook: {color: string}, timeTillFade: number}}}
 */
lotti.allScenarios = {

    'allowance_AB': {
        name : "allowance_AB",
        leftDoorLook : {color : 'dodgerblue', image : "images/euro-money-bag-hand.png"},
        rightDoorLook : {color : 'orange', image : "images/euro-money-bag-hand.png"},
        left : [4],
        right : [0, 0, 0, 25],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) :pickRandomItemFrom(R) ;
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
        allowance : true,
    },

    'allowance_CD': {
        name : "allowance_CD",
        leftDoorLook : {color : 'dodgerblue' , image : "images/euro-money-bag-hand.png"},
        rightDoorLook : {color : 'orange', image : "images/euro-money-bag-hand.png"},
        left : [4],
        right : [0, 0, 0, 0, 0, 0, 0, 25],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) :pickRandomItemFrom(R) ;
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
        allowance : true,
    },

    'allowance_EF': {
        name : "allowance_EF",
        leftDoorLook : {color : 'dodgerblue' , image : "images/euro-money-bag-hand.png"},
        rightDoorLook : {color : 'orange' , image : "images/euro-money-bag-hand.png"},
        left : [8, 10, 12, 9, 11],
        right : [0, 0, 0, 50],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) :pickRandomItemFrom(R) ;
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
        allowance : true,
    },

    'allowance_GH': {
        name : "allowance_GH",
        leftDoorLook : {color : 'dodgerblue', image : "images/euro-money-bag-hand.png"},
        rightDoorLook : {color : 'orange' , image : "images/euro-money-bag-hand.png"},
        left : [0, 25, 30, 40, 50],
        right : [0, 0, 0, 0, 0, 0, 90, 110, 0, 0, 0, 100],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) :pickRandomItemFrom(R) ;
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
        allowance : true,
    },

    'fbola' : {
        name : "fbola",
        leftDoorLook : {color : 'lightgreen', image : "images/yes-vax.png"},
        rightDoorLook : {color : 'pink',  image : "images/no-vax.png"},
        left : [1,2],
        right : [0, 0, 0, 0, 0, 0, 0, 20],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) : pickRandomItemFrom(R) ;
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
        allowance : false,
    },

    'hunters' : {
        name : "hunters",
        leftDoorLook : {color : 'lightgreen', 'image' : "images/viking-sven.png"},
        rightDoorLook : {color : 'pink', image : "images/viking-freya.png"},

        left : [1,2],
        right : [0, 0, 0, 0, 0, 0, 0, 20],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) : pickRandomItemFrom(R) ;
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
        allowance : false,
    }

}

/**
 * Returns a random item from a list
 * @param a         the list
 * @returns {*}
 */
function pickRandomItemFrom(a) {
    const rrr = Math.random();
    //  console.log(rrr);
    const tL = a.length;
    const tR = Math.floor(rrr * tL);
    return a[tR];
}

