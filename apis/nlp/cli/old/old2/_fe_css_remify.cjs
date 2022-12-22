/*
	This Node.js script reads and alters a list of files
	by searching `([(|,|-| |:]*?)([0-9]*?)px` and replacing `${first}${(second/16)}rem`
	*
	This is useful for converting static css styles using "px"
	for a responsive web app, using the dynamic "rem" unit
	*
	A good conversion ratio is usually 16px = 1rem (ex: 10px = 0.625rem)
*/

var fs = require('fs');

function readWriteAsync(fileName) {

	fs.readFile(fileName, 'utf-8', function (err, fileContent) {

		if (err) throw err;
		try {
			fileContent = fileContent.replace(/([(|,|-| |:]*?)([0-9]*?)px/g, (matchedString, first, second) => {
				//$1($2/16)rem
				return `${first}${(second / 16)}rem`
			});
		} catch (e) {
			console.log('\nError: ' + e, '\n');
		}
		fs.writeFile(fileName, fileContent, 'utf-8', function (err) {
			if (err) throw err;
			console.log('filelistAsync complete');
		});

	});

}

// process files
readWriteAsync("./blueprint-rem.css");
readWriteAsync("./blueprint-datetime-rem.css");
