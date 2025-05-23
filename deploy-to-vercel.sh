#!/bin/bash

# Exit on error
set -e

echo "Deploying to Vercel..."

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Ensure we're logged in
echo "Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy to production
echo "Deploying to Vercel production environment..."
vercel --prod

echo "Deployment complete!" 