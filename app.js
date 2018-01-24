const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const http = require('https');
const redis = require('redis');
const request = require('superagent');


let client = redis.createClient();
client.on('connect', function(){
    console.log('Connected to Redis..');
})

/* Create DB Connection */
const mongoConnection = require('./mongoConnection');
mongoConnection.connect();

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

app.post('/wiki', function(req,res){
    var occupation = req.body.occupation;
    var country = req.body.country;
    const sparql = 'SELECT ?personLabel ?placeOfBirthLabel WHERE {  ?person wdt:P106 wd:'+occupation+'. ?person wdt:P19 ?placeOfBirth. ?placeOfBirth wdt:P17 wd:'+country+'. SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }} LIMIT 100';
    const url = "https://query.wikidata.org/sparql";
    
    request
        .get(url)
        .set('Accept', 'application/sparql-results+json')
        .query({query: sparql})
        .end(function(err, res) {
            if(err) { console.error('ERR:', err); process.exit(-1); }
            let body = res.body;
            let results = body.results.bindings.map((r) => {
            return {"person": r.personLabel.value, "countryOfBirth": r.placeOfBirthLabel.value}
            });
            client.publish('wikidata', JSON.stringify(results));
            console.log(`Found ${results.length} number of records`);
            
        });
    res.redirect('/public/data.html');  
});    
