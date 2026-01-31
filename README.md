# Card Flip Memory Game (翻纸牌游戏)

A fun card-flipping memory game where players flip cards to find matching pairs.

## 🎮 Game Description

Card Flip Memory Game is a simple yet engaging puzzle game where players flip cards to reveal their contents and match pairs. Four cards are displayed at a time, and players must find the two matching pairs by flipping cards and confirming matches.

## 🎯 How to Play

1. **Objective**: Match all card pairs by flipping and confirming matches
2. **Rules**:
   - Four cards are displayed face-down at the start of each round
   - Click on a card to flip it and reveal its content
   - Click on additional cards to flip them
   - Once you have at least 2 cards flipped, the "Confirm Match" button becomes enabled
   - Click "Confirm Match" to check if the flipped cards match:
     - **Match**: If all flipped cards are the same, you earn 20 points per pair and the cards are removed
     - **Mismatch**: If cards don't match, you lose 5 points and cards flip back face-down
   - Continue until all pairs are matched
3. **Scoring**: 
   - Correct match: +20 points per pair
   - Incorrect match: -5 points
4. **Timer**: Track how quickly you can match all pairs
5. **Auto-Restart**: After completing a round, a new set of 4 cards appears automatically

## 🎨 Features

- **Card Flip Animation**: Smooth card flipping animations
- **Visual Feedback**: Cards highlight when flipped, with different colors for matches/mismatches
- **Match Confirmation**: Manual confirmation system - you decide when to check for matches
- **Scoring System**: Earn points for correct matches, lose points for mistakes
- **Responsive Design**: Works on desktop and mobile devices
- **Score Tracking**: Keep track of your score and time
- **Auto New Round**: Automatically starts a new round after completing the current one
- **Custom Images**: Upload your own images to personalize the cards

## 🕹️ Controls

- **Click on Card**: Flip card to reveal its content
- **Click Again on Flipped Card**: Unflip the card
- **Confirm Match Button**: Check if flipped cards match (enabled when 2+ cards are flipped)
- **New Game Button**: Start a new round with fresh cards

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
- **HTML5**: Game structure
- **CSS3**: Card styling, flip animations, and responsive design
- **JavaScript (ES6)**: Game logic and card management

## 🎨 Game Elements

The game supports two modes:

### Default Emoji Mode
The game uses emoji icons for cards:
- 🎨 🎭 🎪 🎯 🎲 (Entertainment)
- 🎸 🎹 🎺 🎻 🎼 (Music)
- 🏀 ⚽ 🏈 ⚾ 🎾 (Sports)

Each round displays 4 cards with 2 matching pairs randomly selected from these emojis.

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
3. (Optional) Customize with your own images:
   - Click "Customize Images" button
   - Use "📁 Load from Folder" to select multiple images at once
   - Or add images individually
4. Click "New Game" to start
5. Click on cards to flip them and reveal their contents
6. When you have flipped cards you want to match, click "Confirm Match"
7. Try to match all pairs with the highest score!

## 🏆 Tips for Players

- Remember which cards you've already flipped
- Try to match pairs with as few mistakes as possible to maximize your score
- Negative scores are possible if you make too many wrong matches
- Each round has exactly 2 pairs (4 cards total)

## 📄 License

This game is open source and free to use.

## 🤝 Contributing

Feel free to fork this project and add your own improvements:
- Add difficulty levels (more cards)
- Implement different game modes
- Add sound effects
- Create different card themes
- Add leaderboards

Enjoy playing Card Flip Memory Game! 🎮
