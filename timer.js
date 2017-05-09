'use strict';
var now = require("performance-now")
var Table = require('easy-table');


let timing = []




var self = module.exports = {

	log: label => timing.push({label: label, time: now()}) ,

	report: function() {
		let t0 = timing[0]['time']
		let t1 = timing[0]['time']
		return timing.map(x => {
			let tAcc = x.time -t0;
			let tLeg = x.time - t1;
			t1 = x.time;
			return Object.assign({time_acc: tAcc, time_leg:tLeg}, x)
		});
	}

	,pretty_report: function() {
		let data =self.report()
			.map(x => ({
				label: x.label,
				time_acc: x.time_acc,
				time_leg: x.time_leg
			}));
		return Table.print(data,{
			time_acc: {name: 'Total time',
				printer: Table.number(2)},
			time_leg: {name: 'Section Time',
				printer: Table.number(2)}
			}
		);
	}

	,log_print: label => {self.log(label);console.log(self.pretty_report())}

}