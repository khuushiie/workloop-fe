#!/bin/bash

# HRMS Frontend Deployment Script
# Usage: ./deploy.sh

set -e

DEPLOY_PATH="/var/www/HRMS_Final_FE"
APP_DIR="$HOME/HRMS_Final_FE"

echo " Deploying HRMS Frontend..."

# Navigate to app directory
cd "$APP_DIR"

# Pull latest code
echo "Pulling latest code..."
git pull origin dev

# Install dependencies
echo " Installing dependencies..."
npm ci

# Build
echo " Building application..."
npm run build

# Deploy to nginx directory
echo "Deploying to $DEPLOY_PATH..."
sudo mkdir -p "$DEPLOY_PATH"
sudo rm -rf "$DEPLOY_PATH/dist"
sudo cp -r dist "$DEPLOY_PATH/"
sudo chown -R www-data:www-data "$DEPLOY_PATH/dist"

# Reload nginx
echo "Reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo " Frontend deployed successfully!"
echo "   Serving from: $DEPLOY_PATH/dist"
