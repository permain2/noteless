# Noteless App

A note-taking application with Supabase authentication and database integration.

## User Registration Fix

This branch includes fixes for user registration:

1. Automatic profile creation using a Supabase database trigger
2. Improved error handling and user feedback
3. Fixed deployment configuration

## Deployment Instructions

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Select the `user-registration-fix` branch
5. Configure the following settings:
   - Framework Preset: Create React App
   - Build Command: `npm install && npx expo export -p web`
   - Output Directory: `dist`
6. Add environment variables:
   - `EXPO_PUBLIC_SUPABASE_URL`: `https://yvbfwlschpufqihnaldt.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YmZ3bHNjaHB1ZnFpaG5hbGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY0MDI4MzIsImV4cCI6MjAzMTk3ODgzMn0.9hIPtA0ILVBHaGq84I9U3igxQ-1uWECm1mJICd_sBW8`
7. Click "Deploy"

### Option 2: Deploy via Script

Make the script executable:

```bash
chmod +x deploy-to-vercel.sh
```

Run the deployment script:

```bash
./deploy-to-vercel.sh
```

## Supabase Migration

The migration has already been applied to the Supabase database.

The migration creates:
1. A `profiles` table linked to Supabase Auth users
2. Row Level Security (RLS) policies for access control 
3. An automatic trigger to create profiles when new users register 