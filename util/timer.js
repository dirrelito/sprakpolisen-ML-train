'use strict';
var now = require("performance-now")
var Table = require('easy-table');


let timing = []

const log = label => {
	if( label === null) { throw Error("Cannot log null.")}
	if( label === undefined) { throw Error("Cannot log undefined.")}
	if( typeof label === 'object') { throw Error("Cannot log objects.")}
	timing.push({label: label, time: now()})
};

const reportData = () => {
		let t0 = timing[0]['time']
		let t1 = timing[0]['time']
		const dataObject = timing
			.map(x => {
				let tAcc = x.time -t0;
				let tLeg = x.time - t1;
				t1 = x.time;
				return Object.assign({time_acc: tAcc, time_leg:tLeg}, x)
			});
		return dataObject;
	}

const reportTable = () => {
		let data = reportData()
			.map(x => ({
				label: x.label,
				time_acc: x.time_acc/1000,
				time_leg: x.time_leg/1000
			}));
		const opts = {
			label: {name: 'Label'},
			time_acc: {name: 'Total time [s]',
				printer: Table.number(2)},
			time_leg: {name: 'Section Time [s]',
				printer: Table.number(2)}
			}
		// trimming last newline from string... doesnt make sense to have it...
		return Table.print(data,opts).replace(/\s+$/g,"");
	}

const reset = () => {
	timing = []
}


module.exports = {
	log: log,
	reportTable: reportTable,
	reset: reset
}
