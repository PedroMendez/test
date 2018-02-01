var express = require('express');
var custom = express();
var Tokenizer = require('sentence-tokenizer');
var nlp = require('compromise');
var SortedArraySet = require("collections/sorted-array-set");
var SortedArrayMap = require("collections/sorted-array-map");
var levenshtein = require('fast-levenshtein');

let str = `Take this paragraph of text and return an alphabetized list of ALL unique words.  A unique word is any form of a word often communicated with essentially the same meaning. For example, fish and fishes could be defined as a unique word by using their stem fish. For each unique word found in this entire paragraph, determine the how many times the word appears in total. Also, provide an analysis of what sentence index position or positions the word is found. The following words should not be included in your analysis or result set: "a", "the", "and", "of", "in", "be", "also" and "as".  Your final result MUST be displayed in a readable console output in the same format as the JSON sample object shown below.`

var tokenizer = new Tokenizer('Sentences');

tokenizer.setEntry(str);

const notArray = ['a', 'the', 'and', 'of', 'in', 'be', 'also', 'as'];

const wordsInSentence = [];
for (i = 0; i < tokenizer.getSentences().length; i++) { 
    wordsInSentence[i] = tokenizer.getTokens(i);
    let s = nlp(wordsInSentence[i]), all = s.all(); all = all.not(notArray);
    wordsInSentence[i] = all.out('array');
}

const results = new SortedArrayMap();

for (i = 0; i < wordsInSentence.length; i++) {
    for (j = 0; j < wordsInSentence[i].length; j++) {
        let wordResult = results.get(wordsInSentence[i][j]);
        if(wordResult === undefined) {
            const sentences = new SortedArraySet();
            sentences.push(i);
            results.set(wordsInSentence[i][j], {
                'word': wordsInSentence[i][j],
                'total_occurrences': 1,
                'sentence_indexes': sentences
            });
        } else {  
            wordResult.total_occurrences++; 
            wordResult.sentence_indexes.push(i);
        }        
    }
}

var obj = results.toObject();

function levenshteinDistance(p, r) {
    obj[r].total_occurrences = obj[r].total_occurrences + obj[p].total_occurrences;
    if(obj[r].sentence_indexes.array[0] !== obj[p].sentence_indexes.array[0]) {
        obj[r].sentence_indexes.array.addEach(obj[p].sentence_indexes.array);
        obj[r].sentence_indexes.array.sort();
    }
    results.delete(p);
}

for (let p in obj) {
    for (let r in obj) {
        if(levenshtein.get(p, r) == 1 && p.match(/s$/g)) {
            levenshteinDistance(p, r);
        } else if(levenshtein.get(p, r) == 2 && p.match(/es$/g)) {
            levenshteinDistance(p, r);
        }
    }
}

const json = JSON.stringify(results.toArray(), null, 2);

console.log(json);

module.exports = custom;