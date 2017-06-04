const assert = require('chai').assert;
let t = require('../../ml_pipe/train');
let n = require('neataptic')


describe('Training module', () => {
	describe('Binary classifier MLP',()=>{
		it('returns a network',()=>{
			const net = t.perceptronBinaryClassifier([[1]],[[1]])
			assert.instanceOf(net,n.Network)
		})
	})
})
