"use-strict";

/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/

// Themes.
const themes = [
    {
        normal: "#5468e7",
        dark: "#4c5ed0",
        light: "#98a4f1",
        veryLight: "#eef0fd"
    }, {
        normal: "#e94c2b",
        dark: "#d24427",
        veryLight: "#fdedea",
        light: "#f29480"
    }
];

// Choose random color theme.
let colorTheme = themes[Math.floor(Math.random() * themes.length)];

// This function set random color theme.
function setTheme() {
    // Change css values.
    document.documentElement.style.setProperty("--primary", colorTheme.normal);
}

// Set random theme.
setTheme();


// Set default variables.
var simScore = 0;
var simScoreName = ["Pearson", "eucl"];
var user = { "Name": "Current User", Reviews: {} };
var recm = false;
var ratingSite = "Imdb_rating";

// Update dom data according to default values
document.getElementById("ratingsite_id").value = "Imdb_rating";
document.getElementById("simscore_id").value = "0";

// Show movies.
function showMovies(rs, cs) {
    ratingSite = cs || "Imdb_rating";
    let moviesEl = document.getElementById("moviesList_id");
    let template = ``;
    Object.keys(moviesData).forEach(_id => {
        let el = document.createElement("div");
        el.className = "media mb-3";
        let r = "Not Rated";
        let rv = 0;
        if (user.Reviews[_id] != undefined) {
            r = user.Reviews[_id].Rating;
            if (rs == "Imdb_rating" && cs != "Imdb_rating") {
                r = r * 10;
                rv = r;
            } else if (rs != "Imdb_rating" && cs == "Imdb_rating") {
                rv = r;
                r = r / 10;
            } else {
                rv = r;
            }
            user.Reviews[_id].Rating = r;
        }
        template += `<div class="card p-2 px-4 flex  mb-2">
        <img height="124" width="91" class="mr-3 shadow hide-on-md" src="data:image/png;base64,${moviesData[_id].Poster}">
        <div class="media-body flex-wrap">
        <h3 class="font-bold mb-0 hover:underline cursor-pointer" onclick="javascript: window.location = 'https://www.imdb.com/title/${_id}';">${moviesData[_id].Title} <small class="text-gray">${moviesData[_id].Year}</small></h3>
        <h4 class="text-subtitle">${moviesData[_id].Description}</h4>
        <h4><font class="bg-primary p-2 px-4 text-white"><i class="fal fa-star"></i> <span id="${_id}_rating_id">${rv}</span></font></h4>
        <input type="range" class="range-slider" min="1" max="100" data-id="${_id}" onchange="javascript: saveRating(this)" oninput="javascript: inputRating(this);" value="${rv}" id="myRange">
        </div></div>`;
    });
    moviesEl.innerHTML = template;
}

// Input rating.
function inputRating(el) {
    let id = el.getAttribute("data-id");
    let r = el.value;
    if (ratingSite == "Imdb_rating") { r = r / 10; }
    document.getElementById(`${id}_rating_id`).innerHTML = r;
}

// Save rating.
function saveRating(el) {
    let id = el.getAttribute("data-id");
    let r = el.value;
    if (ratingSite == "Imdb_rating") { r = parseFloat(r / 10); } else {
        r = parseInt(r);
    }
    user.Reviews[id] = { "Title": moviesData[id].Title, "Rating": r };
    if (Object.keys(user.Reviews).length > 2) {
        recMovies();
    }
}

// Recommend movies.
function recMovies() {
    if (Object.keys(user.Reviews).length < 2) {
        return;
    }
    let movies = {};
    recm = true;
    // Get recommendation according to site.
    if (ratingSite == "Imdb_rating") {
        imdbCriticsData["u0"] = user;
        movies = getRecommendation("u0", imdbCriticsData, simScoreName[simScore], 5);
    } else if (ratingSite == "Metascore") {
        metaCriticsData["u0"] = user;
        movies = getRecommendation("u0", metaCriticsData, simScoreName[simScore], 5);
    } else {
        rottenTomatoesData["u0"] = user;
        movies = getRecommendation("u0", rottenTomatoesData, simScoreName[simScore], 5);
    }
    let res = document.getElementById("rec_movies_id");
    let template = ``;
    // Show result on page
    let limit = 5;
    if (movies.length < 5) {
        limit = movies.length;
    }
    for (let i = 0; i < limit; i++) {
        if (ratingSite == "Imdb_rating") {
            movies[i].Rating = movies[i].Rating * 10;
        }
        template += `<div class="card p-2 mb-2">
        <h4 class="font-bold">${movies[i].Title}</h4>
        <div class="overflow-hidden mb-2 h-2 flex bg-light">
        <div style="width: ${movies[i].Rating}%;" id="progress_id"
            class="flex flex-col whitespace-nowrap justify-center bg-primary"></div>
        </div></div>`;
    }
    res.innerHTML = template;
}

showMovies();

// Calculate eucl distance between elements.
function euclDistance(first, second) {
    let dist = 0;
    Object.keys(first.Reviews).forEach(_id => {
        if (second.Reviews[_id] != undefined) {
            // Calculate sum of euclidean distance.
            dist += Math.pow(first.Reviews[_id].Rating - second.Reviews[_id].Rating, 2);
        }
    });
    return 1 / (1 + dist);
}

// Caculating pearson correlation score.
function pearsonScore(first, second) {
    let sumXY = 0;
    let sumX = 0;
    let sumXX = 0;
    let sumYY = 0;
    let sumY = 0;
    let total = 0;
    Object.keys(first.Reviews).forEach(_id => {
        if (second.Reviews[_id] != undefined) {
            // Checks if both have same elements.
            sumXY += (first.Reviews[_id].Rating * second.Reviews[_id].Rating);
            sumX += first.Reviews[_id].Rating;
            sumY += second.Reviews[_id].Rating;
            sumXX += (first.Reviews[_id].Rating * first.Reviews[_id].Rating);
            sumYY += (second.Reviews[_id].Rating * second.Reviews[_id].Rating);
            total++;
        }
    });
    // Caculating pearson correlation score.
    // (sum(xy) - sum(x)*sum(y) / n) / sqrt( (sum(xx) - sum(x)^2 / n) * (sum(yy) - sum(y)^2 / n) ).
    let num = sumXY - ((sumX * sumY) / total);
    let den = Math.sqrt((sumXX - (Math.pow(sumX, 2) / total)) * (sumYY - (Math.pow(sumY, 2) / total)));
    if (den == 0 || isNaN(num) || isNaN(den)) { return 0; }
    return num / den;
}

// Similar k data for specicified selectedItem 
function similar(selectedId, data, correlationType) {
    // Set default values.
    if (correlationType == undefined) {
        correlationType = "eucl";
    }
    let similar = [];
    Object.keys(data).forEach(_id => {
        if (_id != selectedId) {
            // Calculate similarity.
            if (correlationType == "eucl") {
                similar.push({ "similarityScore": euclDistance(data[selectedId], data[_id], data), "data": data[_id] });
            } else {
                similar.push({ "similarityScore": pearsonScore(data[selectedId], data[_id], data), "data": data[_id] });
            }
        }
    });
    // Sort on based of similarity score.
    for (let i = 0; i < similar.length; i++) {
        for (let j = i + 1; j < similar.length; j++) {
            if (similar[j].similarityScore > similar[i].similarityScore) {
                // Swap.
                let temp = similar[j];
                similar[j] = similar[i];
                similar[i] = temp;
            }
        }
    }
    return similar;
}

// Recommendation.
function getRecommendation(selectedId, data, correlationType, k) {
    let simData = similar(selectedId, data, correlationType);
    let limit = k || simData.length;
    let items = {};
    for (let i = 0; i < limit; i++) {
        Object.keys(simData[i].data.Reviews).forEach(_id => {
            if (data[selectedId].Reviews[_id] == undefined) {
                // Item not reviewed .
                if (items[_id] == undefined) {
                    items[_id] = { "similarityWeight": simData[i].similarityScore * simData[i].data.Reviews[_id].Rating, "similaritySum": simData[i].similarityScore };
                } else {
                    items[_id].similarityWeight += (simData[i].similarityScore * simData[i].data.Reviews[_id].Rating);
                    items[_id].similaritySum += simData[i].similarityScore;
                }
            }
        });
    }
    let result = [];
    // Calculate prediction.
    Object.keys(items).forEach(_id => {
        items[_id].Rating = parseFloat((items[_id].similarityWeight / items[_id].similaritySum).toFixed(1));
        result.push({ "Rating": items[_id].Rating, "Title": moviesData[_id].Title, "id": _id });
    });

    result.sort((a, b) => b.Rating - a.Rating);
    return result;
}