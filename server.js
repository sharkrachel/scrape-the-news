var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

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
app.use(expess.json());

// Make public a static folder
app.use(express.static("public"));

// Connect to Mongo
mongoose.connect("mondodb://localhost/unit18Populater", {useNewUrlParser: true});