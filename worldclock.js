// ========================================
// WORLD CLOCK - Analog Clocks for Seattle and Hong Kong
// ========================================
let worldClock = {
    seattleCanvas: null,
    hongkongCanvas: null,
    seattleCtx: null,
    hongkongCtx: null,
    isInitialized: false,
    isDragging: false,
    startMouseX: 0,
    timeOffset: 0, // Time offset in milliseconds
    currentBaseTime: new Date(), // Store current time as base

    init() {
        if (this.isInitialized) return;

        this.seattleCanvas = document.getElementById('seattleCanvas');
        this.hongkongCanvas = document.getElementById('hongkongCanvas');

        if (!this.seattleCanvas || !this.hongkongCanvas) {
            return;
        }

        this.seattleCtx = this.seattleCanvas.getContext('2d');
        this.hongkongCtx = this.hongkongCanvas.getContext('2d');

        this.addMouseListeners();
        this.updateClocks();
        this.animate();

        // Update every second
        setInterval(() => this.updateClocks(), 1000);

        this.isInitialized = true;
    },

    addMouseListeners() {
        // Add mouse listeners to both canvases
        [this.seattleCanvas, this.hongkongCanvas].forEach(canvas => {
            canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
            canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
            canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
            canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        });

        // Prevent context menu on right-click
        [this.seattleCanvas, this.hongkongCanvas].forEach(canvas => {
            canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        });
    },

    handleMouseDown(e) {
        this.isDragging = true;
        this.startMouseX = e.clientX;
        this.currentBaseTime = new Date();
        e.preventDefault();
    },

    handleMouseMove(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.startMouseX;
        // Convert pixels to time offset (pixels per minute)
        const pixelsPerMinute = 10;
        this.timeOffset = (deltaX / pixelsPerMinute) * 60 * 1000; // Positive so right drag goes forward

        this.updateClocks();
        e.preventDefault();
    },

    handleMouseUp(e) {
        this.isDragging = false;
        this.timeOffset = 0; // Reset to current time
        this.currentBaseTime = new Date(); // Update base time to current time
        this.updateClocks();
        e.preventDefault();
    },

    getTimeInTimezone(timezone) {
        // Use current time when not dragging, or current time + offset when dragging
        const currentTime = new Date();
        const adjustedTime = this.isDragging ? new Date(currentTime.getTime() + this.timeOffset) : currentTime;
        
        // Get current UTC time
        const utcTime = adjustedTime.getTime() + (adjustedTime.getTimezoneOffset() * 60000);
        
        // Timezone offsets in hours
        const timezoneOffsets = {
            'seattle': -8, // UTC-8 (PST)
            'hongkong': 8  // UTC+8
        };
        
        const targetTime = new Date(utcTime + (timezoneOffsets[timezone] * 3600000));
        return targetTime;
    },

    updateClocks() {
        this.drawClock(this.seattleCtx, this.seattleCanvas, this.getTimeInTimezone('seattle'));
        this.drawClock(this.hongkongCtx, this.hongkongCanvas, this.getTimeInTimezone('hongkong'));
        
        // Update digital time displays
        const seattleTime = this.getTimeInTimezone('seattle');
        const hongkongTime = this.getTimeInTimezone('hongkong');
        
        document.getElementById('seattleDigitalTime').textContent = seattleTime.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });
        
        document.getElementById('hongkongDigitalTime').textContent = hongkongTime.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    drawClock(ctx, canvas, time) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw clock face
        ctx.save();
        ctx.translate(centerX, centerY);

        // Draw outer circle (transparent with subtle blur effect)
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Very transparent
        ctx.fill();
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner border removed for ultra-minimal design
        // No inner circle drawn

        // Draw hour markers (12, 3, 6, 9)
        this.drawHourMarkers(ctx, radius);

        // Minute markers removed for minimal design
        // this.drawMinuteMarkers(ctx, radius);

        // Calculate hand angles
        const hours = time.getHours() % 12;
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();

        const hourAngle = (hours * 30 + minutes * 0.5) * Math.PI / 180;
        const minuteAngle = (minutes * 6) * Math.PI / 180;
        const secondAngle = (seconds * 6) * Math.PI / 180;

        // Draw hour hand
        this.drawHand(ctx, hourAngle, radius * 0.5, 6, '#2F4F4F');

        // Draw minute hand
        this.drawHand(ctx, minuteAngle, radius * 0.7, 4, '#2F4F4F');

        // Draw second hand
        this.drawHand(ctx, secondAngle, radius * 0.8, 2, '#A0522D');

        // Draw center circle
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#A0522D';
        ctx.fill();

        ctx.restore();
    },

    drawHourMarkers(ctx, radius) {
        const hourAngles = [
            0,                    // 12 o'clock
            Math.PI / 2,          // 3 o'clock
            Math.PI,              // 6 o'clock
            3 * Math.PI / 2       // 9 o'clock
        ];

        hourAngles.forEach(angle => {
            ctx.save();
            ctx.rotate(angle);
            
            // Draw subtle marker line (no text)
            ctx.beginPath();
            ctx.moveTo(0, -(radius - 8));
            ctx.lineTo(0, -(radius - 20));
            ctx.strokeStyle = '#D2B48C';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });
    },

    drawMinuteMarkers(ctx, radius) {
        for (let i = 0; i < 60; i++) {
            if (i % 5 !== 0) { // Skip hour markers
                ctx.save();
                ctx.rotate((i * 6) * Math.PI / 180);
                
                ctx.beginPath();
                ctx.moveTo(0, -(radius - 10));
                ctx.lineTo(0, -(radius - 15));
                ctx.strokeStyle = '#D2B48C';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                ctx.restore();
            }
        }
    },

    drawHand(ctx, angle, length, width, color) {
        ctx.save();
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, 10); // Start from center
        ctx.lineTo(0, -length);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        ctx.restore();
    },

    animate() {
        // This will be called continuously for smooth second hand movement
        requestAnimationFrame(() => {
            this.animate();
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the world clock page
    if (document.getElementById('seattleCanvas') && document.getElementById('hongkongCanvas')) {
        worldClock.init();
    }
});
