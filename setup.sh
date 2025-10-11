#!/bin/bash

echo "Setting up Upwork Proposal Chatbot..."
echo

echo "Installing server dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error installing server dependencies"
    exit 1
fi

echo
echo "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "Error installing client dependencies"
    exit 1
fi
cd ..

echo
echo "Setup complete!"
echo
echo "IMPORTANT: Create a .env file in the root directory with your OpenAI API key:"
echo "OPENAI_API_KEY=your_openai_api_key_here"
echo "PORT=5000"
echo
echo "To start the application:"
echo "npm run dev"
echo
echo "The app will be available at:"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo
