const api = "http://www.omdbapi.com/?apikey=239d4348";

const searchData = {
    "searchValue": "",
}

const getSearchResults = async function(search, page=1) {
    try {
        const searchResults = await axios(`${api}&s=${search}&page=${page}`);
        // console.log(searchResults.data);
        return searchResults.data;
    } catch(e) {
        return e;
    }
}

const getTitleInfo = async function(titleID) {
    try {
        const titleInfo = await axios(`${api}&i=${titleID}&plot=full`);
        return titleInfo.data;
    } catch(e) {
        return e;
    }
}

//console.log(getTitleInfo("tt0462499"));

const elGen = function(type, cl, content, callback) {
    const el = document.createElement(type);
    
    if(cl !== "") el.classList.add(...cl);
    if(content !== "") el.innerText = content;
    callback && callback(el);

    return el;
}

const displayTitleInfo = function(data) {
    const {
            Actors,
            Awards,
            BoxOffice,
            Country,
            DVD,
            Director,
            Genre,
            Language,
            Metascore,
            Plot,
            Poster,
            Production,
            Rated,
            Released,
            Runtime,
            Title,
            Type,
            Website,
            Writer,
            Year
          } = data;

    const titleInfo = elGen("section", "", "", function(el) {
        el.setAttribute("id", "title-info");
    });

    const titleInfoHeader = elGen("section", "", "", function(el) {
        el.setAttribute("id", "title-info-header");
    });

    const titleInfoHeaderH1 = elGen("h1", "", Title);
    const titleInfoHeaderClose = elGen("button", "", "X", function(el) {
        el.addEventListener("click", function(event) {
            titleInfo.remove();
        });
    })

    const titleInfoBody = elGen("section", "", "", function(el) {
        el.setAttribute("id", "title-info-body");
    });

    const titlePoster = elGen("img", "", "", function(el) {
        el.setAttribute("id", "title-poster");
        el.setAttribute("src", Poster);
    });

    const titleDetails = elGen("div", "", "");

    const titleDetailsEls = [
        elGen("p", "", `Actors: ${Actors}`),
        elGen("p", "", `Awards: ${Awards}`),
        elGen("p", "", `BoxOffice: ${BoxOffice}`),
        elGen("p", "", `Country: ${Country}`),
        elGen("p", "", `DVD: ${DVD}`),
        elGen("p", "", `Director: ${Director}`),
        elGen("p", "", `Genre: ${Genre}`),
        elGen("p", "", `Language: ${Language}`),
        elGen("p", "", `Metascore: ${Metascore}`),
        elGen("p", "", `Production: ${Production}`),
        elGen("p", "", `Rated: ${Rated}`),
        elGen("p", "", `Released: ${Released}`),
        elGen("p", "", `Runtime: ${Runtime}`),
        elGen("p", "", `Type: ${Type}`),
        elGen("p", "", `Website: ${Website}`),
        elGen("p", "", `Writer: ${Writer}`),
        elGen("p", "", `Year: ${Year}`)
    ];

    titleDetails.append(...titleDetailsEls);
    titleInfoBody.append(titleDetails, elGen("p", "", `Plot: ${Plot}`));

    titleInfoHeader.append(titleInfoHeaderH1, titleInfoHeaderClose);
    titleInfo.append(titleInfoHeader, titleInfoBody);
    document.querySelector("main").appendChild(titleInfo);
}

const resultsEl = document.querySelector("#results");
const createResultElement = function(resultData) {
    const { Poster, Title, Year, imdbID, Type } = resultData;

    const resultEl = elGen("div", ["result", imdbID], "", function(el) {
        el.addEventListener("click", async function(event) {
            document.body.appendChild(elGen("img", "", "", function(el) {
                el.setAttribute("id", "loader");
                el.setAttribute("src", "images/loader.gif");
            }));
            displayTitleInfo(await getTitleInfo(imdbID));
            document.querySelector("#loader").remove();
        });
    });

    const posterEl = elGen("img", ["poster"], "", function(el) {
        if(Poster !== "N/A") {
            el.setAttribute("src", Poster);
        } else {
            el.setAttribute("src", "images/fallback.png");
        }
        
    });

    const resultInfoEl = elGen("div", ["result-info"], "");

    const infoEls = [
                     elGen("h2", "", Title),
                     elGen("p", "", Year), 
                     elGen("p", "", Type)
                    ]

    resultInfoEl.append(...infoEls);
    
    resultEl.append(posterEl, resultInfoEl);

    resultsEl.appendChild(resultEl);
}

const loadPagination = async function(totalResults) {
    const tResults = parseInt(totalResults)
    console.log(tResults);
    let pages = 1;
    const paginationList = document.querySelector("#pagination-list");

    if(tResults >= 10) {
        pages = Math.floor(tResults / 10)

        if(tResults % 10 > 0) {
            pages++;
        }

        console.log(pages);
    }

    paginationList.innerHTML = "";
    for(let i = 1; i <= pages; i++) {
        paginationList.appendChild(elGen("li", ["page"], i, function(pageEl) {
            pageEl.addEventListener("click", async function() {
                // console.log(pageEl.innerText);
                await doSearch(searchData.searchValue, pageEl.innerText);
            });
        }));
    }
}

const searchForm = document.querySelector("form");
const topscrollBtn = document.querySelector("#topscroll");
const doSearch = async function(search, page) {
    document.body.appendChild(elGen("img", "", "", function(el) {
        el.setAttribute("id", "loader");
        el.setAttribute("src", "images/loader.gif");
    }));

    const searchValue = search;
    const searchResults = await getSearchResults(searchValue, page);

    resultsEl.innerHTML = "";
    
    for(let result of searchResults.Search) {
        createResultElement(result);
    }

    document.querySelector("#loader").remove();
    window.scrollTo({
        top: document.querySelector("#intro").clientHeight,
        behavior: "smooth"
    });

    topscrollBtn.setAttribute("style", "display: block");
    loadPagination(searchResults.totalResults);
}

searchForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    searchData.searchValue = event.target.elements.search.value;
    console.log(searchData.searchValue);
    doSearch(searchData.searchValue);
    
});

topscrollBtn.addEventListener("click", function(event) {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
