# Custom Images for Connect the Dots Game

## 📁 Folder Structure

```
custom-images/
├── user-uploads/     # Place your custom images here for batch upload
└── README.md         # This file
```

## 🎨 How to Use Custom Images

### Method 1: Batch Upload from Local Folder (Recommended)

1. **Organize Your Images**: Place your custom image files in the `user-uploads/` folder for easy access
   - Supported formats: JPG, PNG, GIF, WebP
   - Recommended size: 100x100 pixels or smaller
   - Maximum file size: 500KB per image
   - File names can be anything (e.g., `cat.png`, `dog.jpg`, `flower.gif`)

2. **Open the Game**: Load `index.html` in your web browser

3. **Upload via File Picker**:
   - Click the "Customize Images" button in the game interface
   - Select "Use Custom Images" mode
   - Click the "Load from Folder (Batch Upload)" button
   - In the file picker dialog, navigate to the `user-uploads/` folder
   - Select all images you want to use (Ctrl+A or Cmd+A to select all)
   - Click "Open" to upload
   - The game will automatically create matching pairs from your images

**Note:** The `user-uploads/` folder is for organizing your images in one place. The batch upload button opens a standard browser file picker - you'll need to navigate to this folder and select the images you want to use.

### Method 2: Individual Upload via Browser

1. Open the game in your browser
2. Click "Customize Images" button
3. Switch to "Use Custom Images" mode
4. Click "Add Image Pair" to add individual images
5. Upload images one by one using the upload button

## 📝 Image Guidelines

### Recommended Specifications
- **Format**: PNG, JPG, GIF, or WebP
- **Dimensions**: 100x100 pixels (square images work best)
- **File Size**: Under 500KB per image
- **Quantity**: At least 8 different images recommended for variety

### Tips for Best Results
- Use clear, high-contrast images that are easy to distinguish
- Square images (1:1 aspect ratio) display best in the game
- Avoid overly complex or similar-looking images
- Use images with distinct colors and shapes for easier matching

## 🎮 Game Behavior

- The game board contains **40 pairs** (80 tiles total)
- If you provide **fewer than 40 unique images**, some images will repeat on the board
- If you provide **8 images**, you'll have 5 instances of each image
- For best variety, upload **15-40 unique images**

## 🔧 Technical Details

Images are stored in:
1. **Local Folder** (`user-uploads/`): A convenient location to organize your images before uploading. The game uses a standard browser file picker to select images from this folder (or any other location on your computer).
2. **Browser Storage**: Once uploaded, images are saved in your browser's localStorage (browser-specific, ~5MB limit total).

## 📦 Example Setup

```bash
custom-images/user-uploads/
├── animal-cat.png
├── animal-dog.png
├── fruit-apple.png
├── fruit-banana.png
├── sports-ball.png
├── sports-racket.png
├── music-guitar.png
├── music-piano.png
└── ... (add more images)
```

## 🚀 Quick Start

1. Copy 8-15 of your favorite images into `user-uploads/`
2. Open the game (index.html)
3. Click "Customize Images"
4. Click "Load from Folder"
5. Select your images
6. Click "Save & Apply"
7. Click "New Game" to start playing with your custom images!

Enjoy your personalized Connect the Dots game! 🎉
