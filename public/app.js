$(() => {

    $(".sort-item").on("click", function () {
        console.log(window.location)
        //https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/set
        let url = new URL(window.location.href)
        let params = new URLSearchParams(url.search);
        //shows the original state of sorting
        console.log(params.toString())
        switch (this.id) {
            case "titleAsc":
                params.set('sortBy', 'title')
                params.set('sortDirection', 'asc')
                break;
            case "titleDesc":
                params.set('sortBy', 'title')
                params.set('sortDirection', 'desc')
                break;
            case "authorAsc":
                params.set('sortBy', 'authorLast')
                params.set('sortDirection', 'asc')
                break;
            case "authorDesc":
                params.set('sortBy', 'authorLast')
                params.set('sortDirection', 'desc')
                // params.set('title', 'asc')
                break;
            default:
                console.error("unknown value")
                break;
        }
        //shows the clicked state of sorting
        console.log(params.toString())
        //changes the current url to the parameters of the clicked sort feature
        url.search = params.toString()
        console.log(url)
        window.location = url.href

    })

    console.log('ready')
})