import levenshtein from "fast-levenshtein";
import r from "ramda";

import names from "../data/names.js";


const shuffle = array => array.sort(() => 0.5 - Math.random());

const notebookName = process.argv[2];

shuffle(names);

console.log(r.sortBy(name => levenshtein.get(notebookName,name), names)[0]);