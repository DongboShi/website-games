/**
 * Connect the Dots (连连看) Game
 * A classic matching game where players must connect pairs of matching tiles
 * Rules: Tiles can be connected if the path has at most 2 turns and no obstacles
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
        // Migrate old keys to new keys for existing users (only if new keys don't exist)
        // llk_gm = game mode, llk_ip = image pairs
        const newModeExists = localStorage.getItem('llk_gm') !== null;
        const newPairsExists = localStorage.getItem('llk_ip') !== null;
        
        if (!newModeExists) {
            const oldMode = localStorage.getItem('lianliankan_game_mode');
            if (oldMode) {
                localStorage.setItem('llk_gm', oldMode);
                localStorage.removeItem('lianliankan_game_mode');
            }
        }
        
        if (!newPairsExists) {
            const oldPairs = localStorage.getItem('lianliankan_custom_pairs');
            if (oldPairs) {
                localStorage.setItem('llk_ip', oldPairs);
                localStorage.removeItem('lianliankan_custom_pairs');
            }
        }
        
        // Load from new keys
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
        event.target.value = ''; // Clear the input
        return;
    }
    
    // Validate file size (500KB max)
    if (file.size > MAX_IMAGE_SIZE) {
        alert(`Image is too large (${Math.round(file.size / 1024)}KB). Please use an image smaller than ${MAX_IMAGE_SIZE / 1024}KB.`);
        event.target.value = ''; // Clear the input
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        customImagePairs[index] = e.target.result;
        renderImagePairs();
    };
    
    reader.onerror = function() {
        alert('Failed to read image file. Please try another image.');
        event.target.value = ''; // Clear the input
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
            event.target.value = ''; // Clear the file input
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
        alert('Please upload at least one image pair for custom mode!');
        return;
    }
    
    // Show warning if too few pairs
    if (tempGameMode === 'custom' && validPairs.length < 8) {
        const proceed = confirm(
            `You have only ${validPairs.length} image pair(s). The game board has 40 pairs total, ` +
            `so some images will appear many times. Do you want to continue?`
        );
        if (!proceed) return;
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

// Game configuration
const CONFIG = {
    ROWS: 8,
    COLS: 10,
    TILE_TYPES: ['🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🎼', '🏀', '⚽', '🏈', '⚾', '🎾'],
    MATCH_DELAY: 500,
    HINT_DURATION: 2000,
    TILE_SIZE: 60,  // Must match .tile width/height in styles.css
    TILE_GAP: 8,    // Must match .game-board gap in styles.css
    BOARD_PADDING: 20  // Must match .game-board padding in styles.css
};

// Game state
let gameState = {
    board: [],
    selectedTile: null,
    score: 0,
    pairsRemaining: 0,
    timer: 0,
    timerInterval: null,
    isProcessing: false
};

// DOM elements
const gameBoard = document.getElementById('game-board');
const lineCanvas = document.getElementById('line-canvas');
const ctx = lineCanvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const pairsDisplay = document.getElementById('pairs-remaining');
const gameMessage = document.getElementById('game-message');
const newGameBtn = document.getElementById('new-game-btn');
const hintBtn = document.getElementById('hint-btn');

/**
 * Initialize a new game
 */
function initGame() {
    // Stop existing timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Reset game state
    gameState.selectedTile = null;
    gameState.score = 0;
    gameState.timer = 0;
    gameState.isProcessing = false;
    
    // Generate game board
    gameState.board = generateBoard();
    gameState.pairsRemaining = countPairs(gameState.board);
    
    // Update UI
    updateDisplay();
    renderBoard();
    clearCanvas();
    hideMessage();
    
    // Start timer
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimerDisplay();
    }, 1000);
}

/**
 * Generate a random board with matching pairs
 */
function generateBoard() {
    const totalTiles = CONFIG.ROWS * CONFIG.COLS;
    const tiles = [];
    
    // Calculate how many pairs we need
    const pairsNeeded = totalTiles / 2;
    
    // Determine which tile types to use based on game mode
    let tileTypes;
    if (gameMode === 'custom' && customImagePairs.length > 0) {
        tileTypes = customImagePairs;
    } else {
        tileTypes = CONFIG.TILE_TYPES;
    }
    
    // Create pairs of tiles
    for (let i = 0; i < pairsNeeded; i++) {
        const tileType = tileTypes[i % tileTypes.length];
        tiles.push(tileType, tileType);
    }
    
    // Shuffle the tiles
    shuffleArray(tiles);
    
    // Create 2D board
    const board = [];
    for (let row = 0; row < CONFIG.ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < CONFIG.COLS; col++) {
            board[row][col] = tiles[row * CONFIG.COLS + col];
        }
    }
    
    return board;
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
 * Count remaining pairs on the board
 */
function countPairs(board) {
    let count = 0;
    for (let row = 0; row < CONFIG.ROWS; row++) {
        for (let col = 0; col < CONFIG.COLS; col++) {
            if (board[row][col] !== null) {
                count++;
            }
        }
    }
    return count / 2;
}

/**
 * Render the game board
 */
function renderBoard() {
    // Set grid template
    gameBoard.style.gridTemplateColumns = `repeat(${CONFIG.COLS}, ${CONFIG.TILE_SIZE}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${CONFIG.ROWS}, ${CONFIG.TILE_SIZE}px)`;
    
    // Clear existing tiles
    gameBoard.innerHTML = '';
    
    // Create tile elements
    for (let row = 0; row < CONFIG.ROWS; row++) {
        for (let col = 0; col < CONFIG.COLS; col++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.row = row;
            tile.dataset.col = col;
            
            if (gameState.board[row][col] !== null) {
                const tileContent = gameState.board[row][col];
                
                // Check if it's a custom image (data URL) or emoji
                if (typeof tileContent === 'string' && tileContent.startsWith('data:image')) {
                    // Custom image
                    tile.classList.add('custom-image');
                    const img = document.createElement('img');
                    img.src = tileContent;
                    img.alt = `Game tile at row ${row + 1}, column ${col + 1}`;
                    tile.appendChild(img);
                } else {
                    // Emoji
                    tile.textContent = tileContent;
                }
                
                tile.addEventListener('click', () => handleTileClick(row, col));
            } else {
                tile.classList.add('empty');
            }
            
            gameBoard.appendChild(tile);
        }
    }
    
    // Resize canvas to match board
    resizeCanvas();
}

/**
 * Resize canvas to overlay the game board
 */
function resizeCanvas() {
    const rect = gameBoard.getBoundingClientRect();
    lineCanvas.width = rect.width;
    lineCanvas.height = rect.height;
    lineCanvas.style.width = rect.width + 'px';
    lineCanvas.style.height = rect.height + 'px';
    lineCanvas.style.top = rect.top + 'px';
    lineCanvas.style.left = rect.left + 'px';
}

/**
 * Handle tile click event
 */
function handleTileClick(row, col) {
    // Ignore clicks if processing or tile is empty
    if (gameState.isProcessing || gameState.board[row][col] === null) {
        return;
    }
    
    const clickedTile = { row, col, value: gameState.board[row][col] };
    
    // First tile selection
    if (!gameState.selectedTile) {
        gameState.selectedTile = clickedTile;
        highlightTile(row, col, true);
        return;
    }
    
    // Clicked same tile - deselect
    if (gameState.selectedTile.row === row && gameState.selectedTile.col === col) {
        highlightTile(row, col, false);
        gameState.selectedTile = null;
        return;
    }
    
    // Second tile selection - check for match
    if (gameState.selectedTile.value === clickedTile.value) {
        // Check if tiles can be connected
        const path = findPath(gameState.selectedTile, clickedTile);
        
        if (path) {
            // Valid match found
            gameState.isProcessing = true;
            highlightTile(row, col, true);
            drawPath(path);
            
            setTimeout(() => {
                // Remove matched tiles
                gameState.board[gameState.selectedTile.row][gameState.selectedTile.col] = null;
                gameState.board[row][col] = null;
                
                // Update game state
                gameState.score += 10;
                gameState.pairsRemaining--;
                gameState.selectedTile = null;
                
                // Update UI
                updateDisplay();
                renderBoard();
                clearCanvas();
                
                // Check win condition
                if (gameState.pairsRemaining === 0) {
                    endGame(true);
                }
                
                gameState.isProcessing = false;
            }, CONFIG.MATCH_DELAY);
        } else {
            // No valid path - deselect and select new tile
            highlightTile(gameState.selectedTile.row, gameState.selectedTile.col, false);
            gameState.selectedTile = clickedTile;
            highlightTile(row, col, true);
        }
    } else {
        // Different tiles - deselect and select new tile
        highlightTile(gameState.selectedTile.row, gameState.selectedTile.col, false);
        gameState.selectedTile = clickedTile;
        highlightTile(row, col, true);
    }
}

/**
 * Highlight or unhighlight a tile
 */
function highlightTile(row, col, highlight) {
    const index = row * CONFIG.COLS + col;
    const tile = gameBoard.children[index];
    if (highlight) {
        tile.classList.add('selected');
    } else {
        tile.classList.remove('selected');
    }
}

/**
 * Find a valid path between two tiles (max 2 turns, no obstacles)
 * Returns array of points representing the path, or null if no path exists
 */
function findPath(tile1, tile2) {
    // Try direct line (0 turns)
    let path = findDirectPath(tile1, tile2);
    if (path) return path;
    
    // Try 1 turn paths
    path = findOneCornerPath(tile1, tile2);
    if (path) return path;
    
    // Try 2 turn paths
    path = findTwoCornerPath(tile1, tile2);
    if (path) return path;
    
    return null;
}

/**
 * Check if path is clear between two points (same row or column)
 */
function isPathClear(r1, c1, r2, c2) {
    // Same position
    if (r1 === r2 && c1 === c2) return true;
    
    // Same row
    if (r1 === r2) {
        const minCol = Math.min(c1, c2);
        const maxCol = Math.max(c1, c2);
        for (let c = minCol + 1; c < maxCol; c++) {
            if (gameState.board[r1][c] !== null) return false;
        }
        return true;
    }
    
    // Same column
    if (c1 === c2) {
        const minRow = Math.min(r1, r2);
        const maxRow = Math.max(r1, r2);
        for (let r = minRow + 1; r < maxRow; r++) {
            if (gameState.board[r][c1] !== null) return false;
        }
        return true;
    }
    
    return false;
}

/**
 * Find direct path (0 turns)
 */
function findDirectPath(tile1, tile2) {
    if (isPathClear(tile1.row, tile1.col, tile2.row, tile2.col)) {
        return [
            { row: tile1.row, col: tile1.col },
            { row: tile2.row, col: tile2.col }
        ];
    }
    return null;
}

/**
 * Find path with one corner (1 turn)
 */
function findOneCornerPath(tile1, tile2) {
    // Try corner at (tile1.row, tile2.col)
    const corner1 = { row: tile1.row, col: tile2.col };
    if ((gameState.board[corner1.row][corner1.col] === null || 
         (corner1.row === tile1.row && corner1.col === tile1.col) ||
         (corner1.row === tile2.row && corner1.col === tile2.col)) &&
        isPathClear(tile1.row, tile1.col, corner1.row, corner1.col) &&
        isPathClear(corner1.row, corner1.col, tile2.row, tile2.col)) {
        return [
            { row: tile1.row, col: tile1.col },
            corner1,
            { row: tile2.row, col: tile2.col }
        ];
    }
    
    // Try corner at (tile2.row, tile1.col)
    const corner2 = { row: tile2.row, col: tile1.col };
    if ((gameState.board[corner2.row][corner2.col] === null ||
         (corner2.row === tile1.row && corner2.col === tile1.col) ||
         (corner2.row === tile2.row && corner2.col === tile2.col)) &&
        isPathClear(tile1.row, tile1.col, corner2.row, corner2.col) &&
        isPathClear(corner2.row, corner2.col, tile2.row, tile2.col)) {
        return [
            { row: tile1.row, col: tile1.col },
            corner2,
            { row: tile2.row, col: tile2.col }
        ];
    }
    
    return null;
}

/**
 * Find path with two corners (2 turns)
 * This function explores positions beyond the board boundaries (-1 to ROWS+1, -1 to COLS+1)
 * to allow paths that extend outside the visible board, which is a valid strategy in 连连看
 */
function findTwoCornerPath(tile1, tile2) {
    // Check paths through all possible intermediate positions
    // Range includes positions outside the board to allow external routing
    for (let row = -1; row <= CONFIG.ROWS; row++) {
        for (let col = -1; col <= CONFIG.COLS; col++) {
            // Skip positions on the actual board (except endpoints)
            if (row >= 0 && row < CONFIG.ROWS && col >= 0 && col < CONFIG.COLS) {
                if (gameState.board[row][col] !== null &&
                    !(row === tile1.row && col === tile1.col) &&
                    !(row === tile2.row && col === tile2.col)) {
                    continue;
                }
            }
            
            // Try path through corners
            const corner1 = { row: tile1.row, col: col };
            const corner2 = { row: row, col: col };
            const corner3 = { row: row, col: tile2.col };
            
            // Check horizontal-vertical-horizontal path
            if (canConnectThroughCorners(tile1, corner1, corner2, corner3, tile2)) {
                return [
                    { row: tile1.row, col: tile1.col },
                    corner1,
                    corner2,
                    corner3,
                    { row: tile2.row, col: tile2.col }
                ];
            }
            
            // Try vertical-horizontal-vertical path
            const altCorner1 = { row: row, col: tile1.col };
            const altCorner2 = { row: row, col: col };
            const altCorner3 = { row: tile2.row, col: col };
            
            if (canConnectThroughCorners(tile1, altCorner1, altCorner2, altCorner3, tile2)) {
                return [
                    { row: tile1.row, col: tile1.col },
                    altCorner1,
                    altCorner2,
                    altCorner3,
                    { row: tile2.row, col: tile2.col }
                ];
            }
        }
    }
    
    return null;
}

/**
 * Check if connection is valid through given corners
 */
function canConnectThroughCorners(tile1, corner1, corner2, corner3, tile2) {
    // All intermediate corners must be valid positions
    const corners = [corner1, corner2, corner3];
    for (const corner of corners) {
        // Outside board is OK for virtual corners
        if (corner.row >= 0 && corner.row < CONFIG.ROWS && 
            corner.col >= 0 && corner.col < CONFIG.COLS) {
            // On board - must be empty or endpoint
            if (gameState.board[corner.row][corner.col] !== null &&
                !(corner.row === tile1.row && corner.col === tile1.col) &&
                !(corner.row === tile2.row && corner.col === tile2.col)) {
                return false;
            }
        }
    }
    
    // Check all segments are clear
    const points = [tile1, corner1, corner2, corner3, tile2];
    for (let i = 0; i < points.length - 1; i++) {
        if (!isPathClearExtended(points[i].row, points[i].col, points[i + 1].row, points[i + 1].col)) {
            return false;
        }
    }
    
    return true;
}

/**
 * Check if path is clear, allowing positions outside board
 */
function isPathClearExtended(r1, c1, r2, c2) {
    if (r1 === r2 && c1 === c2) return true;
    
    // Same row
    if (r1 === r2) {
        // Check if row is outside board
        if (r1 < 0 || r1 >= CONFIG.ROWS) return true;
        
        const minCol = Math.min(c1, c2);
        const maxCol = Math.max(c1, c2);
        for (let c = Math.max(0, minCol + 1); c < Math.min(CONFIG.COLS, maxCol); c++) {
            if (gameState.board[r1][c] !== null) return false;
        }
        return true;
    }
    
    // Same column
    if (c1 === c2) {
        // Check if column is outside board
        if (c1 < 0 || c1 >= CONFIG.COLS) return true;
        
        const minRow = Math.min(r1, r2);
        const maxRow = Math.max(r1, r2);
        for (let r = Math.max(0, minRow + 1); r < Math.min(CONFIG.ROWS, maxRow); r++) {
            if (gameState.board[r][c1] !== null) return false;
        }
        return true;
    }
    
    return false;
}

/**
 * Draw the connection path on canvas
 */
function drawPath(path) {
    clearCanvas();
    
    if (path.length < 2) return;
    
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    
    // Get tile centers
    const startPoint = getTileCenter(path[0].row, path[0].col);
    ctx.moveTo(startPoint.x, startPoint.y);
    
    for (let i = 1; i < path.length; i++) {
        const point = getTileCenter(path[i].row, path[i].col);
        ctx.lineTo(point.x, point.y);
    }
    
    ctx.stroke();
}

/**
 * Get the center position of a tile
 */
function getTileCenter(row, col) {
    const tileSize = CONFIG.TILE_SIZE + CONFIG.TILE_GAP; // tile width + gap
    const padding = CONFIG.BOARD_PADDING;
    
    return {
        x: padding + col * tileSize + CONFIG.TILE_SIZE / 2,
        y: padding + row * tileSize + CONFIG.TILE_SIZE / 2
    };
}

/**
 * Clear the canvas
 */
function clearCanvas() {
    ctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
}

/**
 * Update score and timer display
 */
function updateDisplay() {
    scoreDisplay.textContent = gameState.score;
    pairsDisplay.textContent = gameState.pairsRemaining;
    updateTimerDisplay();
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    timerDisplay.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Show hint - highlight a valid matching pair
 */
function showHint() {
    // Find all matching pairs
    const pairs = findAllMatchingPairs();
    
    if (pairs.length === 0) {
        showMessage('No more moves available!');
        setTimeout(hideMessage, 2000);
        return;
    }
    
    // Pick a random pair
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    
    // Highlight the pair
    const index1 = randomPair.tile1.row * CONFIG.COLS + randomPair.tile1.col;
    const index2 = randomPair.tile2.row * CONFIG.COLS + randomPair.tile2.col;
    
    gameBoard.children[index1].classList.add('hint');
    gameBoard.children[index2].classList.add('hint');
    
    // Remove hint after duration
    setTimeout(() => {
        gameBoard.children[index1].classList.remove('hint');
        gameBoard.children[index2].classList.remove('hint');
    }, CONFIG.HINT_DURATION);
}

/**
 * Find all matching pairs that can be connected
 */
function findAllMatchingPairs() {
    const pairs = [];
    
    for (let r1 = 0; r1 < CONFIG.ROWS; r1++) {
        for (let c1 = 0; c1 < CONFIG.COLS; c1++) {
            if (gameState.board[r1][c1] === null) continue;
            
            for (let r2 = 0; r2 < CONFIG.ROWS; r2++) {
                for (let c2 = 0; c2 < CONFIG.COLS; c2++) {
                    if (r1 === r2 && c1 === c2) continue;
                    if (gameState.board[r2][c2] === null) continue;
                    if (gameState.board[r1][c1] !== gameState.board[r2][c2]) continue;
                    
                    const tile1 = { row: r1, col: c1, value: gameState.board[r1][c1] };
                    const tile2 = { row: r2, col: c2, value: gameState.board[r2][c2] };
                    
                    if (findPath(tile1, tile2)) {
                        // Avoid duplicates
                        const exists = pairs.some(p => 
                            (p.tile1.row === r1 && p.tile1.col === c1 && p.tile2.row === r2 && p.tile2.col === c2) ||
                            (p.tile1.row === r2 && p.tile1.col === c2 && p.tile2.row === r1 && p.tile2.col === c1)
                        );
                        
                        if (!exists) {
                            pairs.push({ tile1, tile2 });
                        }
                    }
                }
            }
        }
    }
    
    return pairs;
}

/**
 * End the game
 */
function endGame(won) {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    if (won) {
        showMessage(`🎉 You Won! 🎉<br>Score: ${gameState.score}<br>Time: ${timerDisplay.textContent}`);
    } else {
        showMessage('Game Over!');
    }
}

/**
 * Show game message
 */
function showMessage(text) {
    // Use innerHTML only for trusted game-generated content (emojis and formatting)
    gameMessage.innerHTML = text;
    gameMessage.classList.remove('hidden');
}

/**
 * Hide game message
 */
function hideMessage() {
    gameMessage.classList.add('hidden');
}

// Event listeners
newGameBtn.addEventListener('click', initGame);
hintBtn.addEventListener('click', showHint);

// Customization event listeners
const customizeBtn = document.getElementById('customize-btn');
const addPairBtn = document.getElementById('add-pair-btn');
const saveCustomizeBtn = document.getElementById('save-customize-btn');
const cancelCustomizeBtn = document.getElementById('cancel-customize-btn');
const closeCustomizeBtn = document.getElementById('close-customize-btn');
const modeEmojiRadio = document.getElementById('mode-emoji');
const modeCustomRadio = document.getElementById('mode-custom');
const batchUploadBtn = document.getElementById('batch-upload-btn');
const batchUploadInput = document.getElementById('batch-upload-input');

customizeBtn.addEventListener('click', showCustomizeModal);
addPairBtn.addEventListener('click', addImagePair);
saveCustomizeBtn.addEventListener('click', saveCustomization);
cancelCustomizeBtn.addEventListener('click', hideCustomizeModal);
closeCustomizeBtn.addEventListener('click', hideCustomizeModal);

// Batch upload functionality
batchUploadBtn.addEventListener('click', () => {
    batchUploadInput.click();
});
batchUploadInput.addEventListener('change', handleBatchUpload);

modeEmojiRadio.addEventListener('change', () => {
    tempGameMode = 'emoji';
    document.getElementById('custom-image-section').classList.add('hidden');
    document.getElementById('emoji-mode-info').classList.remove('hidden');
});

modeCustomRadio.addEventListener('change', () => {
    tempGameMode = 'custom';
    document.getElementById('custom-image-section').classList.remove('hidden');
    document.getElementById('emoji-mode-info').classList.add('hidden');
});

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Initialize authentication on load
initAuth();
