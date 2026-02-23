const API_BASE = 'https://quoteforunme.onrender.com/';
// 30 Awesome Quotes
const quotes = [
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It is during our darkest moments that we must focus to see the light.",
    "Innovation distinguishes between a leader and a follower.",
    "Your time is limited, don't waste it living someone else's life.",
    "The only way to do great work is to love what you do.",
    "Stay hungry, stay foolish.",
    "Life is what happens to you while you're busy making other plans.",
    "The journey of a thousand miles begins with one step.",
    "Do not wait to strike till the iron is hot; but make it hot by striking.",
    "Quality is not an act, it is a habit.",
    "The best way to predict the future is to create it.",
    "The mind is everything. What you think you become.",
    "Happiness is not something ready made. It comes from your own actions.",
    "Whether you think you can or think you can't, you're right.",
    "Eighty percent of success is showing up.",
    "Your most unhappy customers are your greatest source of learning.",
    "Do what you can, with what you have, where you are.",
    "We become what we think about.",
    "The successful warrior is the average man, with laser-like focus.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "You miss 100% of the shots you don't take.",
    "The only impossible journey is the one you never begin.",
    "Great things are done by a series of small things brought together.",
    "If you are working on something exciting that you really care about, you don't have to be pushed.",
    "The way to get started is to quit talking and begin doing.",
    "If you really look closely, most everyone is just winging it.",
    "The secret of getting ahead is getting started.",
    "Don't watch the clock; do what it does. Keep going."
];

// Game State
let completedQuotes = [];
let currentFocusedCard = null;
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createCards();
    updateStats();
    setupEventListeners();
});

const backColors = [
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', 
    'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
];

function createCards() {
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    
    quotes.forEach((quote, index) => {
        const card = document.createElement('div');
        card.className = `card ${completedQuotes.includes(index) ? 'completed' : ''}`;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">Card ${index + 1}</div>
                <div class="card-back">${quote}</div>
            </div>
        `;
        
        card.addEventListener('click', () => openCard(index));
        container.appendChild(card);
    });
}

async function openCard(index) {
    currentFocusedCard = index;
    
    // Show overlay (LIGHT BLUR)
    document.getElementById('overlay').classList.remove('hidden');
    document.body.classList.add('grid-blurred');
    
    // Setup focused card
    const focusedCard = document.getElementById('focused-card');
    const cardInner = focusedCard.querySelector('.card-inner');
    const cardFront = focusedCard.querySelector('.card-front');
    const cardBack = focusedCard.querySelector('.card-back');
    
    cardFront.textContent = `Card ${index + 1}`;
    cardBack.textContent = quotes[index];
    
    // RANDOM BACK COLOR!
    const randomColor = backColors[Math.floor(Math.random() * backColors.length)];
    cardBack.style.background = randomColor;
    
    // Reset flip
    focusedCard.classList.remove('flipped');
    cardInner.offsetHeight; // Force reflow
    
    // Flip animation
    setTimeout(() => {
        focusedCard.classList.add('flipped');
    }, 50);
    
    // NEW: API save + localStorage fallback
    if (!completedQuotes.includes(index)) {
        try {
            await fetch(`${API_BASE}/api/complete/${index}`, { method: 'POST' });
        } catch(e) {
            console.error('Backend save failed:', e);
        }
        // Always update local state
        if (!completedQuotes.includes(index)) {
            completedQuotes.push(index);
            localStorage.setItem('completedQuotes', JSON.stringify(completedQuotes));
        }
        createCards(); // Refresh grid
        updateStats(); // Refresh stats
    }
}

function closeCard() {
    document.getElementById('overlay').classList.add('hidden');
    document.body.classList.remove('grid-blurred');
    document.getElementById('focused-card').classList.remove('flipped');
    currentFocusedCard = null;
}

function setupEventListeners() {
    document.getElementById('close-btn').addEventListener('click', closeCard);
    document.getElementById('overlay').addEventListener('click', (e) => {
        if (e.target.id === 'overlay') closeCard();
    });
    document.getElementById('reset-btn').addEventListener('click', async () => {
        if (confirm('Reset all progress?')) {
            await fetch('${API_BASE}/api/reset', { method: 'POST' });
            createCards();
            updateStats();
        }
    });
}

async function updateStats() {
    // NEW: API stats + localStorage fallback
    try {
        const res = await fetch('${API_BASE}/api/stats');
        const stats = await res.json();
        document.getElementById('completed-count').textContent = stats.completed;
        document.getElementById('remaining-count').textContent = stats.remaining;
    } catch(e) {
        console.log('Using localStorage stats');
        document.getElementById('completed-count').textContent = completedQuotes.length;
        document.getElementById('remaining-count').textContent = 30 - completedQuotes.length;
    }
    
    const list = document.getElementById('completed-list');
    if (list) {
        list.innerHTML = '';
        completedQuotes.forEach(index => {
            const li = document.createElement('li');
            li.textContent = `${quotes[index].substring(0, 35)}...`;
            li.addEventListener('click', () => openCard(index));
            list.appendChild(li);
        });
    }
}
