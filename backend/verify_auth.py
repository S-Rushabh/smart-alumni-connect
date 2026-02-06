import requests
import sys

# Try default uvicorn port
BASE_URL = "http://127.0.0.1:8000"

def test_auth():
    # Register
    email = "verify_test@example.com"
    password = "Password123!"
    register_data = {
        "email": email,
        "password": password,
        "full_name": "Verification User",
        "role": "student"
    }
    
    print(f"Attempting to connect to {BASE_URL}...")
    
    try:
        # First check if server is up
        r = requests.get(f"{BASE_URL}/")
        print(f"Root endpoint status: {r.status_code}")
    except Exception as e:
        print(f"Could not connect to server at {BASE_URL}. Is it running?")
        print(e)
        return

    print("\nTesting Register...")
    try:
        r = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
        if r.status_code == 200:
            print("Register Success:", r.json())
        elif r.status_code == 400 and "already exists" in r.text:
            print("User already exists, proceeding to login.")
        else:
            print("Register Failed:", r.status_code, r.text)
            # If register failed (not bc of existence), stop? No, try login anyway maybe.
    except Exception as e:
        print("Register request failed:", e)

    # Login
    print("\nTesting Login...")
    login_data = {
        "username": email,
        "password": password
    }
    try:
        r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
        if r.status_code == 200:
            print("Login Success! Token received.")
            print("Token Type:", r.json().get("token_type"))
            # print("Access Token:", r.json().get("access_token")) # Don't print full token
        else:
            print("Login Failed:", r.status_code, r.text)
    except Exception as e:
        print("Login request failed:", e)

if __name__ == "__main__":
    test_auth()
