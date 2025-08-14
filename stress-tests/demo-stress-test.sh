#!/bin/bash

# Quick Demo of EZ-GEN Stress Test
# This script demonstrates how to start EZ-GEN and run stress tests

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🎬 EZ-GEN Stress Test Demo${NC}"
echo "================================="

echo -e "\n${YELLOW}📋 Demo Steps:${NC}"
echo "1. Start EZ-GEN server (if not running)"
echo "2. Run a quick stress test"
echo "3. Show results"

# Check if server is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "\n${GREEN}✅ EZ-GEN server is already running!${NC}"
else
    echo -e "\n${YELLOW}⚠️  EZ-GEN server is not running.${NC}"
    echo "Please start it first with one of these commands:"
    echo ""
    echo -e "${BLUE}Option 1 - Direct start:${NC}"
    echo "   cd .. && npm start"
    echo ""
    echo -e "${BLUE}Option 2 - Docker:${NC}"
    echo "   cd ../docker && ./test-docker.sh start"
    echo ""
    read -p "$(echo -e ${YELLOW}"Press Enter when server is running..."${NC})" 
fi

# Verify server is now running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is still not accessible. Please check and try again.${NC}"
    exit 1
fi

echo -e "\n${GREEN}🚀 Running demo stress test...${NC}"
echo -e "${BLUE}This will test 3 users for 15 seconds with various scenarios${NC}"

# Run a quick demo test
node stress-test.js --users 3 --duration 15 --log-level INFO

echo -e "\n${GREEN}🎉 Demo completed!${NC}"
echo -e "${BLUE}Check the 'results' folder for detailed reports.${NC}"
echo ""
echo -e "${YELLOW}📖 Next Steps:${NC}"
echo "• Run full test: ./run-stress-test.sh"
echo "• Read docs: cat STRESS-TEST-README.md"
echo "• Custom test: node stress-test.js --users 10 --duration 60"
