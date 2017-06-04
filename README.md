# Sprakpolisen Machine Learning  Training

## About
A slightly naive implementation of [neataptic](https://github.com/wagenaartje/neataptic) perceptron network for classifying words.

It works so-so in terms of accurracy, and the network trains quite slowly. But it works! :D

The program creates a neural network that reads some swedish words from file, encodes then as "good", and then appends some random string and encodes them as "bad". It then trains a network to classify them, and applies the network on some test part of the data.


## Instal/Dev

1) Run `npm intall` to get dependencies.
2) Run `npm start` to run [the main file](app.js) and output data to [output](output). You will get some diagnostics in the console, and the output is some files which is all the parameters needed to load the network for later use.
