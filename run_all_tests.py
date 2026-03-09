"""
Comprehensive Test Runner
Runs all tests and generates report
"""

import subprocess
import sys
import json
from datetime import datetime

def run_command(cmd, description):
    """Run a command and return result"""
    print(f"\n{'='*60}")
    print(f"🧪 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🚀 COMPREHENSIVE TEST SUITE")
    print("="*60)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {}
    
    # 1. Unit Tests
    results['unit_tests'] = run_command(
        'python -m pytest tests/test_validators.py tests/test_models.py -v',
        "Unit Tests (Validators & Models)"
    )
    
    # 2. Integration Tests
    results['integration_tests'] = run_command(
        'python -m pytest tests/test_auth.py tests/test_api_endpoints.py -v',
        "Integration Tests (API Endpoints)"
    )
    
    # 3. Coverage Report
    results['coverage'] = run_command(
        'python -m pytest tests/ --cov=. --cov-report=term-missing --cov-report=html',
        "Test Coverage Analysis"
    )
    
    # 4. API Health Check
    results['health_check'] = run_command(
        'curl -s http://127.0.0.1:5000/api/health',
        "API Health Check"
    )
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✅ PASSED" if passed_test else "❌ FAILED"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nTotal: {passed}/{total} test suites passed")
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return 0 if passed == total else 1

if __name__ == '__main__':
    sys.exit(main())
