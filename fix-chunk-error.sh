#!/bin/bash
# Fix chunk loading errors by clearing all caches

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Fixing Chunk Loading Errors...${NC}"

echo "Step 1: Stopping any running dev servers..."
pkill -f "react-scripts start" 2>/dev/null || true
sleep 2

echo "Step 2: Clearing all caches..."
rm -rf build
rm -rf node_modules/.cache
rm -rf .cache
find . -type d -name ".cache" -exec rm -rf {} + 2>/dev/null || true

echo "Step 3: Clearing browser cache recommendation..."
echo -e "${YELLOW}💡 Vui lòng:${NC}"
echo "   - Hard refresh browser: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)"
echo "   - Hoặc clear browser cache"

echo ""
echo -e "${GREEN}✅ Cache cleared!${NC}"
echo ""
echo "🚀 Bây giờ chạy lại:"
echo "   npm start"

