var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Use the Schmea constructor to create a new CommentSchema object
var CommentSchema = new Schema({
    // name of commenter
    // name: String,
    // body of comment
    body: String 
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;