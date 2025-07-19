class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // Game state
        this.gameState = 'start'; // start, playing, victory
        this.keys = {};
        this.lastTime = 0;
        
        // Map dimensions
        this.mapWidth = 800;
        this.mapHeight = 600;
        this.tileSize = 20;
        
        // Player - starts on the starting island (left side)
        this.player = {
            x: 120,
            y: 300,
            width: 16,
            height: 16,
            speed: 2,
            hasWeapon: false,
            color: '#3498db',
            isSwimming: false
        };
        
        // Weapon - located on weapon island (center)
        this.weapon = {
            x: 390,
            y: 290,
            width: 12,
            height: 12,
            picked: false,
            glowTime: 0
        };
        
        // Boss - located on boss island (right side)
        this.boss = {
            x: 620,
            y: 300,
            width: 32,
            height: 32,
            maxHealth: 100,
            health: 100,
            color: '#e74c3c',
            lastDamageTime: 0
        };
        
        // Island map (1 = land, 0 = water)
        this.generateMap();
        
        // Attack system
        this.attackCooldown = 0;
        this.attackRange = 50;
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    generateMap() {
        this.map = [];
        const tilesX = Math.ceil(this.mapWidth / this.tileSize);
        const tilesY = Math.ceil(this.mapHeight / this.tileSize);
        
        // Initialize map with water
        for (let y = 0; y < tilesY; y++) {
            this.map[y] = [];
            for (let x = 0; x < tilesX; x++) {
                this.map[y][x] = 0; // Water
            }
        }
        
        // Create three separate islands
        this.createStartingIsland(tilesX, tilesY);
        this.createWeaponIsland(tilesX, tilesY);
        this.createBossIsland(tilesX, tilesY);
        
        // Ensure starting positions are on land
        this.ensureLandAt(this.player.x, this.player.y);
        this.ensureLandAt(this.weapon.x, this.weapon.y);
        this.ensureLandAt(this.boss.x, this.boss.y);
    }
    
    createStartingIsland(tilesX, tilesY) {
        // Starting island on the left side
        const centerX = tilesX * 0.2;
        const centerY = tilesY * 0.5;
        const radius = Math.min(tilesX, tilesY) * 0.15;
        
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                const noise = (Math.sin(x * 0.3) + Math.cos(y * 0.3)) * 1.5;
                
                if (distance < (radius + noise)) {
                    this.map[y][x] = 1;
                }
            }
        }
    }
    
    createWeaponIsland(tilesX, tilesY) {
        // Weapon island in the center
        const centerX = tilesX * 0.5;
        const centerY = tilesY * 0.5;
        const radius = Math.min(tilesX, tilesY) * 0.12;
        
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                const noise = (Math.sin(x * 0.4) + Math.cos(y * 0.4)) * 1;
                
                if (distance < (radius + noise)) {
                    this.map[y][x] = 1;
                }
            }
        }
    }
    
    createBossIsland(tilesX, tilesY) {
        // Boss island on the right side
        const centerX = tilesX * 0.8;
        const centerY = tilesY * 0.5;
        const radius = Math.min(tilesX, tilesY) * 0.18;
        
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                const noise = (Math.sin(x * 0.2) + Math.cos(y * 0.2)) * 2;
                
                if (distance < (radius + noise)) {
                    this.map[y][x] = 1;
                }
            }
        }
    }
    
    ensureLandAt(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        // Make a small area around the position land
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const mapX = tileX + dx;
                const mapY = tileY + dy;
                if (mapX >= 0 && mapX < this.map[0].length && 
                    mapY >= 0 && mapY < this.map.length) {
                    this.map[mapY][mapX] = 1;
                }
            }
        }
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                this.handleAttack();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Game state buttons
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').style.display = 'none';
    }
    
    restartGame() {
        // Reset game state
        this.gameState = 'playing';
        this.player.x = 120;
        this.player.y = 300;
        this.player.hasWeapon = false;
        this.player.isSwimming = false;
        this.weapon.picked = false;
        this.boss.health = this.boss.maxHealth;
        this.attackCooldown = 0;
        
        document.getElementById('victoryScreen').style.display = 'none';
        this.updateUI();
    }
    
    handleAttack() {
        if (this.gameState !== 'playing' || !this.player.hasWeapon || this.attackCooldown > 0) {
            return;
        }
        
        // Check if player is close enough to boss
        const distance = Math.sqrt(
            Math.pow(this.player.x - this.boss.x, 2) + 
            Math.pow(this.player.y - this.boss.y, 2)
        );
        
        if (distance <= this.attackRange) {
            this.boss.health -= 20;
            this.boss.lastDamageTime = Date.now();
            this.attackCooldown = 30; // 30 frames cooldown
            
            if (this.boss.health <= 0) {
                this.gameState = 'victory';
                document.getElementById('victoryScreen').style.display = 'flex';
            }
            
            this.updateUI();
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        // Update weapon glow
        this.weapon.glowTime += deltaTime * 0.005;
        
        // Player movement
        let newX = this.player.x;
        let newY = this.player.y;
        
        // Calculate movement speed based on terrain
        const moveSpeed = this.getMoveSpeed(this.player.x, this.player.y);
        
        if (this.keys['arrowleft'] || this.keys['a']) newX -= moveSpeed;
        if (this.keys['arrowright'] || this.keys['d']) newX += moveSpeed;
        if (this.keys['arrowup'] || this.keys['w']) newY -= moveSpeed;
        if (this.keys['arrowdown'] || this.keys['s']) newY += moveSpeed;
        
        // Allow movement on both land and water (swimming)
        if (this.canMoveTo(newX, this.player.y)) {
            this.player.x = newX;
        }
        if (this.canMoveTo(this.player.x, newY)) {
            this.player.y = newY;
        }
        
        // Update swimming status
        this.updateSwimmingStatus();
        
        // Update location status
        this.updateLocationStatus();
        
        // Keep player within canvas bounds
        this.player.x = Math.max(0, Math.min(this.mapWidth - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.mapHeight - this.player.height, this.player.y));
        
        // Check weapon pickup
        if (!this.weapon.picked && this.isColliding(this.player, this.weapon)) {
            this.weapon.picked = true;
            this.player.hasWeapon = true;
            this.updateUI();
        }
    }
    
    getMoveSpeed(x, y) {
        const tileX = Math.floor((x + this.player.width / 2) / this.tileSize);
        const tileY = Math.floor((y + this.player.height / 2) / this.tileSize);
        
        if (tileX < 0 || tileX >= this.map[0].length || 
            tileY < 0 || tileY >= this.map.length) {
            return this.player.speed;
        }
        
        // Swimming in water is slower than walking on land
        if (this.map[tileY][tileX] === 0) {
            return this.player.speed * 0.6; // 60% speed in water
        }
        
        return this.player.speed; // Full speed on land
    }
    
    updateSwimmingStatus() {
        const tileX = Math.floor((this.player.x + this.player.width / 2) / this.tileSize);
        const tileY = Math.floor((this.player.y + this.player.height / 2) / this.tileSize);
        
        if (tileX >= 0 && tileX < this.map[0].length && 
            tileY >= 0 && tileY < this.map.length) {
            this.player.isSwimming = this.map[tileY][tileX] === 0;
        } else {
            this.player.isSwimming = false;
        }
    }
    
    updateLocationStatus() {
        const tilesX = Math.ceil(this.mapWidth / this.tileSize);
        const playerCenterX = this.player.x + this.player.width / 2;
        
        let location = "Swimming";
        
        if (!this.player.isSwimming) {
            if (playerCenterX < tilesX * this.tileSize * 0.35) {
                location = "Starting Island";
            } else if (playerCenterX < tilesX * this.tileSize * 0.65) {
                location = "Weapon Island";
            } else {
                location = "Boss Island";
            }
        }
        
        const locationElement = document.getElementById('locationStatus');
        if (locationElement) {
            locationElement.textContent = location;
            
            // Update background color based on location
            if (this.player.isSwimming) {
                locationElement.style.background = 'rgba(33, 150, 243, 0.8)';
            } else if (location === "Starting Island") {
                locationElement.style.background = 'rgba(76, 175, 80, 0.8)';
            } else if (location === "Weapon Island") {
                locationElement.style.background = 'rgba(255, 193, 7, 0.8)';
            } else if (location === "Boss Island") {
                locationElement.style.background = 'rgba(244, 67, 54, 0.8)';
            }
        }
    }
    
    canMoveTo(x, y) {
        // Allow movement on both land and water (swimming enabled)
        const tileX = Math.floor((x + this.player.width / 2) / this.tileSize);
        const tileY = Math.floor((y + this.player.height / 2) / this.tileSize);
        
        // Only restrict movement if completely outside map bounds
        if (tileX < 0 || tileX >= this.map[0].length || 
            tileY < 0 || tileY >= this.map.length) {
            return false;
        }
        
        return true; // Can move on both land (1) and water (0)
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);
        
        // Render map
        this.renderMap();
        
        // Render weapon (if not picked up)
        if (!this.weapon.picked) {
            this.renderWeapon();
        }
        
        // Render boss
        this.renderBoss();
        
        // Render player
        this.renderPlayer();
        
        // Render attack range indicator when player has weapon and is near boss
        if (this.player.hasWeapon && this.gameState === 'playing') {
            const distance = Math.sqrt(
                Math.pow(this.player.x - this.boss.x, 2) + 
                Math.pow(this.player.y - this.boss.y, 2)
            );
            
            if (distance <= this.attackRange) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.arc(this.player.x + this.player.width/2, 
                            this.player.y + this.player.height/2, 
                            this.attackRange, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
    }
    
    renderMap() {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;
                
                if (this.map[y][x] === 1) {
                    // Land
                    this.ctx.fillStyle = '#8BC34A';
                    this.ctx.fillRect(pixelX, pixelY, this.tileSize, this.tileSize);
                    
                    // Add some texture
                    if ((x + y) % 3 === 0) {
                        this.ctx.fillStyle = '#7CB342';
                        this.ctx.fillRect(pixelX + 2, pixelY + 2, this.tileSize - 4, this.tileSize - 4);
                    }
                } else {
                    // Water
                    this.ctx.fillStyle = '#2196F3';
                    this.ctx.fillRect(pixelX, pixelY, this.tileSize, this.tileSize);
                    
                    // Water animation
                    if ((x + y + Math.floor(Date.now() / 500)) % 4 === 0) {
                        this.ctx.fillStyle = '#64B5F6';
                        this.ctx.fillRect(pixelX + 1, pixelY + 1, this.tileSize - 2, this.tileSize - 2);
                    }
                }
            }
        }
    }
    
    renderPlayer() {
        // Swimming effect - slight transparency and movement
        const swimOffset = this.player.isSwimming ? Math.sin(Date.now() * 0.01) * 0.5 : 0;
        const playerAlpha = this.player.isSwimming ? 0.8 : 1.0;
        
        this.ctx.save();
        this.ctx.globalAlpha = playerAlpha;
        
        // Player body
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y + swimOffset, this.player.width, this.player.height);
        
        // Player face
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fillRect(this.player.x + 2, this.player.y + 2 + swimOffset, this.player.width - 4, this.player.height - 4);
        
        // Eyes
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x + 4, this.player.y + 4 + swimOffset, 2, 2);
        this.ctx.fillRect(this.player.x + 10, this.player.y + 4 + swimOffset, 2, 2);
        
        // Swimming ripple effect
        if (this.player.isSwimming) {
            this.ctx.globalAlpha = 0.3;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            const rippleRadius = 12 + Math.sin(Date.now() * 0.02) * 4;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + this.player.width/2, 
                        this.player.y + this.player.height/2 + swimOffset, 
                        rippleRadius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        
        // Weapon indicator
        if (this.player.hasWeapon) {
            this.ctx.fillStyle = '#f39c12';
            this.ctx.fillRect(this.player.x + this.player.width, this.player.y + 4 + swimOffset, 8, 3);
        }
    }
    
    renderWeapon() {
        const glow = Math.sin(this.weapon.glowTime) * 0.3 + 0.7;
        
        this.ctx.fillStyle = `rgba(243, 156, 18, ${glow})`;
        this.ctx.fillRect(this.weapon.x - 2, this.weapon.y - 2, 
                         this.weapon.width + 4, this.weapon.height + 4);
        
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fillRect(this.weapon.x, this.weapon.y, this.weapon.width, this.weapon.height);
        
        // Weapon blade
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillRect(this.weapon.x + 2, this.weapon.y + 1, 8, 2);
        
        // Handle
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(this.weapon.x + 1, this.weapon.y + 4, 3, 6);
    }
    
    renderBoss() {
        // Damage flash effect
        const timeSinceDamage = Date.now() - this.boss.lastDamageTime;
        const isFlashing = timeSinceDamage < 200;
        
        if (isFlashing) {
            this.ctx.fillStyle = '#ffffff';
        } else {
            this.ctx.fillStyle = this.boss.color;
        }
        
        // Boss body
        this.ctx.fillRect(this.boss.x, this.boss.y, this.boss.width, this.boss.height);
        
        if (!isFlashing) {
            // Boss details
            this.ctx.fillStyle = '#c0392b';
            this.ctx.fillRect(this.boss.x + 4, this.boss.y + 4, 
                             this.boss.width - 8, this.boss.height - 8);
            
            // Boss eyes
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(this.boss.x + 8, this.boss.y + 8, 3, 3);
            this.ctx.fillRect(this.boss.x + 21, this.boss.y + 8, 3, 3);
            
            // Boss mouth
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(this.boss.x + 12, this.boss.y + 20, 8, 3);
        }
        
        // Boss health bar
        const barWidth = this.boss.width;
        const barHeight = 4;
        const barY = this.boss.y - 8;
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(this.boss.x - 1, barY - 1, barWidth + 2, barHeight + 2);
        
        this.ctx.fillStyle = '#e74c3c';
        const healthPercentage = this.boss.health / this.boss.maxHealth;
        this.ctx.fillRect(this.boss.x, barY, barWidth * healthPercentage, barHeight);
    }
    
    updateUI() {
        // Update boss health bar
        const healthPercentage = Math.max(0, this.boss.health / this.boss.maxHealth * 100);
        document.getElementById('bossHealth').style.width = healthPercentage + '%';
        
        // Update weapon status
        const weaponStatus = document.getElementById('weaponStatus');
        if (this.player.hasWeapon) {
            weaponStatus.textContent = 'Armed and ready!';
            weaponStatus.style.background = 'rgba(46, 125, 50, 0.8)';
        } else {
            weaponStatus.textContent = 'Find a weapon!';
            weaponStatus.style.background = 'rgba(0, 0, 0, 0.5)';
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});