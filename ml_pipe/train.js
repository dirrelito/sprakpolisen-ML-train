'use strict'
const n = require('neataptic');
const _ = require('lodash/fp');

const perceptronBinaryClassifier = (x_train,y_train,config) => {
	if(typeof config != 'object'){ config = {}};
	const input_size = x_train[0].length;
	const output_size = 1;
	const MLPArchitecture = config.MLPArchitecture || [input_size,30,10,output_size]


	if (MLPArchitecture[0] != input_size ||
		MLPArchitecture[MLPArchitecture.length-1] != output_size) 
	{
			throw Error("Bad MLP architecture")
	};
	

	const myPerceptron = new n.Architect.Perceptron(...MLPArchitecture);
	const trainingSet = _.zipWith((x,y)=> ({input: x, output: y}),x_train, y_train)
	const trainerOpts = config.trainer_base_options || {
	    rate: 0.05,
	    iterations: 50,
	    error: 0.2,
	    shuffle: true,
	    log: 10
	};
	trainerOpts.cost = n.Methods.Cost.CROSS_ENTROPY

	myPerceptron.train(trainingSet, trainerOpts);

	return myPerceptron
}

module.exports = {
	perceptronBinaryClassifier: perceptronBinaryClassifier
}
