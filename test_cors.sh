#!/bin/bash

echo "Testing CORS Configuration"
echo "=========================="
echo ""

# Test 1: Simple GET request
echo "Test 1: GET /api/health"
curl -v http://localhost:5001/api/health 2>&1 | grep -i "access-control"
echo ""

# Test 2: OPTIONS preflight request
echo "Test 2: OPTIONS preflight for /api/auth/register"
curl -v -X OPTIONS \
  -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  http://localhost:5001/api/auth/register 2>&1 | grep -i "access-control"
echo ""

# Test 3: POST request with Origin header
echo "Test 3: POST /api/auth/test with Origin header"
curl -v -X GET \
  -H "Origin: http://example.com" \
  -H "Content-Type: application/json" \
  http://localhost:5001/api/auth/test 2>&1 | grep -i "access-control"
echo ""

echo "=========================="
echo "CORS Test Complete"
echo ""
echo "Expected headers:"
echo "  - Access-Control-Allow-Origin: *"
echo "  - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH"
echo "  - Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With"
