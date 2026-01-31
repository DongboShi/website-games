/**
 * Card Flip Memory Game (翻纸牌游戏)
 * A card-flipping memory game where players flip 4 cards at a time
 * Rules: Click to flip cards, find matching pairs, confirm to remove them
 */

// ===== User Authentication System =====
let currentUser = null;

// User management functions
function saveUser(username, password) {
    try {
        const users = getUsers();
        if (users[username]) {
            return false; // User already exists
        }
        users[username] = { password: password };
        localStorage.setItem('lianliankan_users', JSON.stringify(users));
        return true;
    } catch (e) {
        console.error('Failed to save user to localStorage:', e);
        return false;
    }
}

function getUsers() {
    try {
        const usersData = localStorage.getItem('lianliankan_users');
        return usersData ? JSON.parse(usersData) : {};
    } catch (e) {
        console.error('Failed to retrieve users from localStorage:', e);
        return {};
    }
}

function authenticateUser(username, password) {
    const users = getUsers();
    if (users[username] && users[username].password === password) {
        return true;
    }
    return false;
}

function setCurrentUser(username) {
    try {
        currentUser = username;
        localStorage.setItem('lianliankan_current_user', username);
    } catch (e) {
        console.error('Failed to save current user to localStorage:', e);
    }
}

function getCurrentUser() {
    try {
        return localStorage.getItem('lianliankan_current_user');
    } catch (e) {
        console.error('Failed to retrieve current user from localStorage:', e);
        return null;
    }
}

function logout() {
    try {
        currentUser = null;
        localStorage.removeItem('lianliankan_current_user');
    } catch (e) {
        console.error('Failed to remove current user from localStorage:', e);
    }
    showAuthModal();
    hideGameContainer();
}

// UI functions for authentication
function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
}

function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('hidden');
}

function showGameContainer() {
    const gameContainer = document.querySelector('.game-container');
    gameContainer.style.display = 'block';
}

function hideGameContainer() {
    const gameContainer = document.querySelector('.game-container');
    gameContainer.style.display = 'none';
}

function showAuthMessage(message, isSuccess) {
    const authMessage = document.getElementById('auth-message');
    authMessage.textContent = message;
    authMessage.classList.remove('hidden', 'success', 'error');
    authMessage.classList.add(isSuccess ? 'success' : 'error');
    setTimeout(() => {
        authMessage.classList.add('hidden');
    }, 3000);
}

function switchToRegisterForm() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

function switchToLoginForm() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

// Initialize authentication
function initAuth() {
    // Set up event listeners for auth (always needed)
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        switchToRegisterForm();
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        switchToLoginForm();
    });

    document.getElementById('register-btn').addEventListener('click', handleRegister);
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Allow Enter key to submit forms
    document.getElementById('register-username').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
    document.getElementById('register-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
    document.getElementById('register-confirm-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
    document.getElementById('login-username').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Check if user is already logged in
    const savedUser = getCurrentUser();
    if (savedUser) {
        currentUser = savedUser;
        startGame();
        return;
    }

    // Show authentication modal
    showAuthModal();
}

function handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!username || !password || !confirmPassword) {
        showAuthMessage('Please fill in all fields', false);
        return;
    }

    if (username.length < 3) {
        showAuthMessage('Username must be at least 3 characters', false);
        return;
    }

    if (password.length < 4) {
        showAuthMessage('Password must be at least 4 characters', false);
        return;
    }

    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match', false);
        return;
    }

    const saved = saveUser(username, password);
    if (saved) {
        showAuthMessage('Registration successful! Logging you in...', true);
        setTimeout(() => {
            currentUser = username;
            setCurrentUser(username);
            startGame();
        }, 1000);
    } else {
        // Check if localStorage is available
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            showAuthMessage('Username already exists', false);
        } catch (e) {
            showAuthMessage('Unable to save user data. Please enable localStorage in your browser.', false);
        }
    }
}

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showAuthMessage('Please fill in all fields', false);
        return;
    }

    if (authenticateUser(username, password)) {
        currentUser = username;
        setCurrentUser(username);
        startGame();
    } else {
        showAuthMessage('Invalid username or password', false);
    }
}

function startGame() {
    hideAuthModal();
    showGameContainer();
    document.getElementById('current-user').textContent = currentUser;
    loadCustomImages();
    initGame();
}

// ===== End User Authentication System =====

// ===== Custom Image Management =====
let customImagePairs = [];
let gameMode = 'emoji'; // 'emoji' or 'custom'
let tempGameMode = 'emoji'; // Temporary mode during modal editing
const MAX_IMAGE_SIZE = 500 * 1024; // 500KB max per image

function loadCustomImages() {
    try {
        // Load from keys
        const savedMode = localStorage.getItem('llk_gm');
        const savedPairs = localStorage.getItem('llk_ip');
        
        if (savedMode) {
            gameMode = savedMode;
            tempGameMode = savedMode;
        }
        
        if (savedPairs) {
            const parsed = JSON.parse(savedPairs);
            if (Array.isArray(parsed)) {
                customImagePairs = parsed;
            }
        }
    } catch (e) {
        console.error('Failed to load custom images:', e);
    }
}

function saveCustomImages() {
    try {
        localStorage.setItem('llk_gm', gameMode);
        localStorage.setItem('llk_ip', JSON.stringify(customImagePairs));
        return true;
    } catch (e) {
        console.error('Failed to save custom images:', e);
        if (e.name === 'QuotaExceededError') {
            alert('Failed to save: Storage quota exceeded. Try using smaller images or fewer pairs.');
        } else {
            alert('Failed to save custom images. Please try again.');
        }
        return false;
    }
}

function showCustomizeModal() {
    const modal = document.getElementById('customize-modal');
    modal.classList.remove('hidden');
    
    // Set temporary mode to current saved mode
    tempGameMode = gameMode;
    
    // Set current mode
    if (tempGameMode === 'emoji') {
        document.getElementById('mode-emoji').checked = true;
        document.getElementById('custom-image-section').classList.add('hidden');
        document.getElementById('emoji-mode-info').classList.remove('hidden');
    } else {
        document.getElementById('mode-custom').checked = true;
        document.getElementById('custom-image-section').classList.remove('hidden');
        document.getElementById('emoji-mode-info').classList.add('hidden');
    }
    
    renderImagePairs();
}

function hideCustomizeModal() {
    const modal = document.getElementById('customize-modal');
    modal.classList.add('hidden');
    
    // Reset temp mode to saved mode
    tempGameMode = gameMode;
}

function renderImagePairs() {
    const container = document.getElementById('image-pairs-container');
    container.innerHTML = '';
    
    if (customImagePairs.length === 0) {
        // Add initial pair
        addImagePair();
        return;
    }
    
    customImagePairs.forEach((pair, index) => {
        createImagePairElement(index, pair);
    });
}

function createImagePairElement(index, pair) {
    const container = document.getElementById('image-pairs-container');
    const pairDiv = document.createElement('div');
    pairDiv.className = 'image-pair-item';
    pairDiv.dataset.index = index;
    
    pairDiv.innerHTML = `
        <span class="pair-number">Pair ${index + 1}:</span>
        <div class="image-upload-group">
            <div class="image-preview ${pair ? '' : 'empty'}" data-pair="${index}">
                ${pair ? `<img src="${pair}" alt="Pair ${index + 1}">` : 'No image'}
            </div>
            <input type="file" id="upload-${index}" accept="image/*" style="display: none;">
            <button class="upload-btn" onclick="document.getElementById('upload-${index}').click()">
                ${pair ? 'Change' : 'Upload'} Image
            </button>
        </div>
        <button class="remove-pair-btn" onclick="removeImagePair(${index})">Remove</button>
    `;
    
    container.appendChild(pairDiv);
    
    // Set up file input handler
    const fileInput = document.getElementById(`upload-${index}`);
    fileInput.addEventListener('change', (e) => handleImageUpload(e, index));
}

function addImagePair() {
    customImagePairs.push(null);
    renderImagePairs();
}

function removeImagePair(index) {
    customImagePairs.splice(index, 1);
    renderImagePairs();
}

function handleImageUpload(event, index) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        event.target.value = '';
        return;
    }
    
    // Validate file size (500KB max)
    if (file.size > MAX_IMAGE_SIZE) {
        alert(`Image is too large (${Math.round(file.size / 1024)}KB). Please use an image smaller than ${MAX_IMAGE_SIZE / 1024}KB.`);
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        customImagePairs[index] = e.target.result;
        renderImagePairs();
    };
    
    reader.onerror = function() {
        alert('Failed to read image file. Please try another image.');
        event.target.value = '';
    };
    
    reader.readAsDataURL(file);
}

function handleBatchUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Warn user if replacing existing images
    if (customImagePairs.length > 0) {
        const confirmed = confirm(
            `You currently have ${customImagePairs.length} image(s) loaded. ` +
            `Batch upload will replace all existing images. Do you want to continue?`
        );
        if (!confirmed) {
            event.target.value = '';
            return;
        }
    }
    
    const statusElement = document.getElementById('batch-upload-status');
    statusElement.textContent = `Processing ${files.length} file(s)...`;
    statusElement.className = 'batch-status processing';
    
    // Clear existing pairs to replace with batch upload
    customImagePairs = [];
    
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process each file
    Array.from(files).forEach((file, index) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            processedCount++;
            errorCount++;
            errors.push(`"${file.name}" is not an image file`);
            checkCompletion();
            return;
        }
        
        // Validate file size (500KB max)
        if (file.size > MAX_IMAGE_SIZE) {
            processedCount++;
            errorCount++;
            errors.push(`"${file.name}" is too large (${Math.round(file.size / 1024)}KB > ${MAX_IMAGE_SIZE / 1024}KB)`);
            checkCompletion();
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            customImagePairs.push(e.target.result);
            processedCount++;
            successCount++;
            checkCompletion();
        };
        
        reader.onerror = function() {
            processedCount++;
            errorCount++;
            errors.push(`Failed to read "${file.name}"`);
            checkCompletion();
        };
        
        reader.readAsDataURL(file);
    });
    
    function checkCompletion() {
        if (processedCount === files.length) {
            // All files processed
            let statusMessage = `✓ Successfully loaded ${successCount} image(s)`;
            let statusClass = 'batch-status success';
            
            if (errorCount > 0) {
                statusMessage += ` (${errorCount} failed)`;
                statusClass = 'batch-status warning';
                
                // Show first few errors
                if (errors.length > 0) {
                    const errorSummary = errors.slice(0, 3).join('\n');
                    const moreErrors = errors.length > 3 ? `\n... and ${errors.length - 3} more error(s)` : '';
                    alert(`Batch Upload Errors:\n\n${errorSummary}${moreErrors}`);
                }
            }
            
            statusElement.textContent = statusMessage;
            statusElement.className = statusClass;
            
            // Re-render the pairs
            renderImagePairs();
            
            // Auto-switch to custom mode if successful
            if (successCount > 0) {
                tempGameMode = 'custom';
                document.getElementById('mode-custom').checked = true;
                document.getElementById('custom-image-section').classList.remove('hidden');
                document.getElementById('emoji-mode-info').classList.add('hidden');
            }
            
            // Clear status after a few seconds
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'batch-status';
            }, 5000);
        }
    }
    
    // Clear the file input so the same files can be selected again
    event.target.value = '';
}

function saveCustomization() {
    // Validate that all pairs have images
    const validPairs = customImagePairs.filter(pair => pair !== null);
    
    if (tempGameMode === 'custom' && validPairs.length === 0) {
        alert('Please upload at least one image for custom mode!');
        return;
    }
    
    // Show warning if too few pairs for 4-card game
    if (tempGameMode === 'custom' && validPairs.length < 2) {
        alert('Please upload at least 2 images for the card game!');
        return;
    }
    
    customImagePairs = validPairs;
    gameMode = tempGameMode;
    
    if (!saveCustomImages()) {
        // If save failed, revert gameMode
        gameMode = localStorage.getItem('llk_gm') || 'emoji';
        return;
    }
    
    hideCustomizeModal();
    
    // Restart game with new configuration
    initGame();
}

// ===== End Custom Image Management =====

// Card Flip Game Configuration
const CONFIG = {
    CARDS_COUNT: 4,  // 4 cards displayed at a time
    TILE_TYPES: ['🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🎼', '🏀', '⚽', '🏈', '⚾', '🎾'],
    MATCH_POINTS: 20,
    WRONG_PENALTY: -5
};

// Game state
let gameState = {
    cards: [],          // Current 4 cards being shown
    flippedCards: [],   // Indices of flipped cards
    selectedCards: [],  // Indices of cards selected for matching
    score: 0,
    timer: 0,
    timerInterval: null,
    pairsMatched: 0,
    totalPairs: 0
};

// DOM elements
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const pairsDisplay = document.getElementById('pairs-remaining');
const gameMessage = document.getElementById('game-message');
const newGameBtn = document.getElementById('new-game-btn');
const confirmBtn = document.getElementById('confirm-btn');
const customizeBtn = document.getElementById('customize-btn');

/**
 * Initialize the game
 */
function initGame() {
    // Stop existing timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Reset game state
    gameState.flippedCards = [];
    gameState.selectedCards = [];
    gameState.score = 0;
    gameState.timer = 0;
    gameState.pairsMatched = 0;
    
    // Generate new 4 cards (2 pairs)
    generateCards();
    
    // Update UI
    updateDisplay();
    renderCards();
    hideMessage();
    
    // Enable confirm button logic
    updateConfirmButton();
    
    // Start timer
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimerDisplay();
    }, 1000);
}

/**
 * Generate 4 cards with 2 matching pairs
 */
function generateCards() {
    // Determine which tile types to use based on game mode
    let tileTypes;
    if (gameMode === 'custom' && customImagePairs.length > 0) {
        tileTypes = customImagePairs;
    } else {
        tileTypes = CONFIG.TILE_TYPES;
    }
    
    // Pick 2 random types for matching pairs
    const shuffled = [...tileTypes].sort(() => Math.random() - 0.5);
    const type1 = shuffled[0];
    const type2 = shuffled[1];
    
    // Create 4 cards: 2 of each type
    gameState.cards = [type1, type1, type2, type2];
    
    // Shuffle the cards
    shuffleArray(gameState.cards);
    
    // Total pairs for this round is 2
    gameState.totalPairs = 2;
}

/**
 * Shuffle array in place (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Render the cards on the game board
 */
function renderCards() {
    // Set grid for 4 cards in a row
    gameBoard.style.gridTemplateColumns = `repeat(4, 120px)`;
    gameBoard.style.gridTemplateRows = `160px`;
    
    // Clear existing cards
    gameBoard.innerHTML = '';
    
    // Create card elements
    for (let i = 0; i < CONFIG.CARDS_COUNT; i++) {
        const card = document.createElement('div');
        card.className = 'tile';
        card.dataset.index = i;
        
        // Check if it's a custom image
        if (typeof gameState.cards[i] === 'string' && gameState.cards[i].startsWith('data:image')) {
            card.classList.add('custom-image');
            card.innerHTML = `<img src="${gameState.cards[i]}" alt="Card ${i + 1}">`;
        } else {
            card.textContent = gameState.cards[i];
        }
        
        // Add click event
        card.addEventListener('click', () => handleCardClick(i));
        
        gameBoard.appendChild(card);
    }
}

/**
 * Handle card click
 */
function handleCardClick(index) {
    const card = gameBoard.children[index];
    
    // Check if card is already flipped
    if (gameState.flippedCards.includes(index)) {
        // Unflip the card
        card.classList.remove('flipped');
        card.classList.remove('selected');
        gameState.flippedCards = gameState.flippedCards.filter(i => i !== index);
        gameState.selectedCards = gameState.selectedCards.filter(i => i !== index);
    } else {
        // Flip the card
        card.classList.add('flipped');
        gameState.flippedCards.push(index);
    }
    
    updateConfirmButton();
}

/**
 * Update confirm button state
 */
function updateConfirmButton() {
    // Enable confirm button only if at least 2 cards are flipped
    if (gameState.flippedCards.length >= 2) {
        confirmBtn.disabled = false;
    } else {
        confirmBtn.disabled = true;
    }
}

/**
 * Handle confirm button click
 */
function handleConfirm() {
    if (gameState.flippedCards.length < 2) {
        return;
    }
    
    // Check if all flipped cards match
    const flippedValues = gameState.flippedCards.map(i => gameState.cards[i]);
    const firstValue = flippedValues[0];
    const allMatch = flippedValues.every(v => {
        if (typeof v === 'string' && v.startsWith('data:image')) {
            return v === firstValue;
        }
        return v === firstValue;
    });
    
    if (allMatch) {
        // Cards match!
        handleMatch();
    } else {
        // Cards don't match
        handleMismatch();
    }
}

/**
 * Handle successful match
 */
function handleMatch() {
    const matchCount = gameState.flippedCards.length;
    const pairsFound = Math.floor(matchCount / 2);
    
    // Award points
    gameState.score += CONFIG.MATCH_POINTS * pairsFound;
    gameState.pairsMatched += pairsFound;
    
    // Animate and remove matched cards
    gameState.flippedCards.forEach(index => {
        const card = gameBoard.children[index];
        card.classList.add('matched');
        setTimeout(() => {
            card.classList.add('empty');
        }, 600);
    });
    
    // Clear selection
    gameState.flippedCards = [];
    gameState.selectedCards = [];
    
    // Check if all pairs are matched (game won)
    if (gameState.pairsMatched >= gameState.totalPairs) {
        setTimeout(() => {
            showMessage(`🎉 Excellent! You matched all pairs!<br>Score: ${gameState.score}<br>Time: ${formatTime(gameState.timer)}`);
            setTimeout(() => {
                initGame(); // Start new round
            }, 3000);
        }, 700);
    }
    
    updateDisplay();
    updateConfirmButton();
}

/**
 * Handle mismatch
 */
function handleMismatch() {
    // Apply penalty
    gameState.score += CONFIG.WRONG_PENALTY;
    
    // Flash cards to show mismatch
    gameState.flippedCards.forEach(index => {
        const card = gameBoard.children[index];
        card.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
        setTimeout(() => {
            card.style.background = '';
        }, 500);
    });
    
    // Unflip cards after a delay
    setTimeout(() => {
        gameState.flippedCards.forEach(index => {
            const card = gameBoard.children[index];
            card.classList.remove('flipped');
            card.classList.remove('selected');
        });
        gameState.flippedCards = [];
        gameState.selectedCards = [];
        updateConfirmButton();
    }, 1000);
    
    updateDisplay();
}

/**
 * Update all display elements
 */
function updateDisplay() {
    scoreDisplay.textContent = gameState.score;
    updateTimerDisplay();
    pairsDisplay.textContent = `${gameState.pairsMatched}/${gameState.totalPairs}`;
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(gameState.timer);
}

/**
 * Format time as MM:SS
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Show game message
 */
function showMessage(message) {
    gameMessage.innerHTML = message;
    gameMessage.classList.remove('hidden');
}

/**
 * Hide game message
 */
function hideMessage() {
    gameMessage.classList.add('hidden');
}

// Event listeners for buttons
newGameBtn.addEventListener('click', initGame);
confirmBtn.addEventListener('click', handleConfirm);
customizeBtn.addEventListener('click', showCustomizeModal);

// Customize modal event listeners
document.getElementById('mode-emoji').addEventListener('change', function() {
    if (this.checked) {
        tempGameMode = 'emoji';
        document.getElementById('custom-image-section').classList.add('hidden');
        document.getElementById('emoji-mode-info').classList.remove('hidden');
    }
});

document.getElementById('mode-custom').addEventListener('change', function() {
    if (this.checked) {
        tempGameMode = 'custom';
        document.getElementById('custom-image-section').classList.remove('hidden');
        document.getElementById('emoji-mode-info').classList.add('hidden');
    }
});

document.getElementById('add-pair-btn').addEventListener('click', addImagePair);
document.getElementById('save-customize-btn').addEventListener('click', saveCustomization);
document.getElementById('cancel-customize-btn').addEventListener('click', hideCustomizeModal);
document.getElementById('close-customize-btn').addEventListener('click', hideCustomizeModal);
document.getElementById('batch-upload-input').addEventListener('change', handleBatchUpload);
document.getElementById('batch-upload-btn').addEventListener('click', function() {
    document.getElementById('batch-upload-input').click();
});

// Initialize the authentication system when page loads
document.addEventListener('DOMContentLoaded', initAuth);
