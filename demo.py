#!/usr/bin/env python3
"""
AI Shopping Assistant Demo Script

This script demonstrates the API functionality by making sample requests
to the backend endpoints.
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_api_endpoint(endpoint, method="GET", data=None):
    """Test an API endpoint and print the response"""
    try:
        url = f"{BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url)
        
        print(f"\n{'='*60}")
        print(f"Testing: {method} {endpoint}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Could not connect to {BASE_URL}")
        print("Make sure the backend server is running!")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

def main():
    print("🧪 AI Shopping Assistant API Demo")
    print("=" * 60)
    
    # Test basic endpoints
    endpoints_to_test = [
        ("/", "GET"),
        ("/products", "GET"),
        ("/products/1", "GET"),
        ("/cart", "GET"),
    ]
    
    print("\n🔍 Testing basic endpoints...")
    for endpoint, method in endpoints_to_test:
        if not test_api_endpoint(endpoint, method):
            return
        time.sleep(0.5)
    
    # Test adding to cart
    print("\n🛒 Testing cart functionality...")
    test_api_endpoint("/cart/add", "POST", {"product_id": 1, "quantity": 2})
    time.sleep(0.5)
    test_api_endpoint("/cart", "GET")
    
    # Test search
    print("\n🔍 Testing search functionality...")
    test_api_endpoint("/search", "POST", {"query": "headphones"})
    
    # Test AI chat (might fail without OpenAI API key)
    print("\n🤖 Testing AI chat...")
    test_api_endpoint("/ai/chat", "POST", {"message": "Hello, can you help me find a good laptop?"})
    
    # Test AI recommendations (might fail without OpenAI API key)
    print("\n📝 Testing AI recommendations...")
    test_api_endpoint("/ai/recommendations", "POST", {"preferences": "electronics"})
    
    print("\n✅ Demo completed!")
    print("\n💡 Tips:")
    print("- Add your OpenAI API key to .env for AI features to work properly")
    print("- Visit http://localhost:8000/docs for interactive API documentation")
    print("- Visit http://localhost:3000 for the web interface")

if __name__ == "__main__":
    main()