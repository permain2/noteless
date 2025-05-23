# Supabase Migration Instructions

This directory contains SQL migrations for the Supabase database.

## Applying Migrations

To apply the migrations to your Supabase project:

1. Log in to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Navigate to the SQL Editor (in the left sidebar)
4. Create a new query
5. Paste the contents of the SQL file (e.g., `create_profiles_table.sql`)
6. Click "Run" to execute the query

## Important Notes

- These migrations include creation of tables, policies, and triggers
- Migrations use `IF NOT EXISTS` where appropriate to avoid errors if structures already exist
- The `profiles` table is designed to store user profile information and is linked to Supabase Auth users
- Row Level Security (RLS) is enabled to ensure users can only access their own data

## Profiles Table

The `profiles` table includes:

- `id`: UUID (primary key, references auth.users)
- `email`: TEXT (user's email)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP
- `display_name`: TEXT (optional)
- `avatar_url`: TEXT (optional)

The migration also sets up a trigger that automatically creates a profile record when a new user signs up via Supabase Auth. 