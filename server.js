var express = require('express');
var app = express();
var path = require('path');
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var PORT = process.env.PORT || 3000;
var exphbs = require('express-handlebars');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

if (process.env.PORT){
	//get path
	mongoose.connect('mongodb://heroku_wnhtnc42:clteb5cu9f6jn4jmrf6cmbs6ji@ds141474.mlab.com:41474/heroku_wnhtnc42');
} else {
	mongoose.connect('mongodb://localhost/test');
}

var models = require('./models/models.js')(mongoose);
var Article = models.Article;

// app.use(express.static(__dirname + '/Mongodb/public'));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

//setting up handlebars
app.engine('handlebars',exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

///////////////////////////////////ROUTES///////////////////////////////////////

app.get('/', function (req, res) {

	Article.find().limit(20).exec(function(err, data){
	if (err){

		return console.error(err);
	}

	res.render('home', {Articles: data});

	});
	

   // res.sendFile(__dirname + '/public/index.html');
 
   // res.sendFile(__dirname + '/assets/logic/index.js');
})

app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      // console.log(result);
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
        	console.log(err);
        } else {
         	console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

app.get('/findAll', function(req, res){
	Article.find().exec(function(err, data){
		if (err){

			return console.error(err);
		}

		res.json(data);

	});
})

///////////////////END ROUTES///////////////////////////

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  	console.log("mongoose running");

 	var server = app.listen(PORT, function () {
		var host = server.address().address
		var port = server.address().port
   
   		console.log("Example app listening at http://%s:%s", host, port)
	})
});

