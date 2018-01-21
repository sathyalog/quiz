const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const http = require('http');

app.get('/',function(req,res){
	res.set({
		'Access-Control-Allow-Origin' : '*'
	});
	return res.redirect('/public/index.html');
}).listen(5000);

console.log("Server listening at : 5000");
app.use('/public', express.static(__dirname + '/public'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
	extended: true
}));

app.post('/wiki', function(req,res){
    console.log(req.body);
    var occupation = req.body.occupation;
    var country = req.body.country,sparqlQuery;

const options = {
    endpointUrl : 'https://query.wikidata.org/sparql',
    sparqlQuery : "SELECT ?personLabel  WHERE {\n" +
        "  ?person wdt:P106 wd:"+occupation+" .\n" +
        "  ?person wdt:P19 ?placeOfBirth .\n" +
        "  ?placeOfBirth wdt:P17 wd:"+country+ " .\n" +
        "  SERVICE wikibase:label {\n" +
        "    bd:serviceParam wikibase:language \"en\"\n" +
        "  }\n" +
        "}",
    settings : {
        headers: { Accept: 'application/sparql-results+json' },
        data: { query: sparqlQuery }
    }
}

const httprequest = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      console.log('No more data in response.');
    });
  });
})

// var port = process.env.PORT || 5000;
// app.listen(port, function() {
//    console.log("Listening on " + port);
//  }); 
