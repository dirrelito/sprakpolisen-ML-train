'use strict';
const fs = require('fs');
const _ = require('lodash/fp');
const n = require('neataptic');

const m = require('sprakpolisen-ml-lib');

const extract = require('./ml_pipe/extract')
const train = require('./ml_pipe/train')
const evaluate = require('./ml_pipe/evaluate')
const timer = require('./util/timer');

timer.log("Start")



/* ------------------------------        General stuff         -------------------------- */
const config_path = './data/config.json';
const config = JSON.parse(
    fs
    .readFileSync(config_path)
    .toString()
    )

/*  ---------------------------------------          Extract             ----------------------------- */
const x_noise = extract.generateRandomStrings({
    maxLen: config.word_length,
    lowercase: true,
    count: 200
    })
const x_signal = extract.loadWordsFromFile(
    config.word_list_path
    ,config.word_length
    )
const y_noise = new Array(x_noise.length).fill(0)
const y_signal = new Array(x_signal.length).fill(1);
const x_raw = x_noise.concat(x_signal);
const y_raw = y_noise.concat(y_signal);

timer.log("Extract");


/*  ---------------------------------------          Transform           ----------------------------- */
const x_process1 = x_raw
    .map(s => m.padLeft(config.word_length,config.pad_symbol,s))
    .map(x => x.split(''))
const token_set = m.getTokenSet(x_process1)
const x_all = x_process1.map(w => m.oneHotEncodeWord(w,token_set));
const y_all = y_raw.map(x => [x]);

console.log("Number of tokens in token_set",token_set.length)
console.log("Number of datapoints",x_all.length)
timer.log("Transform");


/*  ---------------------------------------          Split           ----------------------------- */
let x_train,y_train,x_test,y_test;
[x_train,y_train,x_test,y_test] = m.split_train_and_test(x_all,y_all,config.test_fraction)
console.log("The training set has "+x_train.length+" elements.")
console.log("The testing set has "+x_test.length+" elements.")
timer.log("Split")



/*  ---------------------------------------          Train           ----------------------------- */
const myPerceptron = train.perceptronBinaryClassifier(x_train,y_train,config)
timer.log("Train");

/*  ---------------------------------------          Score           ----------------------------- */
const y_hat = x_test.map(obs => myPerceptron.activate(obs))
timer.log("Score");


/*  ---------------------------------------          Evaluate           ----------------------------- */
evaluate.printConfusionDetails(y_test,y_hat)
console.log(evaluate.testDataDetails(x_test,y_test,y_hat,token_set))
timer.log("Eval")


/*  ---------------------------------------          Exports           ----------------------------- */
if (!fs.existsSync(config.out_path)){
    fs.mkdirSync(config.out_path);
}

fs.writeFileSync(config.out_path+'/pad_symbol.json', JSON.stringify(config.pad_symbol));
fs.writeFileSync(config.out_path+'/token_set.json', JSON.stringify(token_set));
fs.writeFileSync(config.out_path+'/perceptron.json', JSON.stringify(myPerceptron.toJSON()));

timer.log("Export")
console.log(timer.reportTable())
