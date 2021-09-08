import levenshtein from "fast-levenshtein";
import r from "ramda";

import names from "../data/names.js";


const notebookName = process.argv[2];

console.log(r.sortBy(name => levenshtein.get(notebookName,name), names)[0]);