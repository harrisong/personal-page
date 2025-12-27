// ========================================
// PIXEL ART GAME
// ========================================

class PixelArtGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.originalImage = null;
        this.pixelSize = 10;
    }

    init() {
        this.canvas = document.getElementById('pixelArtCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        // Set up file input
        const fileInput = document.getElementById('imageUpload');
        fileInput.addEventListener('change', (e) => this.loadImage(e));

        // Set up pixel size slider
        const pixelSlider = document.getElementById('pixelSizeSlider');
        const pixelValue = document.getElementById('pixelSizeValue');
        pixelSlider.addEventListener('input', (e) => {
            this.pixelSize = parseInt(e.target.value);
            pixelValue.textContent = this.pixelSize;
            if (this.originalImage) {
                this.pixelateImage();
            }
        });

        // Set up pixelate button
        const pixelateBtn = document.getElementById('pixelateBtn');
        pixelateBtn.addEventListener('click', () => {
            if (this.originalImage) {
                this.pixelateImage();
            }
        });
    }

    loadImage(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                // Draw original image
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    pixelateImage() {
        if (!this.originalImage) return;

        const img = this.originalImage;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Draw image to temp canvas at original size
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        // Clear main canvas
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Pixelate
        for (let y = 0; y < img.height; y += this.pixelSize) {
            for (let x = 0; x < img.width; x += this.pixelSize) {
                // Sample color from center of block
                const sampleX = Math.min(x + Math.floor(this.pixelSize / 2), img.width - 1);
                const sampleY = Math.min(y + Math.floor(this.pixelSize / 2), img.height - 1);
                const index = (sampleY * img.width + sampleX) * 4;

                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                // Draw pixel block
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                this.ctx.fillRect(x, y, this.pixelSize, this.pixelSize);
            }
        }
    }
}

const pixelArtGame = new PixelArtGame();