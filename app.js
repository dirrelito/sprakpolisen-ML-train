'use strict';

let n = require('neataptic');
let zip = require('zip-array').zip;

let randomstring = require('randomstring')
let http = require('http')
let fs = require('fs');

let timer = require('./timer');
let m = require('sprakpolisen-ml-lib');

timer.log("Start")



/* ------------------------------        General stuff         -------------------------- */


var outPath = './output';
const pad_symbol = '¤'

if (!fs.existsSync(outPath)){
    fs.mkdirSync(outPath);
}

fs.writeFileSync(outPath+'/pad_symbol.json', JSON.stringify(pad_symbol));


timer.log_print("General");


/*  ---------------------------------------          Extract             ----------------------------- */

const word_length = 3;
const word_list_path = './data/words.txt';


let x_noise = []
let y_noise = []
for (let j = word_length; j >= 1; j--) {
    for (let i = j*100; i >= 1; i--) {
        let s = randomstring.generate(j);
        x_noise.push(s.toLowerCase()); 
        y_noise.push(0)
    }
}

let x_signal = fs.readFileSync(word_list_path)
    .toString()
    .split("\n")
    .filter(s => s.length <= word_length);
let y_signal = new Array(x_signal.length).fill(1);

let x_raw = x_noise.concat(x_signal);
let y_raw = y_noise.concat(y_signal);


timer.log_print("Extract");


/*  ---------------------------------------          Transform           ----------------------------- */


let maxLen = Math.max(...x_raw.map(s => s.length)) ;

console.log("longest word is: "+maxLen+" characters long.")

let x_process1 = x_raw.map(s => m.pad(maxLen,pad_symbol,s,true)).map(x => x.split(''))
const tokenSet = m.getTokenSet(x_process1)

console.log("There are "+tokenSet.length+" tokens in the coding set.")
let x_process2 = x_process1.map(w => m.oneHotEncodeWord(w,tokenSet))

let x_all = x_process2;
let y_all = y_raw.map(x => [x]);

fs.writeFileSync(outPath+'/token_set.json', JSON.stringify(tokenSet));

timer.log_print("Transform");





/*  ---------------------------------------          Split           ----------------------------- */

let x_train,y_train,x_test,y_test;
[x_train,y_train,x_test,y_test] = m.split_train_and_test(x_all,y_all,0.2)
//[x_train,y_train,x_test,y_test] = m.copy_train_and_test(x_all,y_all)

timer.log_print("Split");


/*  ---------------------------------------          Train           ----------------------------- */

var input_size = x_train[0].length;
var output_size = 1;

console.log("The MLP has "+input_size+" inputs")

var myPerceptron = new n.Architect.Perceptron(input_size,10,output_size);


const error_rate_ok = .05;
let trainingSet = zip(x_train, y_train).map( x_y_pair => ({input: x_y_pair[0], output: x_y_pair[1]}))
let trainerOpts = {
    rate: .1,
    iterations: 20000,
    error: error_rate_ok,
    shuffle: true,
    log: 1000,
    cost: n.Methods.Cost.CROSS_ENTROPY
}

console.log("Starts training for error rate " + error_rate_ok)
myPerceptron.train(trainingSet, trainerOpts);

fs.writeFileSync(outPath+'/perceptron.json', JSON.stringify(myPerceptron.toJSON()));

timer.log_print("Train");


/*  ---------------------------------------          Score           ----------------------------- */
let y_hat = x_test.map(obs => myPerceptron.activate(obs))
timer.log_print("Score");





/*  ---------------------------------------          Evaluate           ----------------------------- */

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




let TP = calculate_TP(y_test,y_hat)
let TN = calculate_TN(y_test,y_hat)
let FP = calculate_FP(y_test,y_hat)
let FN = calculate_FN(y_test,y_hat)

console.log("")
m.print_confusion(TP,FN,FP,TN)

timer.log_print("Evaluate");


