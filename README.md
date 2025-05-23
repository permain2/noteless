# Noteless Web App

A note-taking web application built with React and Supabase.

## Setup

1. Clone the repository
2. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your-supabase-url-here
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```

## Deploying to Vercel

### Option 1: Deploy with the Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Configure environment variables on Vercel:
   ```
   vercel env add REACT_APP_SUPABASE_URL
   vercel env add REACT_APP_SUPABASE_ANON_KEY
   ```

4. Deploy:
   ```
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to a GitHub, GitLab, or Bitbucket repository.

2. Visit [vercel.com](https://vercel.com) and log in or sign up.

3. Click "Import Project" and select your repository.

4. Configure the project:
   - Framework Preset: Create React App
   - Environment Variables: 
     - `REACT_APP_SUPABASE_URL`: Your Supabase URL
     - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key

5. Click "Deploy" and wait for the deployment to complete.

## Environment Variables on Vercel

For secure storage of environment variables:

1. Create the environment secrets in the Vercel dashboard:
   ```
   vercel secrets add supabase_url "your-supabase-url-here"
   vercel secrets add supabase_anon_key "your-supabase-anon-key-here"
   ```

2. The `vercel.json` file is already configured to use these secrets as environment variables.

## Project Structure

- `public/` - Static assets
- `src/` - Source code
  - `screens/` - App screens (auth, home, etc.)
  - `components/` - Reusable UI components
  - `supabaseClient.js` - Supabase client configuration

## Troubleshooting

If you encounter build issues on Vercel:

1. Check the build logs for specific errors
2. Ensure all dependencies are correctly installed
3. Verify environment variables are correctly set
4. Check if Vercel's Create React App framework is correctly detecting your app

## User Registration Fix

This branch includes fixes for user registration:

1. Automatic profile creation using a Supabase database trigger
2. Improved error handling and user feedback
3. Fixed deployment configuration

## Supabase Migration

The migration has already been applied to the Supabase database.

The migration creates:
1. A `profiles` table linked to Supabase Auth users
2. Row Level Security (RLS) policies for access control 
3. An automatic trigger to create profiles when new users register 