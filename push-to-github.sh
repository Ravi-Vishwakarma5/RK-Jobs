#!/bin/bash

echo "Pushing code to GitHub..."

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git and try again."
    exit 1
fi

# Check if .git directory exists
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    if [ $? -ne 0 ]; then
        echo "Failed to initialize Git repository."
        exit 1
    fi
fi

# Add all files to Git
echo "Adding files to Git..."
git add .
if [ $? -ne 0 ]; then
    echo "Failed to add files to Git."
    exit 1
fi

# Commit changes
echo "Committing changes..."
git commit -m "Added JWT token authentication and saved jobs functionality"
if [ $? -ne 0 ]; then
    echo "Failed to commit changes."
    exit 1
fi

# Check if remote origin exists
if ! git remote -v | grep -q origin; then
    echo "Remote origin not found. Please enter the GitHub repository URL:"
    read REPO_URL
    git remote add origin $REPO_URL
    if [ $? -ne 0 ]; then
        echo "Failed to add remote origin."
        exit 1
    fi
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin master
if [ $? -ne 0 ]; then
    echo "Failed to push to GitHub. Trying main branch..."
    git push -u origin main
    if [ $? -ne 0 ]; then
        echo "Failed to push to GitHub. Please check your credentials and try again."
        exit 1
    fi
fi

echo "Successfully pushed to GitHub!"
