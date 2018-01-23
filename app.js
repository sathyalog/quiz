const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const http = require('https');
const redis = require('redis');

let client = redis.createClient();

client.on('connect', function(){
    console.log('Connected to Redis..');
})

app.get('/',function(req,res){
	res.set({
        'Access-Control-Allow-Origin' : '*',
        
	});
	return res.redirect('/public/index.html');
}).listen(5000);

console.log("Server listening at : 5000");
app.use('/public', express.static(__dirname + '/public'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
	extended: true
}));

app.get('/wiki',function(req,res){
    return res.redirect('/public/data.html');
})

app.post('/wiki', function(req,res){
    var occupation = req.body.occupation;
    var country = req.body.country;
    res.setHeader( "Accept", "application/sparql-results+json");
    let options = {
        "method": "GET",
        "hostname": "query.wikidata.org",
        "path": "/sparql?format=json&props=labels",
       
    };
    // let sparqlQuery = `SELECT ?personLabel  WHERE { \
    //     ?person wdt:P106 wd:`+occupation+`, \
    //     ?person wdt:P19 ?placeOfBirth, \
    //     ?placeOfBirth wdt:P17 wd:`+country+`, \
    //     SERVICE wikibase:label { \
    //     bd:serviceParam wikibase:language "en" \
    //     }} LIMIT 100`;
        
    // let settings = {
    //     headers: { Accept: 'application/sparql-results+json' },
    //     data: { query: sparqlQuery }
    // };
    

    let httprequest = http.request(options, function (res) {
        
        res.on("data", function (chunk) {
            //let results = JSON.parse(chunk);
            console.log(`BODY: ${chunk}`);
            //console.log(results);
            client.publish('wikidata', chunk);
        });
        
        res.on("end", function () {
            console.log('No more data in response.');
        });
    });

    httprequest.write(`SELECT ?personLabel  WHERE { \
        ?person wdt:P106 wd:`+occupation+`, \
        ?person wdt:P19 ?placeOfBirth, \
        ?placeOfBirth wdt:P17 wd:`+country+`, \
        SERVICE wikibase:label { \
        bd:serviceParam wikibase:language "en" \
        }} LIMIT 100`);
        httprequest.end();
});    
// const options = {
//     endpointUrl : 'https://query.wikidata.org/sparql',
//     sparqlQuery : "SELECT ?personLabel  WHERE {\n" +
//         "  ?person wdt:P106 wd:"+occupation+" .\n" +
//         "  ?person wdt:P19 ?placeOfBirth .\n" +
//         "  ?placeOfBirth wdt:P17 wd:"+country+ " .\n" +
//         "  SERVICE wikibase:label {\n" +
//         "    bd:serviceParam wikibase:language \"en\"\n" +
//         "  }\n" +
//         "}",
//     settings : {
//         headers: { Accept: 'application/sparql-results+json' },
//         data: { query: sparqlQuery }
//     }
// }

// const httprequest = http.request(options, (res) => {
//     console.log(`STATUS: ${res.statusCode}`);
//     console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//     res.setEncoding('utf8');
//     res.on('data', (chunk) => {
//       console.log(`BODY: ${chunk}`);
//     });
//     res.on('end', () => {
//       console.log('No more data in response.');
//     });
//   });
