#!/bin/bash
# Create placeholder PNG icons (will need real icons for production)
# Using ImageMagick to create simple colored squares as placeholders

if command -v convert >/dev/null 2>&1; then
  # Create icons with ImageMagick
  convert -size 32x32 xc:#2563eb PNG32:32x32.png
  convert -size 128x128 xc:#2563eb PNG32:128x128.png
  convert -size 256x256 xc:#2563eb PNG32:128x128@2x.png
  convert -size 512x512 xc:#2563eb PNG32:icon.png
  echo "Icons created successfully"
else
  echo "ImageMagick not found. Creating placeholder files..."
  # Create empty placeholder files
  touch 32x32.png 128x128.png 128x128@2x.png icon.png icon.icns icon.ico
fi
