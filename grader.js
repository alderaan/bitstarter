#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://google.com";
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	//process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};


//here I get the website of interest
var websitesuperchecker = function(apiurl, checksfile) {

    rest.get(apiurl).on('complete', function(result) {
	if (result instanceof Error) {
	    console.log('Error: ' + result.message);
	    this.retry(5000); // try again after 5 sec
	    process.exit(1);
	} else {
	//return result;
	//Careful! restler works asynchronously. I only proceed once restler gives the response
	    checkHtmlFile1(result,checksfile);
	
 	}
    });
};


//I use this for files as input
var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
        
};

//I use this for urls as input
var cheerioHtmlFile1 = function(htmlfile) {
    return cheerio.load(htmlfile);
        
};

//here, the json string from checks.json is parsed into a normal string
var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

//I use this for files as input 
var checkHtmlFile = function(htmlfile, checksfile) {
   $ = cheerioHtmlFile(htmlfile);
var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

//I use this for urls as input
var checkHtmlFile1 = function(htmlfile, checksfile) {
   $ = cheerioHtmlFile1(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    var outJson1 = JSON.stringify(out, null, 4);
    console.log(outJson1);
    //return out;
};


var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'URL to check')
	.parse(process.argv);
    if (program.url) {
	websitesuperchecker(program.url, program.checks)
	}
    else {
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
	}
} 

else {
    exports.checkHtmlFile = checkHtmlFile;
}
