/**
 * Connect the Dots (连连看) Game
 * A classic matching game where players must connect pairs of matching tiles
 * Rules: Tiles can be connected if the path has at most 2 turns and no obstacles
 */

// Game configuration
const CONFIG = {
    ROWS: 8,
    COLS: 10,
    TILE_TYPES: ['🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🎼', '🏀', '⚽', '🏈', '⚾', '🎾'],
    MATCH_DELAY: 500,
    HINT_DURATION: 2000
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
    
    // Create pairs of tiles
    for (let i = 0; i < pairsNeeded; i++) {
        const tileType = CONFIG.TILE_TYPES[i % CONFIG.TILE_TYPES.length];
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
    gameBoard.style.gridTemplateColumns = `repeat(${CONFIG.COLS}, 60px)`;
    gameBoard.style.gridTemplateRows = `repeat(${CONFIG.ROWS}, 60px)`;
    
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
                tile.textContent = gameState.board[row][col];
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
 */
function findTwoCornerPath(tile1, tile2) {
    // Check paths through all possible intermediate positions
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
    const tileSize = 60 + 8; // tile width + gap
    const padding = 20; // board padding
    
    return {
        x: padding + col * tileSize + 30,
        y: padding + row * tileSize + 30
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

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Initialize game on load
initGame();
