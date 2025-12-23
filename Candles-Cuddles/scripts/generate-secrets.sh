#!/bin/bash

# Generate secure secrets for deployment
# Usage: ./scripts/generate-secrets.sh

echo "🔐 Generating secure secrets for deployment..."
echo ""
echo "JWT_SECRET:"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo ""
echo "✅ Copy the JWT_SECRET above and add it to your deployment platform's environment variables"
echo ""
echo "💡 Tip: Store all secrets in your deployment platform's environment variables section, never commit them to Git!"

