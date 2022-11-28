$(() => {

    $(".sort-item").on("click", function () {

        //https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/set
        let url = new URL(window.location.href)
        let params = new URLSearchParams(url.search);

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
                //next sort by title

                break;
            default:
                console.error("unknown value")
                break;
        }

        //changes the current url to the parameters of the clicked sort feature
        url.search = params.toString()
        window.location = url.href

    })
    // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    $('#filterForm').on('submit', function (event) {
        event.preventDefault();

        let url = new URL(window.location.href)
        let params = new URLSearchParams(url.search);
        if (params.has('tags')) {
            params.delete('tags')
        }
        if (params.has('bookFormat')) {
            params.delete('bookFormat')
        }
        if (params.has('readStatus')) {
            params.delete('readStatus')
        }
        $(this).serializeArray().forEach(element => {
            params.append(element.name, element.value)
        });
        // console.log(params.toString())
        url.search = params.toString()
        window.location = url.href
    })
})
