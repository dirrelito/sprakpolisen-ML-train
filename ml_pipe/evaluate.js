'use strict';

const m = require('sprakpolisen-ml-lib');
const _ = require('lodash/fp')

let add = (a,b) => a+b;

//generalized truepositive
let calculate_TP = (y_test,y_hat) => {
    return _.zip(y_test, y_hat)
        .filter(p => p[0] === 1)
        .map( p => p[1])
        .reduce(add,0)
}

//generalized true negative
let calculate_TN = (y_test,y_hat) => {
    return _.zip(y_test, y_hat)
        .filter(p => p[0] === 0)
        .map( p => 1-p[1])
        .reduce(add,0)
}

//generalized falsepositive
let calculate_FP = (y_test,y_hat) => {
    return _.zip(y_test, y_hat)
        .filter(p => p[0] === 0)
        .map( p => p[1])
        .reduce(add,0)
}

//generalized falsenegative
let calculate_FN = (y_test,y_hat) => {
    return _.zip(y_test, y_hat)
        .filter(p => p[0] === 1)
        .map( p => 1-p[1])
        .reduce(add,0)
}

function printConfusionDetails(y_test,y_hat) {

    if (!(Array.isArray(y_test) && Array.isArray(y_hat))) { throw Error('Input must be arrays')};
    if (!(y_test.concat(y_hat).map(x => typeof x == 'number'))) { throw Error('Input must be numeric arrays')};
    if (!(y_test.concat(y_hat).every(x=> x>=0 && x<= 1))) { throw Error('Input must be probability arrays')};
    if (y_test.length != y_hat.length) { throw Error('Input arrays must have same length')};


    let TP = calculate_TP(y_test,y_hat)
    let TN = calculate_TN(y_test,y_hat)
    let FP = calculate_FP(y_test,y_hat)
    let FN = calculate_FN(y_test,y_hat)
    return m.print_confusion(TP,FN,FP,TN) //the lib prints to screen, which is bad. how to do that?
}


//prints the actual test set
function testDataDetails(x_test,y_test,y_hat,tokenSet) {
    let s = {logString:""}
    s.log = function(data)  {
        this.logString = (this.logString != "")
            ? this.logString + '\n' + data
            : data.toString()
        }

    if (tokenSet === undefined) { throw Error("You must supply a token set!")}


    const word_decoder = w => m.oneHotDecodeWord(w,tokenSet)
    const unpack = e => e[0]
    const absErr = obs => Math.abs(obs[2]-obs[1]);

    // lodash/fp zip does not work for three arrays. they fxed arity = 2 to support currying
    // this oneline is from stackoverflow and works for lists of same length
    const es6Zip = (...rows) => [...rows[0]].map((_,c) => rows.map(rows => rows[c]))

    let review_data = es6Zip(x_test.map(word_decoder),y_test.map(unpack),y_hat.map(unpack))
    review_data.sort((obsA,obsB) => absErr(obsB)- absErr(obsA) )

    s.log("False Negatives")
    s.log(review_data.filter(obs => obs[1] == 1).filter(obs => Math.abs(obs[1] - obs[2]) > 0.5).join("\n"))
    s.log("True Positives")
    s.log(review_data.filter(obs => obs[1] == 1).filter(obs => Math.abs(obs[1] - obs[2]) <= 0.5).join("\n"))
    s.log("False Positives")
    s.log(review_data.filter(obs => obs[1] == 0).filter(obs => Math.abs(obs[1] - obs[2]) > 0.5).join("\n"))
    s.log("True Negatives")
    s.log(review_data.filter(obs => obs[1] == 0).filter(obs => Math.abs(obs[1] - obs[2]) <= 0.5).join("\n"))
    return s.logString
}

module.exports = {
    printConfusionDetails: printConfusionDetails,
    testDataDetails: testDataDetails
}
