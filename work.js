var express = require('express');
var SortedArray = require('collections/sorted-array');
var Set = require("collections/set");
var Object = require("collections/shim-object");
var work = express();

class ResultItemParagraph {
	constructor(actualWord, sentencesIncluded, occurrences) {
		this.word = actualWord;	
		this.sentences = sentencesIncluded;
		this.occurrences = occurrences;
	}
}

class Paragraph {
    constructor(paragraph) {
	    this.paragraph = paragraph;
	    this.regExParagraph = paragraph.match(/\b((?!=|\.\s).)+(.)\b/gi);
	    this.paragraphArray = new SortedArray();
	    for(var p in this.regExParagraph) {
	    	this.paragraphArray.push(this.regExParagraph[p]);
	    }  
	    this.resultParagraph = new Set();
	    this.searchWordParagraph = function searchWordParagraph(w) {
	    	this.foundParagraph = new SortedArray();
	    	this.foundSentences = new SortedArray();
	        for(var s in this.paragraphArray.array) {
	    	    if(this.paragraphArray.array[s].search(w) !== -1) {
	    	    	this.foundParagraph.push(s);
	    	    	this.foundSentences.push(this.foundParagraph.array[s]);
	    	    	this.resultItemParagraph = new ResultItemParagraph(w, this.foundParagraph.array, this.foundSentences.length);
	    	    }        
	        }
	        this.resultParagraph.add(this.resultItemParagraph);
	    }    
    }
};

class Sentence {
	constructor(sentences) {
		this.sentences = sentences;
    	this.regExSentences = sentences.match(/\w+/gi);
    	this.sentenceArray = new SortedArray();
    	for(var word in this.regExSentences) {
    	    this.sentenceArray.push(this.regExSentences[word]);	
    	}
    	this.searchWordSentences = function searchWordSentences(w) {
    		this.foundSentences = new SortedArray();
	    	for(var z in this.sentenceArray.array) {
	    	    if(this.sentenceArray.array[z].search(w) !== -1) {
	    	    	this.foundSentences.push(this.sentenceArray.array[z]);
	    	    }        
	        }
        }
	}
}

var str = `Take this paragraph of text and return an alphabetized list of ALL unique words.  A unique word is any form of a word often communicated with essentially the same meaning. For example, fish and fishes could be defined as a unique word by using their stem fish. For each unique word found in this entire paragraph, determine the how many times the word appears in total. Also, provide an analysis of what sentence index position or positions the word is found. The following words should not be included in your analysis or result set: "a", "the", "and", "of", "in", "be", "also" and "as".  Your final result MUST be displayed in a readable console output in the same format as the JSON sample object shown below.`

const paragraphCase = new Paragraph(str),
sentenceCase = new Sentence(str);

const baseCase = sentenceCase.sentenceArray.array;

var set = new Set();

for(var y in baseCase) {
    if(baseCase[y] !== 'a' && baseCase[y] !== 'the' && baseCase[y] !== 'and' && baseCase[y] !== 'of' && baseCase[y] !== 'in' && baseCase[y] !== 'be' && baseCase[y] !== 'A' && baseCase[y] !== 'also' && baseCase[y] !== 'as') {
        set.add(baseCase[y]);
    }
}

set.map(function (n) {
    return paragraphCase.searchWordParagraph(n);
});

set.map(function (n) {
    return sentenceCase.searchWordSentences(n);
});

console.log(paragraphCase.resultParagraph);

module.exports = work;