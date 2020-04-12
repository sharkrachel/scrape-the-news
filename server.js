var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var ObjectId = require("mongodb").ObjectID;
// Scrapping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require models
var db = require("./models");

// Set up port
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));



app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Routes

app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/")
        .then(function (response) {
            var $ = cheerio.load(response.data);

            $("div.assetWrapper").each(function (i, element) {
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

          res.send("Scrape Complete")
        });
});

app.get("/", function (req, res) {
    res.render("index")
})


app.get("/home", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            var articleArray = [];
            for (var i = 0; i < 11; i++) {
                articleArray.push({ headline: dbArticle[i].headline, summary: dbArticle[i].summary, link: dbArticle[i].link, _id: dbArticle[i]._id });
            }
            console.log("article array: ", articleArray);
            res.render("index", { article: articleArray })
        })
})

app.get("/api/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            console.log("Find: ", dbArticle);
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        })
});

app.get("/api/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("comment")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        })
});

app.get("/api/comments/:articleid", function (req, res) {
    db.Article.findOne({ _id: req.params.articleid })
        .then(function (data) {
            console.log("Data: ", data);
            var commentArray = data.comment.map(function (value) {
                return ObjectId(value);
            })
            console.log("commentArray", commentArray);
            db.Comment.find({ _id: { $in: commentArray } })
                .then(function (result) {
                    res.render("comments", { comments: result });
                })
        })

})

app.get("/saved", function (req, res) {
    db.Article.find({ saved: true })
        .then(function (dbArticle) {
            console.log("dbArticle", dbArticle)
            var articleArray = [];
            for (var i = 0; i < dbArticle.length; i++) {
                console.log("article: ", dbArticle[i], "i: ", i)
                articleArray.push({ headline: dbArticle[i].headline, summary: dbArticle[i].summary, link: dbArticle[i].link, _id: dbArticle[i]._id, comments: dbArticle[i].comment });
            }
            // console.log("saved data: ", data);
            console.log("comments", dbArticle[0].comment);
            res.render("saved", { article: articleArray });
        })
})



app.put("/api/articles/:id", function (req, res) {
    console.log("id: ", req.params.id)
    db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: true } }, { new: true }, (err, doc) => {
        if (err) {
            console.log("Something wrong when updating data!");
        }

        res.json(doc)
    });
})



app.post("/api/articles/:id", function (req, res) {

    console.log("params: ", req.params.id)
    console.log("req.body", req.body)
    db.Comment.create(req.body)
        .then(function (dbComment) {
            console.log("dbComment: ", dbComment);
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comment: dbComment } }, { new: true })

        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        })
});




// Connect to Mongo
var MONGODB_URI = (process.env.MONGODB_URI || "mongodb://localhost/newsscraper");
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });



app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});