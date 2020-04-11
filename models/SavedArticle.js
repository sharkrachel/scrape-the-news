var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SavedArticleSchema = new Schema({
    headline: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

var SavedArticle = mongoose.model("SavedArticle", SavedArticleSchema);

module.exports = SavedArticle;