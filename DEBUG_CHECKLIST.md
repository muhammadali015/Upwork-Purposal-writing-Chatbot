# 🔍 Debugging Checklist - Why is the chatbot not working?

## Step 1: Check if API key is set in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Look for `OPENROUTER_API_KEY`
5. **If NOT found**: Follow DEPLOYMENT_GUIDE.md to add it
6. **If found**: Make sure the value is correct: `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`

## Step 2: Check environment variable status

Visit: `https://your-site.vercel.app/api/test-env`

**Expected response if working:**
```json
{
  "hasApiKey": true,
  "apiKeyLength": 72,
  "vercel": true,
  "openrouterKeyFound": true
}
```

**If `hasApiKey` is false:**
- The environment variable is not set
- Go back to Step 1 and add it
- **IMPORTANT**: After adding, you MUST redeploy

## Step 3: Check Vercel deployment logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Check **Build Logs** and **Function Logs**
4. Look for:
   - `API Key Status: Found` ✅
   - `API Key Status: Missing` ❌ (means env var not set)

## Step 4: Test API endpoint directly

Open browser console (F12) and run:
```javascript
fetch('/api/test-env')
  .then(r => r.json())
  .then(console.log)
```

Check if it returns the API key status.

## Step 5: Check browser console for errors

1. Open your deployed site
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Try to generate a proposal
5. Look for errors - they will tell you what's wrong

## Step 6: Check Network requests

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try to generate a proposal
4. Look for the `/api/generate-proposals` request
5. Click on it and check:
   - **Status**: Should be 200 (success) or you'll see error status
   - **Response**: Shows the actual error message

## Step 7: Common Issues and Solutions

### Issue: "API key not configured"
**Solution**: Set `OPENROUTER_API_KEY` in Vercel Dashboard and redeploy

### Issue: "401 Unauthorized" or "403 Forbidden"
**Solution**: 
- Check if API key is correct (no extra spaces)
- Verify API key is still valid
- Check OpenRouter account for any restrictions

### Issue: "Network Error" or "Failed to fetch"
**Solution**:
- Check if `/api/generate-proposals` endpoint is accessible
- Verify CORS is configured correctly
- Check Vercel deployment status

### Issue: API key is set but still not working
**Solution**:
1. Make sure you selected **ALL** environments (Production, Preview, Development)
2. **Redeploy** after adding the environment variable
3. Wait 2-3 minutes for deployment to complete
4. Clear browser cache and try again

## Step 8: Manual API test

Test the API directly using curl or Postman:

```bash
curl -X POST https://your-site.vercel.app/api/generate-proposals \
  -H "Content-Type: application/json" \
  -d '{"projectDescription": "Test project", "templateType": "default"}'
```

This will show you the exact error response from the server.

## Still not working?

1. **Check Vercel Function Logs**: They show server-side errors
2. **Verify API Key**: Make sure it's the correct OpenRouter API key
3. **Check Rate Limits**: OpenRouter might have rate limits
4. **Test Locally**: Run `npm run dev` locally with `.env` file to see if it works

---

## Quick Fix Command (if you have Vercel CLI)

```bash
vercel env add OPENROUTER_API_KEY
# Enter: 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
# Select: Production, Preview, Development (all)
vercel --prod
```

