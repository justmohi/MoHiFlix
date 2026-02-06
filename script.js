const API_KEY = '42ba263cafdf8e88b49b1367b5a06ea7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentType = 'movie'; 
let currentGenre = '';
let allowedMovieIds = []; // এখানে movies_db.json এর আইডিগুলো জমা থাকবে
let userCountry = 'IN';   // ডিফল্ট ইন্ডিয়া রাখা হয়েছে

const movieContainer = document.getElementById('movies');
const searchInput = document.getElementById('search');
const genreSelect = document.getElementById('genreSelect');
const loadMoreBtn = document.getElementById('loadMore');

// ১. আগে ডাটাবেস এবং লোকেশন লোড হবে
async function initializeApp() {
    try {
        // movies_db.json থেকে ডাটা ফেচ করা হচ্ছে
        const dbRes = await fetch('movies_db.json');
        const dbData = await dbRes.json();
        // ডাটাবেসে থাকা সব tmdb_id গুলোকে লিস্টে নেওয়া হচ্ছে
        allowedMovieIds = dbData.map(item => String(item.tmdb_id));

        // ইউজারের কান্ট্রি ডিটেক্ট করা (suggestion এর জন্য)
        try {
            const geoRes = await fetch('https://ipapi.co/json/');
            const geoData = await geoRes.json();
            userCountry = geoData.country_code || 'IN';
        } catch (e) {
            console.log("Location fetch failed, using default.");
        }
        
        fetchContent(); // সব রেডি হলে কন্টেন্ট লোড শুরু
    } catch (error) {
        console.error('Initialization Error:', error);
    }
}

// ২. কন্টেন্ট ফেচ করার মেইন ফাংশন
async function fetchContent(isNew = true) {
    if (isNew) {
        currentPage = 1;
        movieContainer.innerHTML = '';
    }

    const query = searchInput.value.trim();
    let url;

    if (query) {
        url = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}&page=${currentPage}`;
    } else {
        // লোকেশন অনুযায়ী মুভি সাজানো (Suggestion logic)
        url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&page=${currentPage}&with_origin_country=${userCountry}&with_genres=${currentGenre}&sort_by=popularity.desc`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();
        renderContent(data.results);
    } catch (error) {
        console.error('Error:', error);
    }
}

// ৩. কার্ড শো করার লজিক (এখানেই ফিল্টার হচ্ছে)
function renderContent(items) {
    items.forEach(item => {
        // *** মেইন লজিক: যদি মুভিটি movies_db.json এ না থাকে, তবে রিটার্ন করবে (শো করবে না) ***
        if (!allowedMovieIds.includes(String(item.id))) {
            return; 
        }

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

// ৪. বাকি সব কন্ট্রোল ফাংশন
function changeType(type) {
    currentType = type;
    searchInput.value = '';
    document.getElementById('movieBtn').classList.toggle('active', type === 'movie');
    document.getElementById('tvBtn').classList.toggle('active', type === 'tv');
    fetchContent();
}

loadMoreBtn.onclick = () => {
    currentPage++;
    fetchContent(false);
};

genreSelect.onchange = (e) => {
    currentGenre = e.target.value;
    fetchContent();
};

document.getElementById('searchBtn').onclick = () => fetchContent();

// অ্যাপ স্টার্ট
window.onload = () => initializeApp();
