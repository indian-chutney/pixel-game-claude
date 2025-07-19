# Pixel Island Adventure

A simple 2D pixel-style web game built with HTML5 Canvas and JavaScript. Navigate an island, collect a weapon, and defeat the boss!

## How to Play

1. **Open the Game**: Simply open `index.html` in any modern web browser
2. **Movement**: Use Arrow Keys or WASD to move your character around the island
3. **Objective**: 
   - Find and collect the yellow weapon on the island
   - Navigate to the boss (brown square with red eyes) on the other side of the island
   - Attack the boss by getting close to it (requires the weapon)
   - Reduce the boss's HP to 0 to win!

## Game Features

- **Character Movement**: Smooth pixel-based movement with keyboard controls
- **Island Map**: Procedurally generated island with water, sand, grass, and trees
- **Collision Detection**: Cannot walk through water or trees
- **Weapon System**: Must collect weapon before being able to damage the boss
- **Boss Combat**: Boss with visible HP bar that decreases when attacked
- **Responsive Design**: Works on different screen sizes
- **Victory Condition**: Win by defeating the boss

## Controls

- **Arrow Keys** or **WASD**: Move character
- **Get close to yellow weapon**: Automatically pick it up
- **Get close to boss with weapon**: Automatically attack (deals damage over time)

## Technical Details

- Built with HTML5 Canvas and vanilla JavaScript
- No external dependencies required
- Runs entirely in the browser
- Pixel art style with simple collision detection
- Responsive CSS design

## File Structure

- `index.html` - Main game HTML with UI elements
- `game.js` - Game engine, logic, and rendering
- `style.css` - Styling and responsive design
- `README.md` - This file with game instructions

## Game Mechanics

- Character spawns in the bottom-left area of the island
- Yellow weapon spawns in the center area
- Boss spawns in the top-right area
- Boss has 100 HP and takes 10 damage per attack
- Attack cooldown of 0.5 seconds prevents spam
- Victory message appears when boss is defeated

Enjoy your pixel adventure!