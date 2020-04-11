$(document).ready(function () {
    $(".get-comments").on("click", function () {
        var articleIds = $(this).attr("data-ids");
        $.get("/api/comments/" + articleIds, function (result) {
            console.log(result);
            var commentText = result.map(function(comment) {
                return comment.body;
            })
            console.log(commentText);
        })

    })

})