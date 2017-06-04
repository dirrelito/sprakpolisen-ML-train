'use strict'
const assert = require('chai').assert;
let e = require('../../ml_pipe/extract');

describe("Extraction tools",() => {
	describe("Words from file loader",()=>{

		const wordPath = 'data/words.txt'

		it('returns string array',()=>{
			const retVal = e.loadWordsFromFile(wordPath,1)
			assert.isArray(retVal)
			assert.isTrue(retVal.every(str => typeof str == 'string'),'Not all elements are string type')
		})

		it('returns max word length as per argument',() => {
			const maxMaxLen = 10
			const maxLen = Math.round((Math.random()*(maxMaxLen-1)))+1
			const retVal = e.loadWordsFromFile(wordPath,maxLen)
			assert.equal(Math.max(...retVal.map(str => str.length)),maxLen)
		})

		it('throws on pad path specified',()=>{
			assert.throws(() => e.loadWordsFromFile('qwerty'))
		})
	})

	describe('Random string generator',()=>{

		it('returns string array',()=>{
			const retVal = e.generateRandomStrings()
			assert.isArray(retVal)
			assert.isTrue(retVal.every(str => typeof str == 'string'),'Not all elements are string type')
		})

		it('Returns the number of words requested',()=>{
			const count = 300;
			const retVal = e.generateRandomStrings({count:count})
			assert.lengthOf(retVal,count)
		})

		it('returns max word length as per argument',() => {
			const maxMaxLen = 10
			const maxLen = Math.round((Math.random()*(maxMaxLen-1)))+1

			const retVal = e.generateRandomStrings({maxLen:maxLen})
			const maxLenActual = Math.max(...retVal.map(str => str.length));
			assert.equal(maxLenActual,maxLen)
		})

		it('Has option for only loswercase', ()=> {
			const retVal = e.generateRandomStrings({lowercase:true})
			const someUppercases = retVal.some(word => word.match(/[A-Z]/))
			assert.isFalse(someUppercases)

			const retVal2 = e.generateRandomStrings({lowercase:false})
			const someUppercases2 = retVal2.some(word => word.match(/[A-Z]/))
			assert.isTrue(someUppercases2)
		})
	})
})
