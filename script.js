const API_KEY = '42ba263cafdf8e88b49b1367b5a06ea7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentType = 'movie'; 
let currentGenre = '';
let allowedMovieIds = []; // movies_db.json থেকে আসা ID গুলো এখানে থাকবে
let userCountry = 'US'; // ডিফল্ট কান্ট্রি

const movieContainer = document.getElementById('movies');
const searchInput = document.getElementById('search');
const genreSelect = document.getElementById('genreSelect');
const loadMoreBtn = document.getElementById('loadMore');

// ১. ডাটাবেস এবং ইউজারের লোকেশন লোড করার ফাংশন
async function initializeApp() {
    try {
        // movies_db.json থেকে অনুমোদিত মুভির লিস্ট আনা
        const dbRes = await fetch('movies_db.json');
        const dbData = await dbRes.json();
        allowedMovieIds = dbData.map(item => String(item.tmdb_id));

        // ইউজারের কান্ট্রি ডিটেক্ট করা
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        userCountry = geoData.country_code || 'US';
        
        console.log(`User Country: ${userCountry}`);
        fetchRegionalContent();
    } catch (error) {
        console.error('Initialization Error:', error);
        fetchRegionalContent(); // এরর হলেও ডিফল্ট কন্টেন্ট লোড হবে
    }
}

// ২. কন্টেন্ট রেন্ডার করার সময় ফিল্টার করা
function renderFilteredContent(items) {
    items.forEach(item => {
        // শুধুমাত্র সেই মুভিগুলো দেখাবে যেগুলো movies_db.json এ আছে
        if (!allowedMovieIds.includes(String(item.id))) return;
        if (!item.poster_path) return;

        const div = document.createElement('div');
        div.classList.add('movie-card');
        const type = item.media_type || currentType;
        
        div.onclick = () => window.location.href = `details.html?id=${item.id}&type=${type}`;
        
        div.innerHTML = `
            <img src="${IMG_URL + item.poster_path}">
            <div class="card-info">
                <h3>${item.title || item.name}</h3>
                <p>⭐ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</p>
                <span class="type-badge">${type.toUpperCase()}</span>
            </div>
        `;
        movieContainer.appendChild(div);
    });
}

// ৩. রিজিওনাল এবং সার্চ ফাংশনালিটি
async function fetchRegionalContent(isNew = true) {
    if (isNew) {
        currentPage = 1;
        movieContainer.innerHTML = '';
    }

    const query = searchInput.value.trim();
    let url;

    if (query) {
        url = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}&page=${currentPage}`;
    } else {
        // ইউজারের কান্ট্রি অনুযায়ী সাজানো (with_origin_country)
        url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&page=${currentPage}&with_origin_country=${userCountry}&with_genres=${currentGenre}&sort_by=popularity.desc`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();
        renderFilteredContent(data.results);
        
        // যদি ওই দেশের কন্টেন্ট কম থাকে, তবে গ্লোবাল কন্টেন্টও ব্যাকআপ হিসেবে আনা যেতে পারে
        if (data.results.length < 5 && !query) {
             const backupUrl = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&page=${currentPage}&with_genres=${currentGenre}`;
             const backupRes = await fetch(backupUrl);
             const backupData = await backupRes.json();
             renderFilteredContent(backupData.results);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

// ইভেন্ট লিসেনার আপডেট
window.onload = () => initializeApp();

loadMoreBtn.onclick = () => {
    currentPage++;
    fetchRegionalContent(false);
};

genreSelect.onchange = (e) => {
    currentGenre = e.target.value;
    fetchRegionalContent();
};

document.getElementById('searchBtn').onclick = () => fetchRegionalContent();

function changeType(type) {
    currentType = type;
    searchInput.value = '';
    document.getElementById('movieBtn').classList.toggle('active', type === 'movie');
    document.getElementById('tvBtn').classList.toggle('active', type === 'tv');
    fetchRegionalContent();
}

window.changeType = changeType;
