'use strict'
const assert = require('chai').assert;
let e = require('../../ml_pipe/evaluate');

describe("The evaluation tools",() => {

	describe("The test data printer",() => {

		const x_test = [
			[1,0,1,0],
			[1,0,0,1],
			[0,1,1,0],
			[0,1,0,1]
			];
		const y_test = [
			[0],
			[1],
			[0],
			[1]
			];
		const y_hat = [
			[0.1],
			[0.9],
			[0.6],
			[0.4]
			];
		const tokenSet = ['a','b']
		const s = e.testDataDetails(x_test,y_test,y_hat,tokenSet)

		const sTrueLines = [
			"False Negatives",
			"bb,1,0.4",
			"True Positives",
			"ab,1,0.9",
			"False Positives",
			"ba,0,0.6",
			"True Negatives",
			"aa,0,0.1"]

		it('Outputs string',() => {
			assert.equal(typeof s , 'string')
		})

		it('Has good amount of rows', () => {
			assert.equal(s.split(/\n/).length,8)
		})

		it('Has right line content', () => {
			assert.deepEqual(s.split(/\n/),sTrueLines)
		})

		const x_test2 = [
			[1],[1],[1],[1],[1],
			[1],[1],[1],[1],[1],
			[1],[1],[1],[1],[1]
			];
		const y_test2 = [
			[1],[1],[1],[1],[1],
			[0],[0],[0],[0],[0],
			[1],[1],[1],[0],[0]
			];
		const y_hat2 = [
			[0.1],[0.6],[0.2],[0.7],[0.5],
			[0.1],[0.6],[0.2],[0.7],[0.5],
			[0.76],[0.111],[0.12],[0.9],[0.2]
			];
		const tokenSet2 = [' ']

		const rawDataFromFunction = e.testDataDetails(x_test2,y_test2,y_hat2,tokenSet2)
		const splitToSections = rawDataFromFunction.split(/False Negatives|True Negatives|False Positives|True Positives/)
		splitToSections.splice(0,1)
		const parsedIntoTrueDataAndEstimates = splitToSections.map(str => str.replace(/^\n+|\n+$/g,"").split(/\n/g))
		const estimateAbsErrorperWord = parsedIntoTrueDataAndEstimates
			.map(section =>
				section.map(word => 
					Math.abs(word.split(',')[2]-word.split(',')[1])
				)
			)

		const checkMonotoneDecrease = (e,i,a) => {
			if(i) return a[i-1] >= e;
			return true;
		}

		const sectionsDecrease = estimateAbsErrorperWord.map(arr => arr.every(checkMonotoneDecrease))
		const allSectionDecreases = sectionsDecrease.every(bool=>bool)


		it('Sorts the output on faultyness in decreasing order', () => {
			assert.isOk(allSectionDecreases)
		})
	})

	describe('The Confusion stats printing', () => {

		const good_y = [1,1,0,0]
		const good_y_hat = [0,1,.1,.9]

		it('exists',()=>{
			assert.exists(e.printConfusionDetails)
		})

		it('accepts good input',()=>{
			assert.doesNotThrow(()=>e.printConfusionDetails(good_y,good_y_hat))
		})

		it('rejects bad values', ()=>{
			assert.throws(()=>e.printConfusionDetails([2],[3]))
			assert.throws(()=>e.printConfusionDetails({},[.1]))
			assert.throws(()=>e.printConfusionDetails([1,1],[0]))
		})

	})
})
