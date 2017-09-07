#!/usr/bin/env node

const CACHE_DIR = 'caches/';
const OUTPUT_DIR = 'output/';

const ParseArgs = require('minimist');
const ARGV = ParseArgs(process.argv.slice(2), {
    string: ['ticks']
});
console.dir(ARGV);

const FS = require('fs');

function fileExists(filePath) {
    try {
        return FS.statSync(filePath).isFile();
    } catch (err) {
        if (err.code == 'ENOENT') { // no such file or directory. File really does not exist
          return false;
        }

        console.warn("EXCEPTION! fs.statSync (" + filePath + "): " + err);
        throw e; // something else went wrong, we don't have rights, ...
    }
}

var ticks = ARGV['ticks'] ? ARGV['ticks'].split(',') : [];

for (var i = 0; i < ticks.length; i++) {
    var tick = ticks[i];
    var inFile = CACHE_DIR + tick + '.html';
    if (fileExists(inFile)) {
        console.log("Considering " + inFile + "...");
        const inContent = FS.readFileSync(inFile, { encoding: 'utf8', flag: 'rs+' });
        const matchesA = inContent.match(/"dividendYield":{"raw":([\d.]+)/);
        const matchesB = inContent.match(/"trailingAnnualDividendYield":{"raw":([\d.]+)/);
        var v = null;
        if (matchesA) {
            v = matchesA[1];
        } else if (matchesB) {
            v = matchesB[1];
        } else {
            console.warn("No match");
        }

        if (v !== null) {
            console.log("\tdividendYield=" + v);
            var outContent = '<dividendYield>' + v + '</dividendYield>';
            const outFile = OUTPUT_DIR + tick + '.xml';
            FS.writeFileSync(outFile, outContent, "utf8");
            console.log("Written to " + outFile);
        }
    }
}
