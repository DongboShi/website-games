# Connect the Dots (连连看) Game

A classic web-based matching game where players connect pairs of matching tiles following specific path rules.

## 🎮 Game Description

Connect the Dots, also known as "连连看" (Lianliankan) in Chinese, is a popular puzzle game where players must match pairs of identical tiles. The challenge lies in the connection rules: tiles can only be connected if the path between them has **at most 2 turns** and contains **no obstacles**.

## 🎯 How to Play

1. **Objective**: Clear all tiles from the board by matching pairs of identical items
2. **Rules**:
   - Click on a tile to select it
   - Click on another tile with the same icon to attempt a match
   - The tiles will match and disappear if they can be connected with a valid path
   - A valid path must:
     - Have at most 2 turns (0, 1, or 2 corner turns)
     - Not pass through other tiles (no obstacles in the path)
     - Can extend outside the board boundaries
3. **Scoring**: Each successful match earns you 10 points
4. **Timer**: Track how quickly you can clear the board

## 🎨 Features

- **Visual Feedback**: Selected tiles are highlighted, and connection paths are drawn
- **Animations**: Smooth animations for tile matching and removal
- **Hint System**: Click the "Hint" button to reveal a valid matching pair
- **Responsive Design**: Works on desktop and mobile devices
- **Score Tracking**: Keep track of your score and time
- **New Game**: Start a fresh game at any time

## 🕹️ Controls

- **Click**: Select/deselect tiles
- **New Game Button**: Start a new game
- **Hint Button**: Reveal a valid matching pair

## 🛠️ Technical Details

### Files Structure
```
.
├── custom-images/           # Custom image storage folder (NEW!)
│   ├── user-uploads/       # Place your images here for batch upload
│   └── README.md           # Custom images documentation
├── index.html              # Main HTML structure
├── styles.css              # Styling and animations
├── game.js                 # Game logic and path-finding algorithm
└── README.md               # This file
```

### Technologies Used
- **HTML5**: Game structure and canvas for drawing paths
- **CSS3**: Styling, animations, and responsive design
- **JavaScript (ES6)**: Game logic, path-finding algorithm, and DOM manipulation

### Path-Finding Algorithm

The game implements a sophisticated path-finding algorithm that checks for valid connections:

1. **Direct Path (0 turns)**: Checks if tiles are in the same row or column with no obstacles
2. **One Corner Path (1 turn)**: Tries connecting through a single corner point
3. **Two Corner Path (2 turns)**: Explores paths through two corner points, including paths that extend outside the board

The algorithm ensures:
- Maximum of 2 turns in any path
- No tiles obstruct the connection line
- Paths can extend outside the visible board for flexibility

## 🎨 Game Elements

The game supports two modes:

### Default Emoji Mode
The game uses emoji icons for tiles:
- 🎨 🎭 🎪 🎯 🎲 (Entertainment)
- 🎸 🎹 🎺 🎻 🎼 (Music)
- 🏀 ⚽ 🏈 ⚾ 🎾 (Sports)

### Custom Image Mode
Upload your own images to personalize the game! Two methods available:

1. **Batch Upload from Folder** (NEW! ✨)
   - Place images in `custom-images/user-uploads/` folder
   - Click "Customize Images" → "Load from Folder"
   - Select multiple images at once
   - Instant upload and preview

2. **Individual Upload**
   - Click "Customize Images" → "Use Custom Images"
   - Add image pairs one by one
   - Full control over each pair

See the [Custom Images README](custom-images/README.md) for detailed instructions.

## 📱 Responsive Design

The game automatically adjusts to different screen sizes:
- Desktop: Larger tiles (60×60px) with full spacing
- Mobile: Smaller tiles (50×50px) with adjusted spacing
- Touch-friendly buttons and controls

## 🚀 Getting Started

1. Open `index.html` in a modern web browser
2. Register an account or log in
1. (Optional) Customize with your own images:
   - Place images in `custom-images/user-uploads/` folder for easy organization
   - Click "Customize Images" button
   - Use "📁 Load from Folder" to select multiple images at once via file picker
4. Click "New Game" to start
5. Click on matching tiles to connect and clear them
6. Use "Hint" if you get stuck
7. Try to clear all tiles as quickly as possible!

## 🏆 Tips for Players

- Look for tiles on the edges first - they're easier to connect
- Use the hint feature sparingly to challenge yourself
- Plan your moves ahead to avoid getting stuck
- Remember: paths can go outside the board boundaries!

## 📄 License

This game is open source and free to use.

## 🤝 Contributing

Feel free to fork this project and add your own improvements:
- Add difficulty levels
- Implement power-ups
- Add sound effects
- Create different tile themes
- Add multiplayer support

Enjoy playing Connect the Dots! 🎮
