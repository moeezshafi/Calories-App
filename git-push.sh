#!/bin/bash

# Git Push Helper Script
# This script helps you commit and push changes to Git

set -e

echo "🔄 Git Push Helper"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Git repository not initialized. Initializing..."
    git init
    echo "✓ Git initialized"
    echo ""
    echo "Please set up your remote repository:"
    echo "  git remote add origin <your-repository-url>"
    echo ""
    read -p "Enter your repository URL: " repo_url
    git remote add origin "$repo_url"
    echo "✓ Remote added"
fi

# Show current status
echo "Current status:"
git status --short
echo ""

# Ask for commit message
read -p "Enter commit message: " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Using default message: $commit_msg"
fi

# Add all changes
echo "Adding changes..."
git add .

# Commit
echo "Committing..."
git commit -m "$commit_msg"

# Ask which branch to push to
read -p "Enter branch name (default: main): " branch
branch=${branch:-main}

# Push
echo "Pushing to $branch..."
git push origin "$branch"

echo ""
echo "✓ Successfully pushed to $branch"
echo ""
