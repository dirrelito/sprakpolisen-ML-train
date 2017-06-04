'use strict'
const assert = require('chai').assert;
let t = require('../../util/timer');


describe('The timer function',()=>{

	beforeEach(t.reset);


	it('Can log a string label',()=>{
		assert.doesNotThrow(() => t.log('hej'))
	});

	it('Throws on bad input',()=>{
		assert.throws(() => t.log(null))
		assert.throws(() => t.log(undefined))
		assert.throws(() => t.log({}))
		assert.throws(() => t.log({a:"hej"}))
	})

	it('The label is present in output', () => {
		const label = 'qwerty'
		t.log(label);
		assert.include(t.reportTable(),label)
	})

	it('The table is two rows longer than the count of logged events', () => {
		t.log(1);
		t.log(2);
		t.log(3);
		const dataTable = t.reportTable();
		const lines = dataTable.split(/\r\n|\r|\n/)
		const lineCount = lines.length
		assert.equal(lineCount,5,"Expected 5 lines in the below table:\n"+lines+"\n")
	})

	it('Waiting for 10 ms gives at least 0.01 sec total time in log table', (done) => {
		t.log("One");

		setTimeout(()=>{
			t.log("Two");
			const s = t.reportTable().split(/\n/).map(s=>s.split(/\s+/))[3][2]
			assert.isAtLeast(parseFloat(s),0.01);
			done()},10)
	})

	it('Waiting for 30 ms gives at most 0.04 sec total time in log table', (done) => {
		t.log("One");

		setTimeout(()=>{
			t.log("Two");
			const s = t.reportTable().split(/\n/).map(s=>s.split(/\s+/))[3][2]
			assert.isAtMost(parseFloat(s),0.04);
			done()},30)
	})

	it("logging 7 events make them come in order in output", () => {
		const labels = [1,2,3,4,5,6,7].map(num => num.toString())
		labels.map(num => t.log(num)); // log all
		const lines = t.reportTable().split(/\n/);
		lines.splice(0,2) //takes out two first elements, header rows
		const loggedLabels = lines.map(s => s.split(/\s+/)[0])
		assert.deepEqual(labels,loggedLabels)
	})

})
