$(document).ready(function () {


    $('.modal').modal();


    $(".saveId").on("click", function () {
        var newId = $(this).attr("data-id");
        $("#hidden").attr("data-id", newId);

    })
    $(".save-button").on("click", function () {
        var newComment = {
            body: $("#textarea1").val()
        }

        var newId = $("#hidden").attr("data-id");
        console.log("new Id", newId)
        $.post("/api/articles/" + newId, newComment, function (data) {
            console.log(data)

        })

    })

    $(".save-article").on("click", function () {
        var newId = $(this).attr("data-id");
        $.ajax({
            url: "/api/articles/" + newId,
            method: "PUT"
        })
            .then(function (data) {
                console.log(data);
            })

    });

});


