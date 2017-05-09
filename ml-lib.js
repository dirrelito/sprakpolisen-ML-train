'use strict';
let pad = require('pad');
let zip = require('zip-array').zip;

let add = (a,b) => a+b;

exports.print_confusion = function(TP,FN,FP,TN) {

	let rounding = 3;

	let z = "Estimate True"
	let w = "Estimate False"
	let q = "Condition Positive"
	let x = "Condition Negative"

	let numlen = [TP,FN,FP,TN].map( num => num.toFixed(rounding).length).reduce( (a,b) => Math.max(a,b),0)
	let strlen = [z,w,q,x].map( text => text.length).reduce( (a,b) => Math.max(a,b),0)
	let len = Math.max(numlen,strlen)

	console.log(" " + " ".repeat(len) + "╔" + "═".repeat(len)     + "╦" + "═".repeat(len) + "╗")
	console.log(" " + " ".repeat(len) + "║" + pad(z,len)       + "║" + pad(w,len)   + "║")
	console.log("╔" + "═".repeat(len) + "╬" + "═".repeat(len)     + "╬" + "═".repeat(len) + "╣")
	console.log("║" + pad(q,len)  + "║" + pad(TP.toFixed(rounding),len) + "║" + pad(FN.toFixed(rounding),len) + "║")
	console.log("╠" + "═".repeat(len) + "╬" + "═".repeat(len)     + "╬" + "═".repeat(len) + "╣")
	console.log("║" + pad(x,len)   + "║" + pad(FP.toFixed(rounding),len) + "║" + pad(TN.toFixed(rounding),len)   + "║")
	console.log("╚" + "═".repeat(len) + "╩" + "═".repeat(len)     + "╩" + "═".repeat(len) + "╝")

	console.log("")
	console.log("Accuracy     (TP+TN)/(TP+TN+FN+FP)    "+ ((TP+TN)/(TP+TN+FN+FP)).toFixed(rounding))
	console.log("Sensitivity  (TP)   /(TP+FN)          "+ ((TP)/(TP+FN)).toFixed(rounding))
	console.log("Specificity  (TN)   /(TN+FP)          "+ ((TN)/(TN+FP)).toFixed(rounding))
	console.log("Precision    (TP)   /(TP+FP)          "+ ((TP)/(TP+FP)).toFixed(rounding))
	console.log("F1 score     (2TP)  /(2TP+FP+FN)      "+ ((2*TP)/(2*TP+FP+FN)).toFixed(rounding))

}

exports.calculate_RMSE = function(y_test,y_hat) {
    let sum_squared_error = zip(y_test, y_hat)
            .map( p => ((p[0] - p[1])**2) )
            .reduce(add,0);
    let mean_squared_error = sum_squared_error / y_test.length;
    return  Math.sqrt(mean_squared_error)
}