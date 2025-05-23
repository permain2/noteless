#!/bin/bash
set -e

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the React app
echo "Building React app..."
npm run build

echo "Build completed successfully!" 