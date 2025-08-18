#!/bin/bash

# Test build script for StayWell Manager
# This script tests the Docker build process locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔨 Testing Docker build for StayWell Manager${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Build the image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t staywell-manager:test .

# Test the image
echo -e "${YELLOW}🧪 Testing the built image...${NC}"
docker run --rm -d --name staywell-test -p 8080:8080 staywell-manager:test

# Wait for the container to start
echo -e "${YELLOW}⏳ Waiting for container to start...${NC}"
sleep 5

# Test health check
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed!${NC}"
    docker logs staywell-test
    docker stop staywell-test
    exit 1
fi

# Test main page
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Main page accessible!${NC}"
else
    echo -e "${RED}❌ Main page not accessible!${NC}"
    docker logs staywell-test
    docker stop staywell-test
    exit 1
fi

# Clean up
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
docker stop staywell-test
docker rmi staywell-manager:test

echo -e "${GREEN}🎉 All tests passed! The Docker build is working correctly.${NC}"
