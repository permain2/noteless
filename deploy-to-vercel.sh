#!/bin/bash

# Load the Vercel token
VERCEL_TOKEN=$(cat .vercel-token | cut -d'=' -f2)

# Ensure we have a valid token
if [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: No Vercel token found. Please create a .vercel-token file with content: VERCEL_TOKEN=your_token_here"
  exit 1
fi

# Display status
echo "Deploying to Vercel..."

# Run the deployment command
npx vercel deploy --token $VERCEL_TOKEN --prod

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
else
  echo "❌ Deployment failed. Please check the logs above for details."
  echo "You can also try deploying directly from the Vercel dashboard:"
  echo "1. Go to https://vercel.com/ecomquiz/noteless"
  echo "2. Connect your GitHub repository"
  echo "3. Deploy the user-registration-fix branch"
fi 