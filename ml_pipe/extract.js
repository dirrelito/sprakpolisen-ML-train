'use strict'
const fs = require('fs');
const randomstring = require('randomstring')


const loadWordsFromFile = (path,maxLen) => {

	if(!fs.existsSync(path)) { throw Error("Specified path does not exist!")};

	const allWords = fs.readFileSync(path)
  .toString()
  .split("\n")

  return allWords.filter(string => string.length <= maxLen)

}


const generateRandomStrings = opts =>  {
	if(typeof opts != 'object') {opts = {}};

	const count = opts.count || 50;
	const maxLen = opts.maxLen || 4;
	const lowercase = opts.lowercase || false;
	
	const lengths = Array(count).fill(0).map(dummy => 1+Math.round(Math.random()*(maxLen-1)))

  let strings = lengths.map(i => randomstring.generate(i))
  if (lowercase) { strings = strings.map(s => s.toLowerCase())}
  return strings;
}


module.exports = {
	loadWordsFromFile: loadWordsFromFile,
	generateRandomStrings: generateRandomStrings
}
