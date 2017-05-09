'use strict';

let n = require('neataptic');
let zip = require('zip-array').zip;
let _ = require('underscore');
let randomstring = require('randomstring')
let http = require('http')

let timer = require('./timer');
let m = require('./ml-lib.js');

timer.log("Start")



/* ------------------------------        General stuff         -------------------------- */

// http://stackoverflow.com/questions/2380019/generate-unique-random-numbers-between-1-and-100
// create nr_of_ints rangind from 0 to int-max inclusive
function get_rand_ints(nr_of_ints,int_max) {
    var allIntsInOrder = _.range(0,int_max+1);
    var my_ints = fisherYates(allIntsInOrder,nr_of_ints)
    return  my_ints;
}

// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function fisherYates(myArray,nb_picks)
{
    for (let i = myArray.length-1; i > 1  ; i--)
    {
        let r = Math.floor(Math.random()*i);
        let t = myArray[i];
        myArray[i] = myArray[r];
        myArray[r] = t;
    }

    return myArray.slice(0,nb_picks);
}







timer.log_print("General");




/*  ---------------------------------------          Extract             ----------------------------- */

const word_length = 3;
const word_list_path = './data/words.txt';


let x_noise = []
let y_noise = []
for (let i = 500; i >= 1; i--) {
    let s = randomstring.generate(word_length);
    x_noise.push(s.toLowerCase()); 
    y_noise.push(0)
}

let fs = require('fs');
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
let padding = Array(maxLen + 1).join(' '); // a string of sufficiently many spaces


function pad(pad, str, padLeft) {
  if (typeof str === 'undefined') 
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}


let x_process1 = x_raw.map(s => pad(padding,s,true)).map(x => x.split(''))


let tokenSet = []
var tokenAdd = tokenToAdd => { if(tokenSet.indexOf(tokenToAdd) === -1) {tokenSet.push(tokenToAdd)} } ;
let x_process2 = x_process1.map(w => {w.map(tokenAdd);return w}) // fill the tokenSet


var oneHotEncode = (token,tokenSet) => {
    var vec_len = tokenSet.length;
    var encodedToken = new Array(vec_len+1).join('0').split('').map(parseFloat)
    encodedToken[tokenSet.indexOf(token)] = 1
    return encodedToken;
}

var flatMap = (a, callback) => [].concat(...a.map(callback))
let x_process3 = x_process2.map(w => flatMap(w, token => oneHotEncode(token,tokenSet)))

let x_all = x_process3;
let y_all = y_raw.map(x => [x]);








timer.log_print("Transform");





/*  ---------------------------------------          Split           ----------------------------- */

function split_train_and_test(x,y,test_frac) {
    let x_train = x.slice();
    let y_train = y.slice(); //need to deep copy arrays in JS
    let x_test = [];
    let y_test = [];

    let no_in_test = Math.round(x.length * test_frac);
    let ids_to_test = get_rand_ints(no_in_test,x.length-1);

    for (let id_n = ids_to_test.length - 1; id_n >= 0; id_n--) {
        x_train.splice(ids_to_test[id_n],1);
        y_train.splice(ids_to_test[id_n],1);
        x_test.push(x[ids_to_test[id_n]]);
        y_test.push(y[ids_to_test[id_n]]);
    }
    return [x_train,y_train,x_test,y_test];
}

function copy_train_and_test(x,y) {
    let x_train = x_all.slice();
    let x_test = x_all.slice();
    let y_train = y_all.slice();
    let y_test = y_all.slice();
    return [x_train,y_train,x_test,y_test];
}



let x_train,y_train,x_test,y_test;
[x_train,y_train,x_test,y_test] = split_train_and_test(x_all,y_all,0.2)
//[x_train,y_train,x_test,y_test] = copy_train_and_test(x_all,y_all)











timer.log_print("Split");














/*  ---------------------------------------          Train           ----------------------------- */

var input_size = x_train[0].length;
var output_size = 1;

console.log("The MLP has "+input_size+" inputs")

var myPerceptron = new n.Architect.Perceptron(input_size,10,output_size);


const error_rate_ok = .5;
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

fs.writeFileSync('./perceptron.json', JSON.stringify(myPerceptron.toJSON()));











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


