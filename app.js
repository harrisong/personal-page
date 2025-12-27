// ========================================
// MAIN APPLICATION LOGIC
// ========================================

// Toggle games dropdown menu
function toggleGamesMenu() {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Navigation between sections
function showSection(sectionId, buttonElement = null) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(button => button.classList.remove('active'));

    // Close any open dropdown menus
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.classList.remove('show');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Add active class to clicked button
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
}

// ========================================
// PONG GAME FUNCTIONS
// ========================================
function startPong() {
    pongGame.start();
}

function resetPong() {
    pongGame.reset();
}

// ========================================
// MAZE GAME FUNCTIONS
// ========================================
function generateMaze() {
    mazeGame.generateMaze();
}

function solveMaze() {
    mazeGame.solveMaze();
}

function resetMaze() {
    mazeGame.resetMaze();
}

// ========================================
// SUDOKU GAME FUNCTIONS
// ========================================
function generateSudoku() {
    sudokuGame.generatePuzzle();
}

function solveSudoku() {
    sudokuGame.solveSudoku();
}

function resetSudoku() {
    sudokuGame.resetSudoku();
}

// ========================================
// TRIE SEARCH FUNCTIONS
// ========================================
function searchTrie() {
    const searchInput = document.getElementById('searchInput');
    trieGame.searchTerm = searchInput.value;
    trieGame.search();
}

function addWord() {
    trieGame.addWord();
}

// ========================================
// BINARY SEARCH GAME FUNCTIONS
// ========================================
function makeGuess() {
    binaryGame.makeGuess();
}

function startNewGame() {
    binaryGame.startNewGame();
}

// ========================================
// CONNECT 4 GAME FUNCTIONS
// ========================================
function resetConnect4() {
    connect4Game.resetGame();
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize games
    pongGame.init();
    mazeGame.init();
    sudokuGame.init();
    trieGame.init();
    binaryGame.init();
    connect4Game.init();
    pixelArtGame.init();

    // Set default section
    showSection('about');
});
