# 🚀 Vercel Deployment Quick Fix Guide

## ⚠️ CRITICAL: Set API Key in Vercel Dashboard

Your chatbot **WILL NOT WORK** until you set the API key in Vercel's environment variables.

### Step-by-Step Instructions:

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select your project: **UW chatbot** (or your project name)

2. **Go to Settings**
   - Click on **Settings** tab
   - In the left sidebar, click **Environment Variables**

3. **Add Environment Variable**
   - Click **Add New** button
   - **Key**: `OPENROUTER_API_KEY`
   - **Value**: `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`
   - **Environment**: Select **ALL THREE** checkboxes:
     - ☑ Production
     - ☑ Preview  
     - ☑ Development
   - Click **Save**

4. **Redeploy Your Application**
   - Go to **Deployments** tab
   - Find your latest deployment
   - Click the **three dots** (⋯) menu
   - Click **Redeploy**
   - ⚠️ **IMPORTANT**: Uncheck "Use existing Build Cache" for a fresh build
   - Click **Redeploy**

5. **Verify It Works**
   - Wait for deployment to complete (usually 1-2 minutes)
   - Visit your deployed site
   - Try generating a proposal
   - If it still doesn't work, check the browser console (F12) for errors

### Alternative: Using Vercel CLI

If you have Vercel CLI installed:

```bash
# Login to Vercel (if not already)
vercel login

# Add the environment variable
vercel env add OPENROUTER_API_KEY
```

When prompted:
- **Value**: `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`
- **Environments**: Select all (Production, Preview, Development)

Then redeploy:
```bash
vercel --prod
```

## 🔍 Testing the API Key

After setting the environment variable and redeploying, you can test if it's working:

1. Visit: `https://your-site.vercel.app/api/test-env`
2. You should see JSON response with:
   ```json
   {
     "hasApiKey": true,
     "apiKeyLength": 72,
     "vercel": true,
     "openrouterKeyFound": true
   }
   ```

If `hasApiKey` is `false`, the environment variable is not set correctly.

## ❌ Common Issues

### Issue: "Failed to generate proposals. Please check your API key."

**Solution**: The API key is not set in Vercel. Follow the steps above to add it.

### Issue: API key is set but still not working

**Solutions**:
1. Make sure you **redeployed** after adding the environment variable
2. Check that you selected **ALL** environments (Production, Preview, Development)
3. Verify the environment variable name is exactly: `OPENROUTER_API_KEY` (case-sensitive)
4. Check for extra spaces in the value
5. Visit `/api/test-env` to see diagnostic information

### Issue: Works locally but not on Vercel

**Solution**: Local `.env` file doesn't work on Vercel. You MUST set it in Vercel Dashboard.

## 📝 Notes

- ⚠️ **Never commit `.env` files to git** - they're already in `.gitignore`
- The API key must be set separately in Vercel for each deployment
- Environment variables are injected at build/runtime on Vercel
- Each redeploy uses the latest environment variables

---

## 🎯 Quick Checklist

- [ ] Set `OPENROUTER_API_KEY` in Vercel Dashboard
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Redeployed the application
- [ ] Tested with `/api/test-env`
- [ ] Verified proposals generate successfully

Once all checkboxes are complete, your chatbot should work! 🎉

