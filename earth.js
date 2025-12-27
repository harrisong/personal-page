// ========================================
// EARTH CLOCK - 3D Globe with Day/Night and Local Times
// ========================================
let earthClock = {
    scene: null,
    camera: null,
    renderer: null,
    earth: null,
    seattleMarker: null,
    hongkongMarker: null,
    sunLight: null,
    controls: null,
    isInitialized: false,

    // City coordinates (latitude, longitude)
    cities: {
        seattle: { lat: 47.6062, lon: -122.3321, name: 'Seattle' },
        hongkong: { lat: 22.3193, lon: 114.1694, name: 'Hong Kong' }
    },

    init() {
        if (this.isInitialized) return;

        const canvas = document.getElementById('earthCanvas');
        if (!canvas) {
            return;
        }

        this.setupScene();
        this.createEarth();
        this.addCities();
        this.setupLighting();
        this.setupControls();
        this.updateTime();
        this.animate();

        // Update time every minute
        setInterval(() => this.updateTime(), 60000);

        this.isInitialized = true;
    },

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent background

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, 600/600, 0.1, 1000);
        this.camera.position.set(0, 0, 3);

        // Renderer
        const canvas = document.getElementById('earthCanvas');
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        this.renderer.setSize(600, 600);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    },

    createEarth() {
        // Earth geometry
        const geometry = new THREE.SphereGeometry(1, 64, 64);

        // Create world map texture
        const worldMapTexture = this.createWorldMapTexture();

        // Earth material with day/night texture simulation
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                sunDirection: { value: new THREE.Vector3(1, 0, 0) },
                worldMap: { value: worldMapTexture }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 sunDirection;
                uniform sampler2D worldMap;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;

                void main() {
                    vec3 normal = normalize(vNormal);
                    float sunDot = dot(normal, sunDirection);

                    // Get world map color
                    vec4 mapColor = texture2D(worldMap, vUv);
                    
                    // Ensure map has solid colors (no alpha)
                    mapColor.a = 1.0;
                    
                    // Day/night factor
                    float dayFactor = smoothstep(-0.3, 0.3, sunDot);
                    
                    // If it's night, darken the map color
                    vec3 dayColor = mapColor.rgb;
                    vec3 nightColor = mapColor.rgb * 0.3; // Darker version of map
                    
                    vec3 color = mix(nightColor, dayColor, dayFactor);

                    // Add terminator glow
                    if (abs(sunDot) < 0.1) {
                        color = mix(color, vec3(0.8, 0.6, 0.2), 0.3);
                    }

                    // Ensure completely opaque output
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            transparent: false,
            depthTest: true,
            depthWrite: true,
            side: THREE.FrontSide
        });

        this.earth = new THREE.Mesh(geometry, material);
        this.scene.add(this.earth);
    },

    createWorldMapTexture() {
        // Create a canvas for the world map
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas size (power of 2 for texture)
        canvas.width = 512;
        canvas.height = 256;
        
        // Fill with ocean blue
        context.fillStyle = '#1e3f66';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw simplified continents (very rough approximation)
        context.fillStyle = '#4a7c59'; // Land green
        
        // North America (rough shape)
        context.beginPath();
        context.moveTo(80, 50);
        context.lineTo(150, 40);
        context.lineTo(180, 60);
        context.lineTo(170, 80);
        context.lineTo(140, 100);
        context.lineTo(120, 120);
        context.lineTo(100, 110);
        context.lineTo(90, 90);
        context.lineTo(80, 70);
        context.closePath();
        context.fill();
        
        // South America
        context.beginPath();
        context.moveTo(140, 120);
        context.lineTo(160, 140);
        context.lineTo(170, 160);
        context.lineTo(165, 180);
        context.lineTo(155, 200);
        context.lineTo(145, 220);
        context.lineTo(135, 200);
        context.lineTo(140, 180);
        context.lineTo(140, 160);
        context.closePath();
        context.fill();
        
        // Europe
        context.beginPath();
        context.moveTo(280, 40);
        context.lineTo(340, 35);
        context.lineTo(360, 50);
        context.lineTo(350, 70);
        context.lineTo(320, 80);
        context.lineTo(290, 70);
        context.lineTo(280, 55);
        context.closePath();
        context.fill();
        
        // Africa
        context.beginPath();
        context.moveTo(320, 80);
        context.lineTo(380, 85);
        context.lineTo(390, 120);
        context.lineTo(385, 160);
        context.lineTo(370, 190);
        context.lineTo(350, 200);
        context.lineTo(330, 180);
        context.lineTo(325, 150);
        context.lineTo(320, 120);
        context.closePath();
        context.fill();
        
        // Asia
        context.beginPath();
        context.moveTo(360, 50);
        context.lineTo(450, 45);
        context.lineTo(480, 60);
        context.lineTo(490, 80);
        context.lineTo(470, 100);
        context.lineTo(450, 90);
        context.lineTo(440, 70);
        context.lineTo(400, 65);
        context.lineTo(380, 60);
        context.closePath();
        context.fill();
        
        // Australia
        context.beginPath();
        context.moveTo(420, 180);
        context.lineTo(460, 175);
        context.lineTo(480, 190);
        context.lineTo(470, 210);
        context.lineTo(440, 205);
        context.lineTo(425, 195);
        context.closePath();
        context.fill();
        
        // Greenland
        context.beginPath();
        context.moveTo(220, 20);
        context.lineTo(280, 15);
        context.lineTo(290, 35);
        context.lineTo(270, 45);
        context.lineTo(240, 40);
        context.closePath();
        context.fill();
        
        // Japan (small island)
        context.fillRect(460, 85, 8, 20);
        
        // Add some island chains
        context.fillRect(200, 150, 6, 6); // Caribbean
        context.fillRect(380, 160, 4, 4); // Madagascar
        context.fillRect(500, 90, 6, 12); // Philippines
        context.fillRect(440, 140, 4, 4); // New Guinea
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.needsUpdate = true;
        
        return texture;
    },

    addCities() {
        // Create city markers
        const markerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // Create label sprites
        const seattleLabel = this.createLabelSprite('Seattle', '#ff0000');
        const hongkongLabel = this.createLabelSprite('Hong Kong', '#ff0000');

        // Seattle marker
        const seattlePos = this.latLonToVector3(this.cities.seattle.lat, this.cities.seattle.lon, 1.01);
        this.seattleMarker = new THREE.Mesh(markerGeometry, markerMaterial.clone());
        this.seattleMarker.position.copy(seattlePos);
        seattleLabel.position.copy(seattlePos).add(new THREE.Vector3(0, 0.1, 0)); // Offset label slightly
        this.earth.add(this.seattleMarker); // Add as child of Earth, not scene
        this.earth.add(seattleLabel); // Add label as child of Earth

        // Hong Kong marker
        const hongkongPos = this.latLonToVector3(this.cities.hongkong.lat, this.cities.hongkong.lon, 1.01);
        this.hongkongMarker = new THREE.Mesh(markerGeometry, markerMaterial.clone());
        this.hongkongMarker.position.copy(hongkongPos);
        hongkongLabel.position.copy(hongkongPos).add(new THREE.Vector3(0, 0.1, 0)); // Offset label slightly
        this.earth.add(this.hongkongMarker); // Add as child of Earth, not scene
        this.earth.add(hongkongLabel); // Add label as child of Earth
    },

    createLabelSprite(text, color) {
        // Create a canvas for the label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 256;
        canvas.height = 64;
        
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        context.font = '24px Inter, sans-serif';
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Create sprite material
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            depthTest: false // Always render on top
        });
        
        // Create sprite
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.4, 0.1, 1); // Scale to reasonable size
        
        return sprite;
    },

    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Sun light (directional)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(5, 0, 0);
        this.sunLight.castShadow = true;
        this.scene.add(this.sunLight);
    },

    setupControls() {
        // Enhanced mouse controls for rotation
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const canvas = document.getElementById('earthCanvas');

        // Ensure canvas can receive mouse events
        canvas.style.pointerEvents = 'auto';
        canvas.style.cursor = 'grab';
        canvas.style.position = 'relative';
        canvas.style.zIndex = '10';

        // Mouse controls for rotation
        canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        });

        canvas.addEventListener('mousemove', (e) => {
            e.preventDefault();
            if (!isDragging) {
                return;
            }

            const deltaX = e.clientX - previousMousePosition.x;

            // Rotate Earth based on mouse movement (Y-axis only)
            if (this.earth) {
                // Only rotate around Y-axis (north-south axis)
                this.earth.rotation.y += deltaX * 0.05; 
            }

            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            isDragging = false;
            canvas.style.cursor = 'grab';
        });

        canvas.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            isDragging = false;
            canvas.style.cursor = 'grab';
        });
    },

    updateTime() {
        const now = new Date();

        // Update sun position (simplified - sun moves across the sky)
        const hour = now.getHours();
        const sunAngle = ((hour - 6) / 12) * Math.PI; // Sunrise at 6 AM, sunset at 6 PM
        const sunX = Math.cos(sunAngle) * 5;
        const sunZ = Math.sin(sunAngle) * 5;
        this.sunLight.position.set(sunX, 0, sunZ);

        // Update shader uniforms
        if (this.earth.material.uniforms) {
            this.earth.material.uniforms.time.value = now.getTime() * 0.001;
            this.earth.material.uniforms.sunDirection.value.copy(this.sunLight.position).normalize();
        }

        // Update local times
        this.updateLocalTimes(now);
    },

    updateLocalTimes(now) {
        // Assuming the browser is in Seattle (PST, UTC-8)
        // Hong Kong is UTC+8, which is 16 hours ahead of Seattle
        const seattleTime = new Date(now); // Current time (already in Seattle time zone)
        const hongkongTime = new Date(now.getTime() + (16 * 60 * 60 * 1000)); // +16 hours for Hong Kong

        const seattleElement = document.getElementById('seattleTime');
        const hongkongElement = document.getElementById('hongkongTime');

        if (seattleElement) {
            seattleElement.textContent = seattleTime.toLocaleTimeString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: '2-digit'
            });
        }

        if (hongkongElement) {
            hongkongElement.textContent = hongkongTime.toLocaleTimeString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: '2-digit'
            });
        }
    },

    latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
    },

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate Earth slowly
        if (this.earth) {
            this.earth.rotation.y += 0.002;
        }

        // Update shader uniforms for real-time day/night rendering
        if (this.earth && this.earth.material.uniforms) {
            // Calculate sun direction relative to Earth rotation
            const sunDirection = this.sunLight.position.clone();
            sunDirection.applyEuler(new THREE.Euler(-this.earth.rotation.x, -this.earth.rotation.y, -this.earth.rotation.z));
            this.earth.material.uniforms.sunDirection.value.copy(sunDirection).normalize();
        }

        this.renderer.render(this.scene, this.camera);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the earth page
    if (document.getElementById('earthCanvas')) {
        earthClock.init();
    }
});
