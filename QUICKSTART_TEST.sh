#!/bin/bash

# ==========================================
# EDGE FUNCTION DEPLOYMENT & TEST SCRIPT
# ==========================================
# Run this script to deploy and test the check-prices edge function
# Usage: bash QUICKSTART_TEST.sh

set -e  # Exit on error

echo "🚀 PurrView Edge Function Deployment & Test"
echo "==========================================="
echo ""

# Step 1: Deploy
echo "📦 Step 1: Deploying edge function to Supabase..."
supabase functions deploy check-prices

echo ""
echo "✅ Function deployed successfully!"
echo ""

# Step 2: Get API Keys
echo "🔑 Step 2: Getting your API credentials..."
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "1. Open Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Go to Settings → API"
echo "4. Copy your credentials below:"
echo ""
read -p "Enter your PROJECT_URL (e.g., https://your-id.supabase.co): " PROJECT_URL
read -p "Enter your ANON_KEY: " ANON_KEY

echo ""
echo "🧪 Step 3: Testing the edge function..."
echo ""

# Test the function
RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/check-prices" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Response:"
echo "$RESPONSE" | jq '.' || echo "$RESPONSE"

echo ""
echo "==========================================="
echo "✅ Test Complete!"
echo "==========================================="
echo ""
echo "Next steps:"
echo "1. Check Supabase Dashboard → SQL Editor"
echo "2. Run: SELECT * FROM price_alerts ORDER BY created_at DESC LIMIT 5;"
echo "3. Verify alerts were created"
echo ""
echo "Then continue with Phase 7.3: Build notification UI"
