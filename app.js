'use strict';

const n = require('neataptic');
const zip = require('zip-array').zip;

const randomstring = require('randomstring')
const fs = require('fs');

const cc = require('./lib/confusion_calls')
const timer = require('./lib/timer');
const m = require('sprakpolisen-ml-lib');
const _ = require('lodash/fp');

timer.log("Start")



/* ------------------------------        General stuff         -------------------------- */
const config_path = './data/config.json';

const config = JSON.parse(
    fs
    .readFileSync(config_path)
    .toString()
    )



/*  ---------------------------------------          Extract             ----------------------------- */

const generate_noise = longest_words =>  _
    .flatMap(
        x => Array(100).fill(x),
        _.range(1,longest_words+1))
    .map(j =>
        randomstring.generate(j).toLowerCase());

const load_words = (path,max_len) => fs.readFileSync(path)
    .toString()
    .split("\n")
    .filter(s => s.length <= max_len);


let x_noise = generate_noise(config.word_length)
let x_signal = load_words(config.word_list_path,config.word_length)
let y_noise = new Array(x_noise.length).fill(0)
let y_signal = new Array(x_signal.length).fill(1);

let x_raw = x_noise.concat(x_signal);
let y_raw = y_noise.concat(y_signal);

timer.log("Extract");


/*  ---------------------------------------          Transform           ----------------------------- */


let maxLen = Math.max(...x_raw.map(s => s.length)) ;

console.log("longest word is: "+maxLen+" characters long.")

let x_process1 = x_raw.map(s => m.padLeft(maxLen,config.pad_symbol,s)).map(x => x.split(''))
const token_set = m.getTokenSet(x_process1)

console.log("There are "+token_set.length+" tokens in the coding set.")
let x_process2 = x_process1.map(w => m.oneHotEncodeWord(w,token_set))

let x_all = x_process2;
let y_all = y_raw.map(x => [x]);

timer.log("Transform");


/*  ---------------------------------------          Split           ----------------------------- */

let x_train,y_train,x_test,y_test;
[x_train,y_train,x_test,y_test] = m.split_train_and_test(x_all,y_all,config.test_fraction)
timer.log("Split")


/*  ---------------------------------------          Train           ----------------------------- */

var input_size = x_train[0].length;
var output_size = 1;

console.log("The MLP has "+input_size+" inputs")
console.log("The trainin set has "+x_train.length+" elements.")

var myPerceptron = new n.Architect.Perceptron(input_size,10,10,output_size);


let trainingSet = zip(x_train, y_train).map( x_y_pair => ({input: x_y_pair[0], output: x_y_pair[1]}))
let trainerOpts = config.trainer_base_options;
    trainerOpts.cost = n.Methods.Cost.CROSS_ENTROPY

console.log("Starts training for error rate " + trainerOpts.error)
myPerceptron.train(trainingSet, trainerOpts);

timer.log("Train");


/*  ---------------------------------------          Score           ----------------------------- */
let y_hat = x_test.map(obs => myPerceptron.activate(obs))
timer.log("Score");


/*  ---------------------------------------          Evaluate           ----------------------------- */
cc.print_confusion_stats(y_test,y_hat)
cc.print_test_data(x_test,y_test,y_hat,token_set)
timer.log("Eval")


/*  ---------------------------------------          Exports           ----------------------------- */
if (!fs.existsSync(config.out_path)){
    fs.mkdirSync(config.out_path);
}

fs.writeFileSync(config.out_path+'/pad_symbol.json', JSON.stringify(config.pad_symbol));
fs.writeFileSync(config.out_path+'/token_set.json', JSON.stringify(token_set));
fs.writeFileSync(config.out_path+'/perceptron.json', JSON.stringify(myPerceptron.toJSON()));

timer.log_print("export")