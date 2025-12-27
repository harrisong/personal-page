// Dotted Background Particles
class DottedBackground {
    constructor() {
        this.canvas = document.getElementById('abstract-bg');
        this.ctx = this.canvas.getContext('2d');
        this.dots = [];
        this.traversingLines = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.traversingLineCounter = 0;
        this.resize();
        this.generateDots();
        this.addMouseListeners();
        this.animate(); // Start animation loop
        window.addEventListener('resize', () => {
            this.resize();
            this.generateDots();
            this.traversingLines = []; // Clear traversing lines on resize
        });
    }

    addMouseListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateDotsParallax();
        });

        // For touch devices
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
                this.updateDotsParallax();
            }
        });
    }

    updateDotsParallax() {
        this.dots.forEach((dot, index) => {
            // Create more layers for enhanced depth - 8 layers instead of 5
            const layer = (index % 8) + 1; // 8 layers for more depth
            const parallaxFactor = layer * 0.2; // Smaller increments for smoother depth

            // Calculate offset from center of screen for smooth parallax
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const mouseOffsetX = (this.mouseX - centerX) / centerX; // -1 to 1
            const mouseOffsetY = (this.mouseY - centerY) / centerY; // -1 to 1

            // Apply enhanced parallax movement with more pronounced depth
            const moveX = mouseOffsetX * parallaxFactor * 25; // Increased scale for more movement
            const moveY = mouseOffsetY * parallaxFactor * 25;

            // Set target positions for smooth animation
            dot.targetX = dot.originalX + moveX;
            dot.targetY = dot.originalY + moveY;
        });
    }

    animate() {
        // Update physics for smooth movement
        this.dots.forEach(dot => {
            // Calculate distance to target
            const dx = dot.targetX - dot.x;
            const dy = dot.targetY - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Apply acceleration/deceleration based on distance
            const acceleration = 0.02; // Acceleration factor
            const damping = 0.85; // Damping for deceleration

            // Update velocity with acceleration toward target
            dot.vx = (dot.vx || 0) * damping + dx * acceleration;
            dot.vy = (dot.vy || 0) * damping + dy * acceleration;

            // Update position
            dot.x += dot.vx;
            dot.y += dot.vy;

            // Keep dots within bounds
            dot.x = Math.max(-15, Math.min(this.canvas.width + 15, dot.x));
            dot.y = Math.max(-15, Math.min(this.canvas.height + 15, dot.y));
        });

        // Update traversing lines
        this.updateTraversingLines();

        // Periodically create new traversing lines
        this.traversingLineCounter++;
        if (this.traversingLineCounter >= 180) { // Every 3 seconds at 60fps
            this.createTraversingLine();
            this.traversingLineCounter = 0;
        }

        // Redraw canvas
        this.redrawCanvas();

        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }

    updateTraversingLines() {
        // Update traversing lines - draw and erase in same direction
        this.traversingLines.forEach(line => {
            if (!line.hasCompletedCycle) {
                if (line.isDrawing) {
                    // Drawing out from dot1 to dot2
                    line.progress += line.drawSpeed;
                    if (line.progress >= 1) {
                        line.progress = 1;
                        line.isDrawing = false;
                        // Start erasing
                        line.isErasing = true;
                        line.progress = 0; // Reset progress for erasing
                    }
                } else if (line.isErasing) {
                    // Erasing gradually from dot1 to dot2 (faster)
                    line.progress += line.drawSpeed * 1.5; // 50% faster erasing
                    if (line.progress >= 1) {
                        // Instead of completing cycle, continue to new random dot
                        this.continueLineToNewDot(line);
                    }
                }
            }
        });

        // Remove completed traversing lines
        this.traversingLines = this.traversingLines.filter(line => !line.hasCompletedCycle);
    }

    continueLineToNewDot(line) {
        // Continue the line from its current end point (dot2) to a new random dot
        if (this.dots.length < 2) return;

        // Start from where the line ended (dot2 becomes new dot1)
        const currentDot = line.dot2;
        let nextDot;

        // Find a different dot within reasonable distance
        const maxAttempts = 10;
        for (let i = 0; i < maxAttempts; i++) {
            nextDot = this.dots[Math.floor(Math.random() * this.dots.length)];
            if (nextDot === currentDot) continue;

            const dx = currentDot.x - nextDot.x;
            const dy = currentDot.y - nextDot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 30 && distance < 200) { // Reasonable distance range
                break;
            }
        }

        if (nextDot && nextDot !== currentDot) {
            // Update the line to continue to the new dot
            line.dot1 = currentDot; // Start from current position
            line.dot2 = nextDot;    // Go to new random dot
            line.progress = 0;     // Reset progress
            line.isDrawing = true; // Start drawing again
            line.isErasing = false;
            line.hasCompletedCycle = false;
            // Keep the same speed and opacity for continuity
        }
    }

    createTraversingLine() {
        // Create a new traversing line between random dots
        if (this.dots.length < 2) return;

        const dot1 = this.dots[Math.floor(Math.random() * this.dots.length)];
        let dot2;

        // Find a different dot within reasonable distance
        const maxAttempts = 10;
        for (let i = 0; i < maxAttempts; i++) {
            dot2 = this.dots[Math.floor(Math.random() * this.dots.length)];
            if (dot2 === dot1) continue;

            const dx = dot1.x - dot2.x;
            const dy = dot1.y - dot2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 30 && distance < 200) { // Reasonable distance range
                break;
            }
        }

        if (dot2 && dot2 !== dot1) {
                const line = {
                    dot1: dot1,
                    dot2: dot2,
                    progress: 0,
                    drawSpeed: 0.012 + Math.random() * 0.008, // Faster drawing speed
                    opacity: 0.25 + Math.random() * 0.2, // Lower opacity for ambient effect
                    isDrawing: true,
                    isErasing: false,
                    hasCompletedCycle: false,
                    pauseCounter: 0
                };
            this.traversingLines.push(line);
        }
    }

    drawTraversingLine(line) {
        if (line.progress <= 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = line.opacity;
        this.ctx.strokeStyle = '#A0522D'; // Different vintage color for traversing lines
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'round';

        if (line.isDrawing) {
            // Drawing: line grows from dot1 to dot2
            const currentX = line.dot1.x + (line.dot2.x - line.dot1.x) * line.progress;
            const currentY = line.dot1.y + (line.dot2.y - line.dot1.y) * line.progress;

            this.ctx.beginPath();
            this.ctx.moveTo(line.dot1.x, line.dot1.y);
            this.ctx.lineTo(currentX, currentY);
            this.ctx.stroke();
        } else if (line.isErasing) {
            // Erasing: line shrinks from dot2 to dot1 (erased from dot1 to dot2)
            const currentX = line.dot1.x + (line.dot2.x - line.dot1.x) * line.progress;
            const currentY = line.dot1.y + (line.dot2.y - line.dot1.y) * line.progress;

            this.ctx.beginPath();
            this.ctx.moveTo(currentX, currentY);
            this.ctx.lineTo(line.dot2.x, line.dot2.y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Find closest dots to cursor and draw connecting lines
        this.drawCursorLines();

        // Draw traversing lines
        this.traversingLines.forEach(line => {
            this.drawTraversingLine(line);
        });

        // Draw dots on top
        this.dots.forEach(dot => {
            this.drawDot(dot);
        });
    }

    drawCursorIndicator() {
        if (this.mouseX === 0 && this.mouseY === 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = '#CD853F'; // Subtle vintage color
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 4]); // Dashed line for subtlety

        // Draw a small ring around cursor position
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, 8, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw crosshairs
        this.ctx.beginPath();
        this.ctx.moveTo(this.mouseX - 12, this.mouseY);
        this.ctx.lineTo(this.mouseX + 12, this.mouseY);
        this.ctx.moveTo(this.mouseX, this.mouseY - 12);
        this.ctx.lineTo(this.mouseX, this.mouseY + 12);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawCursorLines() {
        if (this.mouseX === 0 && this.mouseY === 0) return; // Don't draw if mouse hasn't moved

        // Find dots within range of cursor
        const maxDistance = 140; // Expanded range for wider connections
        const nearbyDots = this.dots.filter(dot => {
            const dx = dot.x - this.mouseX;
            const dy = dot.y - this.mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < maxDistance;
        });

        // Limit to closest dots for balanced connections
        const maxDots = 12; // Increased from 8 to 12
        nearbyDots.sort((a, b) => {
            const distA = Math.sqrt((a.x - this.mouseX) ** 2 + (a.y - this.mouseY) ** 2);
            const distB = Math.sqrt((b.x - this.mouseX) ** 2 + (b.y - this.mouseY) ** 2);
            return distA - distB;
        });
        const closestDots = nearbyDots.slice(0, maxDots);

        // Draw lines between nearby dots
        this.ctx.save();
        this.ctx.strokeStyle = '#8B7355'; // Vintage color
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'round';

        for (let i = 0; i < closestDots.length; i++) {
            for (let j = i + 1; j < closestDots.length; j++) {
                const dot1 = closestDots[i];
                const dot2 = closestDots[j];

                // Calculate distance between dots
                const dx = dot1.x - dot2.x;
                const dy = dot1.y - dot2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Only draw if they're reasonably close to each other
                if (distance < 70) { // Increased from 60 to 70
                    // Calculate opacity based on distance from cursor
                    const avgX = (dot1.x + dot2.x) / 2;
                    const avgY = (dot1.y + dot2.y) / 2;
                    const cursorDx = avgX - this.mouseX;
                    const cursorDy = avgY - this.mouseY;
                    const cursorDistance = Math.sqrt(cursorDx * cursorDx + cursorDy * cursorDy);

                    // Closer to cursor = more opaque (extremely subtle)
                    const lineOpacity = Math.max(0.01, 0.03 - (cursorDistance / maxDistance) * 0.02);
                    this.ctx.globalAlpha = lineOpacity;

                    this.ctx.beginPath();
                    this.ctx.moveTo(dot1.x, dot1.y);
                    this.ctx.lineTo(dot2.x, dot2.y);
                    this.ctx.stroke();
                }
            }
        }

        this.ctx.restore();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateDots() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dots = [];

        // Vintage color palette
        this.vintageColors = [
            '#8B7355', // Dark Khaki
            '#A0522D', // Sienna
            '#CD853F', // Peru
            '#DEB887', // Burlywood
            '#D2B48C', // Tan
            '#BC8F8F', // Rosy Brown
            '#F4A460', // Sandy Brown
            '#D2691E', // Chocolate
            '#B8860B', // Dark Goldenrod
            '#696969', // Dim Gray
            '#708090', // Slate Gray
            '#2F4F4F'  // Dark Slate Gray
        ];

        // Calculate number of dots to fill the screen densely
        const area = this.canvas.width * this.canvas.height;
        const dotsPerPixel = 0.001; // Adjust density as needed
        const numDots = Math.floor(area * dotsPerPixel);

        for (let i = 0; i < numDots; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const depth = Math.random(); // Depth from 0 (foreground) to 1 (background)

            const dot = {
                x: x,
                y: y,
                originalX: x, // Store original position for parallax
                originalY: y, // Store original position for parallax
                targetX: x, // Initial target matches starting position
                targetY: y, // Initial target matches starting position
                vx: 0, // Initial velocity
                vy: 0, // Initial velocity
                size: (Math.random() * 2 + 1) * (1 - depth * 0.5), // Smaller dots for distant particles
                opacity: (Math.random() * 0.5 + 0.1) * (1 - depth * 0.7), // Lower opacity for distant particles
                color: this.vintageColors[Math.floor(Math.random() * this.vintageColors.length)],
                depth: depth, // Store depth for depth of field effect
                blur: depth * 2 // Add blur for distant particles
            };
            this.dots.push(dot);
            this.drawDot(dot);
        }
    }

    generateLines() {
        this.lines = [];

        // Create random connections between nearby dots
        const maxDistance = 150; // Maximum distance for line connections
        const maxLines = Math.floor(this.dots.length * 0.5); // Limit number of lines (increased)

        for (let i = 0; i < maxLines; i++) {
            const dot1 = this.dots[Math.floor(Math.random() * this.dots.length)];
            const dot2 = this.dots[Math.floor(Math.random() * this.dots.length)];

            // Calculate distance between dots
            const dx = dot1.x - dot2.x;
            const dy = dot1.y - dot2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance && distance > 20) { // Avoid too close or too far connections
                const line = {
                    dot1: dot1,
                    dot2: dot2,
                    progress: 0, // Drawing progress from 0 to 1
                    drawSpeed: 0.008 + Math.random() * 0.004, // Speed of drawing/erasing
                    opacity: 0.4 + Math.random() * 0.3, // Fixed opacity, not fading
                    isDrawing: true, // true = drawing out, false = erasing back
                    hasCompletedCycle: false
                };
                this.lines.push(line);
            }
        }
    }

    updateLines() {
        // Remove some old lines that are faded out
        this.lines = this.lines.filter(line => line.opacity > 0.1);

        // Get dots that are currently part of active lines (not completed their cycle)
        const activeDots = new Set();
        this.lines.forEach(line => {
            if (!line.hasCompletedCycle) {
                activeDots.add(line.dot1);
                activeDots.add(line.dot2);
            }
        });

        // Add some new lines to extend the existing network
        const maxDistance = 150;
        const newLinesToAdd = Math.floor(this.dots.length * 0.08); // Add fewer new lines

        for (let i = 0; i < newLinesToAdd; i++) {
            let dot1, dot2;

            // Try to connect to existing active dots first
            if (activeDots.size > 1 && Math.random() < 0.7) { // 70% chance to extend existing network
                const activeDotsArray = Array.from(activeDots);
                dot1 = activeDotsArray[Math.floor(Math.random() * activeDotsArray.length)];

                // Find nearby dots not already connected to this dot
                const nearbyDots = this.dots.filter(dot => {
                    if (dot === dot1) return false;

                    // Check if this connection already exists
                    const alreadyConnected = this.lines.some(line =>
                        (line.dot1 === dot1 && line.dot2 === dot) ||
                        (line.dot1 === dot && line.dot2 === dot1)
                    );
                    if (alreadyConnected) return false;

                    // Check distance
                    const dx = dot1.x - dot.x;
                    const dy = dot1.y - dot.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < maxDistance && distance > 20;
                });

                if (nearbyDots.length > 0) {
                    dot2 = nearbyDots[Math.floor(Math.random() * nearbyDots.length)];
                } else {
                    // Fallback to random connection
                    dot1 = this.dots[Math.floor(Math.random() * this.dots.length)];
                    dot2 = this.dots[Math.floor(Math.random() * this.dots.length)];
                }
            } else {
                // Random connection
                dot1 = this.dots[Math.floor(Math.random() * this.dots.length)];
                dot2 = this.dots[Math.floor(Math.random() * this.dots.length)];
            }

            // Final distance check
            const dx = dot1.x - dot2.x;
            const dy = dot1.y - dot2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance && distance > 20) {
                const line = {
                    dot1: dot1,
                    dot2: dot2,
                    opacity: 0, // Start invisible
                    fadeDirection: 1, // Always start fading in
                    fadeSpeed: 0.005 + Math.random() * 0.005, // Much slower fade speed
                    maxOpacity: 0.4 + Math.random() * 0.3, // Lower max opacity for subtlety
                    hasCompletedCycle: false
                };
                this.lines.push(line);
            }
        }
    }

    drawDot(dot) {
        this.ctx.save();
        this.ctx.globalAlpha = dot.opacity;
        this.ctx.fillStyle = dot.color;

        // Apply depth of field blur effect
        if (dot.blur > 0) {
            this.ctx.shadowColor = dot.color;
            this.ctx.shadowBlur = dot.blur;
        }

        this.ctx.beginPath();
        this.ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawLine(line) {
        if (line.progress <= 0 || line.opacity <= 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = line.opacity;
        this.ctx.strokeStyle = '#8B7355'; // Vintage color matching the theme
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'round';

        // Interpolate position based on progress
        const currentX = line.dot1.x + (line.dot2.x - line.dot1.x) * line.progress;
        const currentY = line.dot1.y + (line.dot2.y - line.dot1.y) * line.progress;

        this.ctx.beginPath();
        this.ctx.moveTo(line.dot1.x, line.dot1.y);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        this.ctx.restore();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DottedBackground();
});
