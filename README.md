# Sprakpolisen Machine LEarning  Training

A slightly stupid gynaptic network for classifying words.
It does not work very well in terms of accurracy, and the network trains very slowly.
BUT IT WORKS STILL!!!

The program creates a neural network that reads some swedish words from file, encodes then as "good", and then appends some random string and encodes them as "bad". It then trains a network to classify them, and applies the network on some test part of the data.

Use `node app.js` to run the code!

The output, which is put in folder "output", is used by the separate module "sprakpolisen-ml-use".