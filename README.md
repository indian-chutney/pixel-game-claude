# Pixel Multi-Island Adventure

A 2D pixel-style multi-island adventure game where you swim between islands, find a weapon, and defeat the boss!

## How to Play

1. **Start the Game**: Open `index.html` in your web browser
2. **Movement**: Use WASD keys or Arrow Keys to move your character
3. **Swimming**: Move through water to travel between islands (slower than walking)
4. **Multi-Island Quest**: 
   - Start on the **Starting Island** (left)
   - Swim to **Weapon Island** (center) to pick up the golden weapon
   - Swim to **Boss Island** (right) to confront the boss
5. **Combat**: Get close to the boss and press SPACE to attack
6. **Victory**: Reduce the boss's HP to zero to complete the adventure!

## Game Features

- **Multi-Island Adventure**: Three distinct islands connected by swimmable water
- **Swimming Mechanics**: Slower movement through water with visual effects
- **Island Progression**: Starting Island → Weapon Island → Boss Island
- **Location Tracking**: UI indicator showing current island or swimming status
- **Pixel Art Style**: Retro-inspired pixel graphics with smooth animations
- **Weapon System**: Pick up weapons with visual feedback and status updates
- **Boss Combat**: Engage in combat with a challenging boss enemy
- **Health System**: Boss has a health bar that depletes as you attack
- **Multiple Game States**: Start screen, gameplay, and victory screen
- **Visual Swimming Effects**: Transparency, ripples, and movement animations
- **Attack Range Indicator**: Visual indicator when you're close enough to attack

## Controls

- **Movement**: WASD or Arrow Keys
- **Swimming**: Same movement keys (automatically slower in water)
- **Attack**: SPACE (when near boss with weapon)
- **Start Game**: Click "Start Game" button
- **Restart**: Click "Play Again" after victory

## Island Guide

- **🏝️ Starting Island** (Left): Where your adventure begins
- **⚔️ Weapon Island** (Center): Find the golden weapon here
- **👹 Boss Island** (Right): Face the final boss challenge
- **🌊 Water**: Swim between islands (slower movement)

## Multi-Island Adventure Flow

1. **Starting Island**: Player spawns here, ready to begin the quest
2. **Swim to Weapon Island**: Navigate through water to reach the center island
3. **Collect the Weapon**: Pick up the glowing golden weapon
4. **Swim to Boss Island**: Travel to the final destination
5. **Boss Battle**: Defeat the red boss to complete your adventure!

## Technical Details

- Built with HTML5 Canvas and vanilla JavaScript
- No external dependencies required
- Pixel-perfect rendering with crisp edges
- Responsive design that works in any modern browser
- Smooth 60fps gameplay loop

## File Structure

- `index.html` - Main game page with UI elements
- `game.js` - Complete game engine with physics, rendering, and game logic
- `style.css` - Pixel art styling and responsive layout
- `README.md` - This file with game instructions

## Getting Started

Simply open `index.html` in any modern web browser. No installation or setup required!

The game runs entirely in the browser using HTML5 Canvas for rendering and JavaScript for game logic.