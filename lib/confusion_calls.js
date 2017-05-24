'use strict';

const zip = require('zip-array').zip;
const m = require('sprakpolisen-ml-lib');

let add = (a,b) => a+b;

//generalized truepositive
let calculate_TP = (y_test,y_hat) => {
    return zip(y_test.map(x => x[0]), y_hat.map(x=>x[0]))
        .filter(p => p[0] === 1)
        .map( p => p[1])
        .reduce(add,0)
}

//generalized true negative
let calculate_TN = (y_test,y_hat) => {
    return zip(y_test.map(x => x[0]), y_hat.map(x=>x[0]))
        .filter(p => p[0] === 0)
        .map( p => 1-p[1])
        .reduce(add,0)
}

//generalized falsepositive
let calculate_FP = (y_test,y_hat) => {
    return zip(y_test.map(x => x[0]), y_hat.map(x=>x[0]))
        .filter(p => p[0] === 0)
        .map( p => p[1])
        .reduce(add,0)
}

//generalized falsenegative
let calculate_FN = (y_test,y_hat) => {
    return zip(y_test.map(x => x[0]), y_hat.map(x=>x[0]))
        .filter(p => p[0] === 1)
        .map( p => 1-p[1])
        .reduce(add,0)
}

function print_confusion_stats(y_test,y_hat) {
    let TP = calculate_TP(y_test,y_hat)
    let TN = calculate_TN(y_test,y_hat)
    let FP = calculate_FP(y_test,y_hat)
    let FN = calculate_FN(y_test,y_hat)
    m.print_confusion(TP,FN,FP,TN)
}


//prints the actual test set
function print_test_data(x_test,y_test,y_hat,token_set) {
    if (token_set === undefined) { throw Error("You must supply a token set!")}


    const word_decoder = w => m.oneHotDecodeWord(w,token_set)
    const unpack = e => e[0]
    const review_data = zip(x_test.map(word_decoder),y_test.map(unpack),y_hat.map(unpack))

    console.log("False Negatives")
    console.log(review_data.filter(obs => obs[1] == 1).filter(obs => Math.abs(obs[1] - obs[2]) > 0.5))
    console.log("True Positives")
    console.log(review_data.filter(obs => obs[1] == 1).filter(obs => Math.abs(obs[1] - obs[2]) <= 0.5))
    console.log("False Positives")
    console.log(review_data.filter(obs => obs[1] == 0).filter(obs => Math.abs(obs[1] - obs[2]) > 0.5))
    console.log("True Negatives")
    console.log(review_data.filter(obs => obs[1] == 0).filter(obs => Math.abs(obs[1] - obs[2]) <= 0.5))
}

module.exports = {
    print_confusion_stats: print_confusion_stats,
    print_test_data: print_test_data
}