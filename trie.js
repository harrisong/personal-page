// ========================================
// TRIE SEARCH
// ========================================
let trieGame = {
    canvas: null,
    ctx: null,
    trie: { children: {}, isEndOfWord: false },
    searchTerm: '',
    newWord: '',
    searchResults: [],
    words: ['apple', 'application', 'app', 'applet', 'bat', 'battle', 'cat', 'catalog', 'catch'],

    init() {
        this.canvas = document.getElementById('trieCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.initializeTrie();
        this.drawTrie();
    },

    initializeTrie() {
        this.words.forEach(word => this.insert(word));
    },

    insert(word) {
        let node = this.trie;
        for (let char of word) {
            if (!node.children[char]) {
                node.children[char] = { children: {}, isEndOfWord: false };
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    },

    search() {
        if (this.searchTerm === '') {
            this.searchResults = [];
            this.updateResults();
            this.drawTrie();
            return;
        }

        this.searchResults = this.findWordsWithPrefix(this.searchTerm);
        this.updateResults();
        this.drawTrie(this.searchTerm);
    },

    findWordsWithPrefix(prefix) {
        let node = this.trie;
        for (let char of prefix) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }

        const results = [];
        this.collectWords(node, prefix, results);
        return results;
    },

    collectWords(node, currentWord, results) {
        if (node.isEndOfWord) {
            results.push(currentWord);
        }

        for (let char in node.children) {
            this.collectWords(node.children[char], currentWord + char, results);
        }
    },

    addWord() {
        const newWordInput = document.getElementById('newWordInput');
        const word = newWordInput.value.trim();

        if (word && !this.words.includes(word)) {
            this.words.push(word);
            this.insert(word);
            newWordInput.value = '';
            this.drawTrie(this.searchTerm);
        }
    },

    updateResults() {
        const resultsElement = document.getElementById('searchResults');
        if (this.searchResults.length > 0) {
            resultsElement.textContent = 'Results: ' + this.searchResults.join(', ');
        } else if (this.searchTerm) {
            resultsElement.textContent = 'No results found';
        } else {
            resultsElement.textContent = '';
        }
    },

    drawTrie(highlightPrefix = '') {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const startX = 400;
        const startY = 50;
        const levelHeight = 80;
        const nodeRadius = 20;

        this.drawNode(this.trie, startX, startY, levelHeight, nodeRadius, '', highlightPrefix, 0);
    },

    drawNode(node, x, y, levelHeight, nodeRadius, currentPrefix, highlightPrefix, depth) {
        // Draw node
        const isHighlighted = highlightPrefix.startsWith(currentPrefix) && currentPrefix.length <= highlightPrefix.length;
        this.ctx.fillStyle = isHighlighted ? '#42b883' : '#fff';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw character
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const char = currentPrefix[currentPrefix.length - 1] || 'root';
        this.ctx.fillText(char === 'root' ? '∅' : char, x, y);

        // Draw end of word marker
        if (node.isEndOfWord) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.arc(x + nodeRadius - 5, y - nodeRadius + 5, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw children
        const children = Object.keys(node.children);
        const childSpacing = 150 / Math.max(1, children.length - 1) || 150;

        children.forEach((char, index) => {
            const childX = x - (children.length - 1) * childSpacing / 2 + index * childSpacing;
            const childY = y + levelHeight;

            // Draw line to child
            this.ctx.strokeStyle = isHighlighted && highlightPrefix.startsWith(currentPrefix + char) ? '#42b883' : '#000';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + nodeRadius);
            this.ctx.lineTo(childX, childY - nodeRadius);
            this.ctx.stroke();

            this.drawNode(node.children[char], childX, childY, levelHeight, nodeRadius, currentPrefix + char, highlightPrefix, depth + 1);
        });
    }
};
