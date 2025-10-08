#!/bin/bash
# Smoke tests for deployed environments
# Usage: ./scripts/smoke-test.sh <environment-url>

set -e

URL=${1:-"https://dev.roomiorentals.com"}
TIMEOUT=10

echo "🧪 Running smoke tests against: $URL"
echo "=================================="

# Test 1: Check if site is reachable
echo -n "✓ Testing site reachability... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$URL")
if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ PASSED (HTTP $HTTP_CODE)"
else
  echo "❌ FAILED (HTTP $HTTP_CODE)"
  exit 1
fi

# Test 2: Check if HTML is returned
echo -n "✓ Testing HTML content... "
CONTENT=$(curl -s --max-time $TIMEOUT "$URL")
if echo "$CONTENT" | grep -q "<!DOCTYPE html>"; then
  echo "✅ PASSED"
else
  echo "❌ FAILED (No HTML doctype found)"
  exit 1
fi

# Test 3: Check if app title is present
echo -n "✓ Testing app title... "
if echo "$CONTENT" | grep -qi "roomio"; then
  echo "✅ PASSED"
else
  echo "❌ FAILED (App title not found)"
  exit 1
fi

# Test 4: Check SSL certificate (for HTTPS)
if [[ "$URL" == https://* ]]; then
  echo -n "✓ Testing SSL certificate... "
  if curl -s --max-time $TIMEOUT "$URL" > /dev/null 2>&1; then
    echo "✅ PASSED"
  else
    echo "❌ FAILED (SSL error)"
    exit 1
  fi
fi

# Test 5: Check response time
echo -n "✓ Testing response time... "
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "$URL")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
if (( $(echo "$RESPONSE_TIME < 3" | bc -l) )); then
  echo "✅ PASSED (${RESPONSE_MS}ms)"
else
  echo "⚠️  SLOW (${RESPONSE_MS}ms)"
fi

echo ""
echo "=================================="
echo "✅ All smoke tests passed!"
echo "=================================="

