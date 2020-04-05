var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Scrapping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require models
var db = require("./models");

// Set up port
var PORT = 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Connect to Mongo
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// Routes

app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/")
    .then(function (response) {
        var $ = cheerio.load(response.data);

        $("article").each(function(i, element) {
            // save an empty result object
            var result = {};

            // Add the text and href of ever link
            result.headline = $(this)
            .children("h2")
            .text();
            result.summary = $(this)
            .children(".summary")
            .text();
            result.link = $(this)
            .children("h2")
            .children("a")
            .attr("href");

            // Create a new Article using the result object
            db.Article.create(result)
            .then(function (dbArticle) {
                console.log(dbArticle);
            })
            .catch(function (err) {
                console.log(err);
            });
        });

        res.send("Scrape Complete");
    });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});