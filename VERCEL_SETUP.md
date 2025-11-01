# Vercel Deployment Setup Guide

## Setting the API Key in Vercel

Your chatbot requires the OpenRouter API key to be set as an environment variable in Vercel.

### Steps to Set the API Key:

1. **Go to your Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project (UW chatbot)

2. **Navigate to Settings**
   - Click on your project
   - Go to "Settings" in the top navigation
   - Click on "Environment Variables" in the sidebar

3. **Add the Environment Variable**
   - Click "Add New"
   - **Variable Name**: `OPENROUTER_API_KEY`
   - **Value**: `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`
   - **Environment**: Select all (Production, Preview, Development)
   - Click "Save"

4. **Redeploy Your Application**
   - After adding the environment variable, go to the "Deployments" tab
   - Click the three dots (⋯) on your latest deployment
   - Select "Redeploy"
   - Make sure "Use existing Build Cache" is unchecked if you want a fresh build

### Alternative: Using Vercel CLI

You can also set the environment variable using Vercel CLI:

```bash
vercel env add OPENROUTER_API_KEY
```

When prompted, enter: `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`

Then select all environments (Production, Preview, Development).

### Verifying the Setup

After redeploying, you can verify the API key is working by:

1. Visiting your deployed site
2. Opening the browser console (F12)
3. Trying to generate a proposal
4. Checking the Network tab for any API errors

If you see errors related to API key, double-check that:
- The environment variable name is exactly `OPENROUTER_API_KEY` (case-sensitive)
- The value matches exactly (no extra spaces)
- You've redeployed after setting the variable

## Local Development

For local development, create a `.env` file in the root directory:

```
OPENROUTER_API_KEY=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
PORT=5000
```

**Note**: Never commit the `.env` file to git. It's already in `.gitignore`.

