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
mongoose.connect("mongodb://localhost/newsscraper", { useNewUrlParser: true });

// Routes

app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/")
    .then(function (response) {
        var $ = cheerio.load(response.data);

        $("div.assetWrapper").each(function(i, element) {
            // save an empty result object
            var result = {};

            // Add the text and href of ever link
            result.headline = $(element)
            .children()
            .text();
            result.link = $(element)
            .find("a")
            .attr("href");
            result.summary = $(this)
            .find("p")
            .text();

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

app.get("/articles", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
    res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    })
});

app.get("/articles/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id})
    .populate("comment")
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    })
});

app.post("/articles/:id", function(req, res) {
    db.Comment.create(req.body)
    .then(function(dbComment) {
        return db.Article.findOneAndUpdate({_id: req.params.id}, {comment: dbComment._id}, {new: true})
    })
    .then(function (dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    })
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});