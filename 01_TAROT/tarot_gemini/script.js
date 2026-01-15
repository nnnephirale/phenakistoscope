const suits = ["Wands", "Cups", "Swords", "Pentacles"];
const ranks = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"];
const majorArcana = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

// App State
let deck = [];
let highestZ = 100;
let animationId = null;
let shuffleTime = 0;

// DOM Elements
const deckRow = document.getElementById('deck-row');
const deckContainer = document.getElementById('deck-container');
const tableSurface = document.getElementById('table-surface');
const modal = document.getElementById('card-modal');
const shuffleBtn = document.getElementById('shuffle-btn');
const stopBtn = document.getElementById('stop-btn');

// --- 1. INITIALIZATION ---
function createDeck() {
    deck = [];
    deckRow.innerHTML = '';
    tableSurface.innerHTML = ''; 
    
    // Generate Data
    majorArcana.forEach((name, i) => deck.push({ id: `maj-${i}`, name, type: "Major" }));
    suits.forEach(suit => {
        ranks.forEach((rank, i) => deck.push({ id: `${suit}-${rank}`, name: `${rank} of ${suit}`, type: "Minor" }));
    });
    
    // Initial Render
    deck.forEach((cardData, index) => createCardDOM(cardData));
    realignDeck();
}

function createCardDOM(cardData) {
    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    cardEl.id = cardData.id;
    cardEl.dataset.name = cardData.name; 
    
    cardEl.innerHTML = `
        <div class="card-inner">
            <div class="card-face card-back"></div>
            <div class="card-face card-front">${cardData.name}</div>
        </div>
    `;

    deckRow.appendChild(cardEl);
    makeInteractive(cardEl, cardData);
}

// --- 2. THE MAGIC SHUFFLE CHOREOGRAPHY ---

function startInfinityShuffle() {
    // 1. UI Toggle
    shuffleBtn.classList.add('hidden');
    
    // 2. PHASE 1: THE GATHER (Rise to Center)
    const allCards = document.querySelectorAll('.card');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    allCards.forEach(card => {
        // Move to table surface if needed
        if (card.parentElement !== tableSurface) {
            const rect = card.getBoundingClientRect();
            tableSurface.appendChild(card);
            // Set initial pixel position so it doesn't jump
            card.style.left = rect.left + 'px';
            card.style.top = rect.top + 'px';
        }
        
        // Reset Flip
        card.classList.remove('flipped');
        
        // Add Gathering Class (Enables slow transition)
        // Force Reflow
        card.offsetHeight; 
        card.classList.add('gathering');
        
        // Set coordinates to Center Screen (minus half card width/height)
        card.style.left = (centerX - 45) + 'px';
        card.style.top = (centerY - 70) + 'px';
        // Add a slight random rotation/scale for the "Messy Deck" look
        const randomRot = (Math.random() - 0.5) * 10;
        card.style.transform = `scale(0.8) rotate(${randomRot}deg)`;
    });

    // 3. Wait for Gather to finish (800ms), then start Loop
    setTimeout(() => {
        stopBtn.classList.remove('hidden');
        
        // Prepare for Loop
        allCards.forEach(card => {
            card.classList.remove('gathering');
            card.classList.add('shuffling'); // Removes transition (JS takes over)
        });
        
        shuffleTime = 0;
        animateLoop();
    }, 800);
}

function animateLoop() {
    shuffleTime += 0.025; // Speed
    
    // Dimensions
    const radiusX = 300; 
    const radiusY = 100;
    const depthZ = 150; // How "deep" the 3D loop goes
    
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, i) => {
        // Snake effect offset
        const t = shuffleTime + (i * 0.08); 
        
        // Lissajous Figure-8 Logic
        // We use offsets because the cards are already visually anchored at center (via left/top)
        const x = radiusX * Math.cos(t);
        const y = radiusY * Math.sin(2 * t);
        
        // Z-Depth (Simulates moving front/back)
        // We use sin(t) so it matches the rotation phase
        const z = depthZ * Math.sin(t);
        
        // TRUE 3D TRANSFORM
        // We do NOT change left/top. We only transform from the center point.
        // translate3d handles x, y, and z (depth). 
        // We assume cards are at center, so x/y moves them out.
        card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(0.8)`;
        
        // Fix for Z-Index flickering:
        // While translate3d helps, explicitly setting Z-index based on depth ensures
        // the browser knows exactly who is on top.
        card.style.zIndex = Math.floor(z + 200); // +200 ensures positive integer
    });

    animationId = requestAnimationFrame(animateLoop);
}

function stopShuffle() {
    // 1. Stop Loop
    cancelAnimationFrame(animationId);
    stopBtn.classList.add('hidden');
    shuffleBtn.classList.remove('hidden');

    // 2. Randomize Data (The actual shuffle)
    shuffleData(deck);

    // 3. PHASE 3: THE LANDING
    const cards = Array.from(document.querySelectorAll('.card'));
    const deckRect = deckRow.getBoundingClientRect();
    const rowWidth = deckRow.clientWidth; 
    const overlapStep = (rowWidth - 90) / (cards.length - 1 || 1);

    cards.forEach(card => {
        // Re-enable transitions
        card.classList.remove('shuffling'); 
        
        // Find new slot
        const newIndex = deck.findIndex(d => d.id === card.id);
        const targetX = deckRect.left + (newIndex * overlapStep);
        const targetY = deckRect.top; 

        // Apply Final Position
        // Note: Currently cards are at Center + Transform.
        // We set 'transform: none' and 'left/top' to target to make them fly home.
        card.style.transform = 'none'; 
        card.style.left = `${targetX}px`;
        card.style.top = `${targetY}px`;
        card.style.zIndex = newIndex + 1;
    });

    // 4. Cleanup to DOM
    setTimeout(() => {
        deck.forEach(data => {
            const cardEl = document.getElementById(data.id);
            if (cardEl) {
                deckRow.appendChild(cardEl);
                cardEl.style.top = '0px';
                // Reset standard z-index stacking
                cardEl.style.zIndex = deck.indexOf(data) + 1;
            }
        });
        realignDeck();
    }, 550); // Slightly longer than CSS transition
}

// --- 3. UTILITIES ---

function shuffleData(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function realignDeck() {
    const cardsInDeck = Array.from(deckRow.children);
    if (cardsInDeck.length === 0) return;
    const rowWidth = deckRow.clientWidth;
    const overlapStep = (rowWidth - 90) / (cardsInDeck.length - 1 || 1);
    cardsInDeck.forEach((card, index) => {
        card.style.top = '0px'; 
        card.style.left = `${index * overlapStep}px`;
        card.style.zIndex = index + 1; 
    });
}

// --- 4. INTERACTION ---
function makeInteractive(element, cardData) {
    let mouseOffsetX = 0, mouseOffsetY = 0;
    let isDragging = false;
    let hasMoved = false;

    element.addEventListener('mousedown', dragStart);

    function dragStart(e) {
        if (e.button !== 0) return; 
        e.preventDefault();
        const rect = element.getBoundingClientRect();
        mouseOffsetX = e.clientX - rect.left;
        mouseOffsetY = e.clientY - rect.top;

        if (element.parentElement === deckRow) {
            tableSurface.appendChild(element);
            element.style.left = rect.left + 'px';
            element.style.top = rect.top + 'px';
        }
        highestZ++;
        element.style.zIndex = highestZ;
        element.classList.add('dragging'); 
        document.body.classList.add('is-dragging'); 
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('mousemove', dragMove);
    }

    function dragMove(e) {
        e.preventDefault();
        if (!hasMoved) { hasMoved = true; isDragging = true; }
        element.style.left = `${e.clientX - mouseOffsetX}px`;
        element.style.top = `${e.clientY - mouseOffsetY}px`;
    }

    function dragEnd(e) {
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('mousemove', dragMove);
        document.body.classList.remove('is-dragging');
        element.classList.remove('dragging');

        if (!hasMoved) {
            handleCardClick(element, cardData);
            return; 
        }
        if (e.clientY > (window.innerHeight - 200)) {
            returnToDeck(element);
        }
        hasMoved = false; isDragging = false;
    }
}

function returnToDeck(cardElement) {
    const rect = cardElement.getBoundingClientRect();
    const deckRect = deckRow.getBoundingClientRect();
    const relativeX = rect.left - deckRect.left;

    deckRow.appendChild(cardElement);
    cardElement.style.left = `${relativeX}px`;
    cardElement.style.top = '0px'; 
    
    const currentDeckCards = Array.from(deckRow.children);
    currentDeckCards.sort((a, b) => parseFloat(a.style.left) - parseFloat(b.style.left));
    currentDeckCards.forEach(card => deckRow.appendChild(card));

    cardElement.offsetWidth; 
    realignDeck();
}

function handleCardClick(cardEl, cardData) {
    if (!cardEl.classList.contains('flipped')) {
        cardEl.classList.add('flipped');
    } else {
        openModal(cardData);
    }
}

function openModal(cardData) {
    document.getElementById('modal-title').innerText = cardData.name;
    document.getElementById('modal-card-display').innerText = cardData.name;
    modal.classList.remove('hidden');
}

document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));
document.querySelector('.modal-overlay').addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('resize', realignDeck);

shuffleBtn.addEventListener('click', startInfinityShuffle);
stopBtn.addEventListener('click', stopShuffle);

createDeck();