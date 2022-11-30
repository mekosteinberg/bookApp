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
                break;
            default:
                console.error("unknown value")
                break;
        }

        //set filter to always go to page 1. otherwise if you try to filter on a diff page
        //even if the results dont have that many pages
        params.set('page', 1)

        //changes the current url to the parameters of the clicked sort feature
        url.search = params.toString()
        window.location = url.href

    })
    // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    $('#filterForm').on('submit', function (event) {
        event.preventDefault();

        const url = new URL(window.location.href)
        const params = new URLSearchParams(url.search);
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
        //set filter to always go to page 1. otherwise if you try to filter on a diff page
        //even if the results dont have that many pages
        params.set('page', 1)

        // console.log(params.toString())
        url.search = params.toString()
        window.location = url.href
    })

    $('#searchForm').on('submit', function(event) {
        event.preventDefault();
        const url = new URL(window.location.href)
        const params = new URLSearchParams();
        params.set('page', 1)
        // to make the search string safe for the url, it needs to be encoded
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
        const searchValue = $('#searchField').val()
        const encodedSearch = encodeURIComponent(searchValue)
        params.set('search', encodedSearch)
        // console.log(params.toString())
        url.search = params.toString()
        window.location = url.href
    })

    // wire up click handler for next and previous buttons
    // use .get() for url search params to try and get current page value. if empty, use 1
    // for next incremet page value. for previous decrement page value.
    $('#prevBtn').on('click', function (event) {

        const url = new URL(window.location.href)
        const params = new URLSearchParams(url.search);
        const page = params.get('page')
        //multiply by 1 to ensure page is a number
        params.set('page', (page * 1) - 1)
        url.search = params.toString()
        window.location = url.href
    })

    $('#nextBtn').on('click', function (event) {

        const url = new URL(window.location.href)
        const params = new URLSearchParams(url.search);
        const page = params.get('page') || 1
        params.set('page', (page * 1) + 1)
        url.search = params.toString()
        window.location = url.href
    })
})
