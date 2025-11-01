const express = require('express');
const cors = require('cors');
const axios = require('axios');
// Only load dotenv in development - Vercel provides env vars automatically
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Function to get API key (check dynamically for Vercel compatibility)
function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    console.error('ERROR: OPENROUTER_API_KEY environment variable is missing or empty');
    console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('API') || key.includes('KEY')));
  }
  return key;
}

// Initialize OpenRouter API - check at startup for logging
const apiKey = getApiKey();
console.log('API Key Status:', apiKey ? `Found (${apiKey.length} chars)` : 'Missing');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('VERCEL:', process.env.VERCEL ? 'Yes' : 'No');
console.log('VERCEL_URL:', process.env.VERCEL_URL || 'Not set');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'mistralai/mistral-7b-instruct:free';

// Middleware - CORS for all origins in production
app.use(cors({
  origin: '*', // Allow all origins for Vercel deployment
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from React build
app.use(express.static('client/build'));

// Test endpoint to check environment variables
app.get('/api/test-env', (req, res) => {
  const currentApiKey = getApiKey();
  res.json({
    hasApiKey: !!currentApiKey,
    environment: process.env.NODE_ENV || 'development',
    apiKeyLength: currentApiKey ? currentApiKey.length : 0,
    vercel: !!process.env.VERCEL,
    vercelUrl: process.env.VERCEL_URL || 'Not set',
    allApiEnvVars: Object.keys(process.env).filter(key => key.includes('API') || key.includes('KEY')),
    openrouterKeyFound: !!process.env.OPENROUTER_API_KEY
  });
});

// API endpoint to generate proposals
app.post('/api/generate-proposals', async (req, res) => {
  console.log('POST /api/generate-proposals - Request received');
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  console.log('Request url:', req.url);
  console.log('Request body:', req.body);
  
  try {
    const { projectDescription, templateType = 'default' } = req.body;

    if (!projectDescription) {
      return res.status(400).json({ error: 'Project description is required' });
    }

    // Check API key dynamically at request time
    const requestApiKey = getApiKey();
    if (!requestApiKey) {
      console.error('API Key missing in request handler');
      console.error('All environment variables:', Object.keys(process.env).sort());
      return res.status(500).json({ 
        error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in Vercel environment variables.',
        hint: 'Go to Vercel Dashboard > Settings > Environment Variables and add OPENROUTER_API_KEY'
      });
    }

    // Use the specific templates provided
    const templates = [
      {
        id: 1,
        title: "Template 1 - WordPress & Elementor Expert",
        content: `Hi {client_name},

I can refine your {project_type} page to make it visually polished and fully optimized. With my expertise in WordPress and Elementor, I'll ensure it's mobile-friendly, clean, and user-focused.

I have 3+ years of experience in WordPress design and layout fixes. Here are some examples of my work:
- https://www.littlefishproperties.com.au/
- https://nectarnexusllc.com/
- https://pageloot.com/

Would you like to share your preferred layout and flow? I'd love to discuss your ideas!

Best,
{your_name}`
      },
      {
        id: 2,
        title: "Template 2 - Design Consistency Specialist",
        content: `Hi {client_name},

I've reviewed your description and I'm confident I can update your webpages to match the new homepage design using WordPress and Elementor.

Here are some sites I recently built with Elementor:
- https://kidcityacademy.net
- https://mstssolutions.com

I'm available to start immediately and ensure your site looks consistent and professional.

Cheers,
{your_name}`
      },
      {
        id: 3,
        title: "Template 3 - Technical Setup Expert",
        content: `Hi {client_name},

I can help you install the SSL certificate and connect Google Suite to your domain name right away. I'll ensure everything is configured correctly and securely.

If you'd like, we can get started immediately.

Cheers,
{your_name}`
      }
    ];

    // Extract client name and project type from description
    const clientName = extractClientName(projectDescription);
    const projectType = extractProjectType(projectDescription);
    const yourName = "Your Name"; // This can be customized

    let processedTemplates;

           if (templateType === 'default') {
             // Use AI to customize the templates based on project description
             const customizationPrompt = `
You are an expert freelancer on Upwork. I have 3 predefined proposal templates, and I need you to customize each one based on the specific project description provided.

Project Description:
${projectDescription}

Here are the 3 templates to customize:

Template 1 - WordPress & Elementor Expert:
"Hi {client_name},

I can refine your {project_type} page to make it visually polished and fully optimized. With my expertise in WordPress and Elementor, I'll ensure it's mobile-friendly, clean, and user-focused.

I have 3+ years of experience in WordPress design and layout fixes. Here are some examples of my work:
- https://www.littlefishproperties.com.au/
- https://nectarnexusllc.com/
- https://pageloot.com/

Would you like to share your preferred layout and flow? I'd love to discuss your ideas!

Best,
{your_name}"

Template 2 - Design Consistency Specialist:
"Hi {client_name},

I've reviewed your description and I'm confident I can update your webpages to match the new homepage design using WordPress and Elementor.

Here are some sites I recently built with Elementor:
- https://kidcityacademy.net
- https://mstssolutions.com

I'm available to start immediately and ensure your site looks consistent and professional.

Cheers,
{your_name}"

Template 3 - Technical Setup Expert:
"Hi {client_name},

I can help you install the SSL certificate and connect Google Suite to your domain name right away. I'll ensure everything is configured correctly and securely.

If you'd like, we can get started immediately.

Cheers,
{your_name}"

Please customize each template to specifically address the project description provided. Make the proposals more relevant, specific, and tailored to the client's actual needs. Keep the same structure and tone but adapt the content to match the project requirements.

Format your response as:
CUSTOMIZED TEMPLATE 1:
[content]

CUSTOMIZED TEMPLATE 2:
[content]

CUSTOMIZED TEMPLATE 3:
[content]
`;

             console.log('Making API request to OpenRouter...');
             const refererUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.FRONTEND_URL || 'http://localhost:3000');
             console.log('Using referer:', refererUrl);
             
             const customizationResponse = await axios.post(OPENROUTER_API_URL, {
               model: MODEL,
               messages: [
                 {
                   role: "system",
                   content: "You are an expert freelancer who creates compelling, customized Upwork proposals. Always tailor your proposals to the specific project requirements while maintaining professionalism and demonstrating relevant expertise."
                 },
                 {
                   role: "user",
                   content: customizationPrompt
                 }
               ],
               max_tokens: 2000,
               temperature: 0.7,
             }, {
               headers: {
                 'Authorization': `Bearer ${requestApiKey}`,
                 'Content-Type': 'application/json',
                 'HTTP-Referer': refererUrl,
                 'X-Title': 'Upwork Proposal Generator'
               },
               timeout: 60000 // 60 second timeout
             });
             
             console.log('API response received, status:', customizationResponse.status);

             const customizedContent = customizationResponse.data.choices[0].message.content;
             const customizedTemplates = parseCustomizedTemplates(customizedContent);
             
             processedTemplates = customizedTemplates.map((template, index) => ({
               id: index + 1,
               title: templates[index].title,
               content: template
                 .replace(/{client_name}/g, clientName)
                 .replace(/{project_type}/g, projectType)
                 .replace(/{your_name}/g, yourName)
             }));
           } else {
      // Generate custom AI proposals
      const prompt = `
You are an expert freelancer on Upwork. Based on the following project description, create 3 different proposal variations. Each proposal should be unique in approach, tone, and strategy while being professional and compelling.

Project Description:
${projectDescription}

Please generate 3 proposals with the following structure for each:
1. Opening statement (2-3 sentences)
2. Understanding of the project (2-3 sentences)
3. Your approach/methodology (3-4 sentences)
4. Relevant experience/examples (2-3 sentences)
5. Timeline and deliverables (2-3 sentences)
6. Closing statement (1-2 sentences)

Make each proposal different in:
- Tone (professional, friendly, confident, etc.)
- Approach (technical focus, creative focus, process focus, etc.)
- Experience highlighted (different relevant examples)
- Timeline (different delivery approaches)

Format the response as:
PROPOSAL 1:
[content]

PROPOSAL 2:
[content]

PROPOSAL 3:
[content]
`;

      console.log('Making API request to OpenRouter (custom mode)...');
      const refererUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.FRONTEND_URL || 'http://localhost:3000');
      console.log('Using referer:', refererUrl);
      
      const response = await axios.post(OPENROUTER_API_URL, {
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert freelancer who creates compelling Upwork proposals. Always be professional, specific, and demonstrate clear understanding of client needs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }, {
        headers: {
          'Authorization': `Bearer ${requestApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': refererUrl,
          'X-Title': 'Upwork Proposal Generator'
        },
        timeout: 60000 // 60 second timeout
      });
      
      console.log('API response received, status:', response.status);

      const aiResponse = response.data.choices[0].message.content;
      processedTemplates = parseProposals(aiResponse);
    }

    res.json({
      success: true,
      proposals: processedTemplates,
      message: `Templates generated successfully using ${templateType} mode!`
    });

  } catch (error) {
    console.error('Error generating proposals:', error);
    console.error('Error stack:', error.stack);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    let errorMessage = 'Failed to generate proposals';
    let errorDetails = error.message;
    
    if (error.response) {
      // API responded with error
      errorDetails = `API Error (${error.response.status}): ${error.response.data?.error?.message || error.response.statusText || error.message}`;
      console.error('API Error Response:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      errorDetails = 'No response from API. Please check your API key and network connection.';
    } else {
      // Error setting up request
      errorDetails = error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails,
      type: error.response ? 'api_error' : error.request ? 'network_error' : 'request_error'
    });
  }
});

// Helper function to extract client name from project description
function extractClientName(description) {
  // Look for common patterns like "Hi [name]", "Dear [name]", etc.
  const namePatterns = [
    /(?:hi|hello|dear|hey)\s+([A-Z][a-z]+)/i,
    /client[:\s]+([A-Z][a-z]+)/i,
    /name[:\s]+([A-Z][a-z]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = description.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return "Client"; // Default fallback
}

// Helper function to extract project type from description
function extractProjectType(description) {
  const projectTypes = [
    { keywords: ['website', 'web', 'site'], type: 'website' },
    { keywords: ['wordpress', 'wp'], type: 'WordPress site' },
    { keywords: ['ssl', 'certificate'], type: 'SSL setup' },
    { keywords: ['google', 'suite', 'gmail'], type: 'Google Suite setup' },
    { keywords: ['elementor', 'page builder'], type: 'Elementor page' },
    { keywords: ['design', 'redesign'], type: 'design project' },
    { keywords: ['landing page', 'landing'], type: 'landing page' },
    { keywords: ['ecommerce', 'shop', 'store'], type: 'ecommerce site' }
  ];
  
  const lowerDesc = description.toLowerCase();
  
  for (const { keywords, type } of projectTypes) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return type;
    }
  }
  
  return "project"; // Default fallback
}

// Function to parse customized templates from the response
function parseCustomizedTemplates(response) {
  const templates = [];
  const templateSections = response.split(/CUSTOMIZED TEMPLATE \d+:/i);

  for (let i = 1; i < templateSections.length; i++) {
    const content = templateSections[i].trim();
    if (content) {
      templates.push(content);
    }
  }
  
  // If parsing failed, create a fallback
  if (templates.length === 0) {
    const lines = response.split('\n').filter(line => line.trim());
    const chunkSize = Math.ceil(lines.length / 3);
    
    for (let i = 0; i < 3; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const content = lines.slice(start, end).join('\n').trim();
      if (content) {
        templates.push(content);
      }
    }
  }
  
  return templates;
}

// Function to parse proposals from the response
function parseProposals(response) {
  const proposals = [];
  const proposalSections = response.split(/PROPOSAL \d+:/i);
  
  for (let i = 1; i < proposalSections.length; i++) {
    const content = proposalSections[i].trim();
    if (content) {
      proposals.push({
        id: i,
        title: `Proposal ${i}`,
        content: content
      });
    }
  }
  
  // If parsing failed, create a fallback
  if (proposals.length === 0) {
    const lines = response.split('\n').filter(line => line.trim());
    const chunkSize = Math.ceil(lines.length / 3);
    
    for (let i = 0; i < 3; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, lines.length);
      const content = lines.slice(start, end).join('\n');
      
      proposals.push({
        id: i + 1,
        title: `Proposal ${i + 1}`,
        content: content
      });
    }
  }
  
  return proposals;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile('client/build/index.html', { root: '.' });
});

// For Vercel deployment
// Export the Express app - Vercel will route /api/* requests here
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
    console.log(`OpenRouter API configured: ${apiKey ? 'Yes' : 'No'}`);
    console.log(`Using model: ${MODEL}`);
    if (!apiKey) {
      console.warn('⚠️  WARNING: OPENROUTER_API_KEY not found. Create a .env file with your API key for local development.');
    }
  });
}
