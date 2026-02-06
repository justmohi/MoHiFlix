const API_KEY = '42ba263cafdf8e88b49b1367b5a06ea7';
const detailsContainer = document.getElementById('movieDetails');
const relatedContainer = document.getElementById('relatedMovies');
const epSelector = document.getElementById('episodeSelector');

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');
const type = urlParams.get('type') || 'movie';

async function getMovieDetails() {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}?api_key=${API_KEY}`);
        const movie = await res.json();

        document.title = `Watch ${movie.title || movie.name} Online - MoHiFlix`;

        detailsContainer.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title || movie.name}">
            <div class="info">
                <h1>${movie.title || movie.name}</h1>
                <p>⭐ ${movie.vote_average.toFixed(1)} | ${movie.original_language.toUpperCase()} | ${movie.release_date || movie.first_air_date}</p>
                <p class="overview">${movie.overview}</p>
                
                <div id="playerPlaceholder" style="margin-top: 30px; text-align: center; background: #111; padding: 50px 20px; border-radius: 10px; border: 1px solid #333;">
                    <button id="watchBtn" style="background: #e50914; color: white; border: none; padding: 15px 40px; border-radius: 50px; cursor: pointer; font-weight: bold; font-size: 20px; box-shadow: 0 5px 20px rgba(229, 9, 20, 0.4); transition: 0.3s;">
                        ▶ Watch ${type === 'movie' ? 'Movie' : 'Series'} Now
                    </button>
                    <p style="color: #888; margin-top: 15px; font-size: 14px;">Click to stream in HD Quality</p>
                </div>

                <div id="videoContainer" style="display: none; margin-top: 20px; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; background: #000;">
                    <iframe id="videoIframe" src="" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        `;

        // Watch button click logic (Updated with new domain)
        document.getElementById('watchBtn').onclick = function() {
            const videoContainer = document.getElementById('videoContainer');
            const placeholder = document.getElementById('playerPlaceholder');
            const iframe = document.getElementById('videoIframe');

            iframe.src = `https://vidsrc-embed.ru/embed/${type}?tmdb=${movie.id}`;
            placeholder.style.display = 'none';
            videoContainer.style.display = 'block';
        };

        if (type === 'tv') {
            setupTVSelector(movie.number_of_seasons);
        }
    } catch (error) {
        console.error('Error fetching details:', error);
    }
}

async function setupTVSelector(seasons) {
    epSelector.style.display = 'block';
    const sSelect = document.getElementById('seasonNum');
    const eSelect = document.getElementById('episodeNum');

    sSelect.innerHTML = ''; 
    for (let i = 1; i <= seasons; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.text = `Season ${i}`;
        sSelect.add(opt);
    }

    const updateEpisodes = async () => {
        const sNum = sSelect.value;
        const res = await fetch(`https://api.themoviedb.org/3/tv/${movieId}/season/${sNum}?api_key=${API_KEY}`);
        const sData = await res.json();
        
        eSelect.innerHTML = '';
        sData.episodes.forEach(ep => {
            let opt = document.createElement('option');
            opt.value = ep.episode_number;
            opt.text = `Episode ${ep.episode_number}: ${ep.name}`;
            eSelect.add(opt);
        });
    };

    sSelect.onchange = updateEpisodes;
    await updateEpisodes();

    document.getElementById('updatePlayer').onclick = () => {
        const videoContainer = document.getElementById('videoContainer');
        const placeholder = document.getElementById('playerPlaceholder');
        const iframe = document.getElementById('videoIframe');

        // TV Episode logic (Updated with new domain)
        iframe.src = `https://vidsrc-embed.ru/embed/tv?tmdb=${movieId}&season=${sSelect.value}&episode=${eSelect.value}`;
        placeholder.style.display = 'none';
        videoContainer.style.display = 'block';
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };
}

async function fetchRelated() {
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}/recommendations?api_key=${API_KEY}`);
    const data = await res.json();
    relatedContainer.innerHTML = '';
    data.results.slice(0, 8).forEach(item => {
        const div = document.createElement('div');
        div.classList.add('movie-card');
        div.onclick = () => window.location.href = `details.html?id=${item.id}&type=${type}`;
        div.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">
            <div class="card-info">
                <h3>${item.title || item.name}</h3>
                <p>⭐ ${item.vote_average.toFixed(1)}</p>
            </div>
        `;
        relatedContainer.appendChild(div);
    });
}

getMovieDetails();
fetchRelated();

// Server change function (Updated with new domain)
function addAlternativeServers(movieId, type) {
    const infoDiv = document.querySelector('.info');
    
    const serverDiv = document.createElement('div');
    serverDiv.style.marginTop = "20px";
    serverDiv.innerHTML = `
        <h4 style="color: #e50914; margin-bottom: 10px;">If server 1 doesn't work, try Server 2:</h4>
        <div style="display: flex; gap: 10px;">
            <button onclick="changeServer('vidsrc')" style="background: #333; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Server 1 (Default)</button>
            <button onclick="changeServer('2embed')" style="background: #333; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Server 2 (Alternative)</button>
        </div>
    `;
    infoDiv.appendChild(serverDiv);
}

window.changeServer = function(serverType) {
    const iframe = document.getElementById('videoIframe');
    const placeholder = document.getElementById('playerPlaceholder');
    const videoContainer = document.getElementById('videoContainer');
    
    placeholder.style.display = 'none';
    videoContainer.style.display = 'block';

    if (serverType === 'vidsrc') {
        iframe.src = `https://vidsrc-embed.ru/embed/${type}?tmdb=${movieId}`;
    } else if (serverType === '2embed') {
        iframe.src = `https://www.2embed.cc/embed/${movieId}`;
    }
};

setTimeout(() => {
    addAlternativeServers(movieId, type);
}, 2000);
