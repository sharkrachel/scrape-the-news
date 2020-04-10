
    $('.modal').modal();


    $(".saveId").on("click", function () {
        var newId = $(this).attr("data-id");
        $("#save-button").attr("data-id", newId);

    })
    $("#save-button").on("click", function () {
        var newComment = {
            body: $("#textarea1")
        }
        var newId = $(this).attr("data-id");
        console.log("new Id", newId)

        $.ajax({
            method: "POST",
            url: "/api/articles/" + newId,
            data: newComment
            
        })
        .then(function(data) {
            console.log("data: ", data);
        })
    })

