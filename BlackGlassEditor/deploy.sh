#!/bin/bash

# Deployment script for Master Image Editor
# This script builds and prepares the app for deployment to a separate domain

echo "🚀 Building Master Image Editor for separate deployment..."

# Build the application
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Built files are in the 'dist' directory"
    echo ""
    echo "🌐 Next steps:"
    echo "1. Deploy the 'dist' folder to your hosting service"
    echo "2. Set up a custom domain (e.g., editor.yoursite.com)"
    echo "3. Update NEXT_PUBLIC_IMAGE_EDITOR_URL in your main app"
    echo ""
    echo "📋 Deployment options:"
    echo "   • Vercel: Connect repo, set root to tools/master-image-editor"
    echo "   • Netlify: Connect repo, set base to tools/master-image-editor"
    echo "   • GitHub Pages: Deploy dist folder"
    echo "   • Any static host: Upload dist folder"
else
    echo "❌ Build failed!"
    exit 1
fi
