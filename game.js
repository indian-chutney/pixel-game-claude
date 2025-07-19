// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 32;
const PLAYER_SIZE = 24;
const WEAPON_SIZE = 16;
const BOSS_SIZE = 48;

// Game state
const game = {
    canvas: null,
    ctx: null,
    player: {
        x: 100,
        y: 500,
        size: PLAYER_SIZE,
        speed: 3,
        hasWeapon: false,
        color: '#FF6B6B'
    },
    weapon: {
        x: 400,
        y: 200,
        size: WEAPON_SIZE,
        collected: false,
        color: '#FFD93D'
    },
    boss: {
        x: 650,
        y: 100,
        size: BOSS_SIZE,
        maxHp: 100,
        hp: 100,
        color: '#8B4513',
        lastHit: 0
    },
    keys: {},
    gameWon: false,
    islands: []
};

// Initialize game
function init() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    
    // Set canvas size
    game.canvas.width = CANVAS_WIDTH;
    game.canvas.height = CANVAS_HEIGHT;
    
    // Generate island map
    generateIslandMap();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start game loop
    gameLoop();
}

// Generate simple island map data
function generateIslandMap() {
    // Create a simple island shape
    for (let x = 0; x < CANVAS_WIDTH; x += TILE_SIZE) {
        for (let y = 0; y < CANVAS_HEIGHT; y += TILE_SIZE) {
            const centerX = CANVAS_WIDTH / 2;
            const centerY = CANVAS_HEIGHT / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            
            let tileType = 'water';
            if (distance < 250) {
                tileType = 'grass';
                // Add some trees randomly
                if (Math.random() < 0.1 && distance > 80) {
                    tileType = 'tree';
                }
            } else if (distance < 280) {
                tileType = 'sand';
            }
            
            game.islands.push({
                x: x,
                y: y,
                type: tileType
            });
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        game.keys[e.key.toLowerCase()] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        game.keys[e.key.toLowerCase()] = false;
    });
    
    // Prevent scrolling with arrow keys
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });
}

// Handle player movement
function updatePlayer() {
    if (game.gameWon) return;
    
    let newX = game.player.x;
    let newY = game.player.y;
    
    // Movement controls (WASD and Arrow keys)
    if (game.keys['w'] || game.keys['arrowup']) {
        newY -= game.player.speed;
    }
    if (game.keys['s'] || game.keys['arrowdown']) {
        newY += game.player.speed;
    }
    if (game.keys['a'] || game.keys['arrowleft']) {
        newX -= game.player.speed;
    }
    if (game.keys['d'] || game.keys['arrowright']) {
        newX += game.player.speed;
    }
    
    // Check if new position is valid (not in water or trees)
    if (isValidPosition(newX, newY, game.player.size)) {
        game.player.x = newX;
        game.player.y = newY;
    }
    
    // Check weapon pickup
    if (!game.weapon.collected && !game.player.hasWeapon) {
        const distance = Math.sqrt(
            (game.player.x - game.weapon.x) ** 2 + 
            (game.player.y - game.weapon.y) ** 2
        );
        
        if (distance < 30) {
            game.player.hasWeapon = true;
            game.weapon.collected = true;
            updateWeaponStatus();
        }
    }
    
    // Check boss combat
    if (game.player.hasWeapon && game.boss.hp > 0) {
        const distance = Math.sqrt(
            (game.player.x - game.boss.x) ** 2 + 
            (game.player.y - game.boss.y) ** 2
        );
        
        if (distance < 60 && Date.now() - game.boss.lastHit > 500) {
            game.boss.hp = Math.max(0, game.boss.hp - 10);
            game.boss.lastHit = Date.now();
            updateBossHp();
            
            if (game.boss.hp === 0) {
                game.gameWon = true;
                showGameMessage('Victory! You defeated the boss!', '#27ae60');
            }
        }
    }
}

// Check if position is valid (not in water or obstacles)
function isValidPosition(x, y, size) {
    // Keep player within canvas bounds
    if (x < 0 || y < 0 || x + size > CANVAS_WIDTH || y + size > CANVAS_HEIGHT) {
        return false;
    }
    
    // Check collision with water and trees
    const corners = [
        { x: x, y: y },
        { x: x + size, y: y },
        { x: x, y: y + size },
        { x: x + size, y: y + size }
    ];
    
    for (const corner of corners) {
        const tile = getTileAt(corner.x, corner.y);
        if (tile && (tile.type === 'water' || tile.type === 'tree')) {
            return false;
        }
    }
    
    return true;
}

// Get tile at specific position
function getTileAt(x, y) {
    const tileX = Math.floor(x / TILE_SIZE) * TILE_SIZE;
    const tileY = Math.floor(y / TILE_SIZE) * TILE_SIZE;
    
    return game.islands.find(island => 
        island.x === tileX && island.y === tileY
    );
}

// Render game
function render() {
    // Clear canvas
    game.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw island map
    drawMap();
    
    // Draw weapon (if not collected)
    if (!game.weapon.collected) {
        drawWeapon();
    }
    
    // Draw boss
    drawBoss();
    
    // Draw player
    drawPlayer();
}

// Draw the island map
function drawMap() {
    for (const island of game.islands) {
        let color;
        switch (island.type) {
            case 'water':
                color = '#3498db';
                break;
            case 'sand':
                color = '#f4d03f';
                break;
            case 'grass':
                color = '#58d68d';
                break;
            case 'tree':
                color = '#28b463';
                break;
            default:
                color = '#3498db';
        }
        
        game.ctx.fillStyle = color;
        game.ctx.fillRect(island.x, island.y, TILE_SIZE, TILE_SIZE);
        
        // Add simple texture to trees
        if (island.type === 'tree') {
            game.ctx.fillStyle = '#1e8449';
            game.ctx.fillRect(island.x + 4, island.y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        }
    }
}

// Draw player
function drawPlayer() {
    game.ctx.fillStyle = game.player.color;
    game.ctx.fillRect(
        game.player.x, 
        game.player.y, 
        game.player.size, 
        game.player.size
    );
    
    // Draw simple pixel character details
    game.ctx.fillStyle = '#2c3e50';
    game.ctx.fillRect(game.player.x + 6, game.player.y + 6, 4, 4); // Left eye
    game.ctx.fillRect(game.player.x + 14, game.player.y + 6, 4, 4); // Right eye
    
    // Draw weapon if player has it
    if (game.player.hasWeapon) {
        game.ctx.fillStyle = game.weapon.color;
        game.ctx.fillRect(
            game.player.x + game.player.size, 
            game.player.y + 8, 
            12, 
            4
        );
    }
}

// Draw weapon
function drawWeapon() {
    game.ctx.fillStyle = game.weapon.color;
    game.ctx.fillRect(
        game.weapon.x, 
        game.weapon.y, 
        game.weapon.size, 
        game.weapon.size
    );
    
    // Add weapon details
    game.ctx.fillStyle = '#f39c12';
    game.ctx.fillRect(game.weapon.x + 2, game.weapon.y + 2, game.weapon.size - 4, game.weapon.size - 4);
}

// Draw boss
function drawBoss() {
    // Boss body
    game.ctx.fillStyle = game.boss.color;
    game.ctx.fillRect(
        game.boss.x, 
        game.boss.y, 
        game.boss.size, 
        game.boss.size
    );
    
    // Boss eyes
    game.ctx.fillStyle = '#e74c3c';
    game.ctx.fillRect(game.boss.x + 12, game.boss.y + 12, 6, 6);
    game.ctx.fillRect(game.boss.x + 30, game.boss.y + 12, 6, 6);
    
    // Boss health bar above boss
    drawHealthBar(game.boss.x, game.boss.y - 20, game.boss.size, game.boss.hp, game.boss.maxHp);
}

// Draw health bar
function drawHealthBar(x, y, width, currentHp, maxHp) {
    // Background
    game.ctx.fillStyle = '#34495e';
    game.ctx.fillRect(x, y, width, 8);
    
    // Health fill
    const healthPercent = currentHp / maxHp;
    game.ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
    game.ctx.fillRect(x, y, width * healthPercent, 8);
    
    // Border
    game.ctx.strokeStyle = '#ecf0f1';
    game.ctx.lineWidth = 1;
    game.ctx.strokeRect(x, y, width, 8);
}

// Update UI elements
function updateWeaponStatus() {
    const weaponStatus = document.getElementById('weaponStatus');
    if (game.player.hasWeapon) {
        weaponStatus.textContent = 'Armed!';
        weaponStatus.classList.add('has-weapon');
    } else {
        weaponStatus.textContent = 'No Weapon';
        weaponStatus.classList.remove('has-weapon');
    }
}

function updateBossHp() {
    const bossHpBar = document.getElementById('bossHp');
    const bossHpText = document.getElementById('bossHpText');
    
    const healthPercent = (game.boss.hp / game.boss.maxHp) * 100;
    bossHpBar.style.width = `${healthPercent}%`;
    bossHpText.textContent = `${game.boss.hp}/${game.boss.maxHp}`;
}

function showGameMessage(message, color = '#27ae60') {
    const gameMessage = document.getElementById('gameMessage');
    gameMessage.textContent = message;
    gameMessage.style.backgroundColor = color;
    gameMessage.style.display = 'block';
}

// Main game loop
function gameLoop() {
    updatePlayer();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', init);