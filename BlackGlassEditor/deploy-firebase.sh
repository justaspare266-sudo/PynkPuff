#!/bin/bash

# Firebase deployment script for Master Image Editor
echo "🔥 Deploying Master Image Editor to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Please login to Firebase:"
    firebase login
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your image editor is now live on Firebase Hosting"
    echo "📝 Update NEXT_PUBLIC_IMAGE_EDITOR_URL in your main app with the Firebase URL"
else
    echo "❌ Deployment failed!"
    exit 1
fi
