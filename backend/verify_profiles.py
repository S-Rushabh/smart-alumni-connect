import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_profiles():
    # Login to get token
    email = "verify_test@example.com"
    password = "Password123!"
    
    print("\n--- Testing Profiles ---")
    print("Logging in...")
    login_data = {"username": email, "password": password}
    
    # Try logging in, if fail, try registering first
    token = None
    try:
        r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
        if r.status_code == 200:
            token = r.json().get("access_token")
        else:
            print("Login failed, attempting register first...")
            register_data = {"email": email, "password": password, "full_name": "Profile Test User"}
            requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
            r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
            if r.status_code == 200:
                token = r.json().get("access_token")

    except Exception as e:
        print("Connection failed:", e)
        return

    if not token:
        print("Could not get auth token. Aborting.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get Me (initial empty/auto-created)
    print("\n1. GET /me (Initial)")
    r = requests.get(f"{BASE_URL}/api/v1/profiles/me", headers=headers)
    print(f"Status: {r.status_code}")
    print(r.json())
    user_id = r.json().get("user_id")

    # 2. Update Me
    print("\n2. PUT /me (Update Bio)")
    update_data = {
        "bio": "I am a software engineer participating in a hackathon.",
        "department": "Computer Science",
        "location": "New York"
    }
    r = requests.put(f"{BASE_URL}/api/v1/profiles/me", headers=headers, json=update_data)
    print(f"Status: {r.status_code}")
    print(r.json())

    # 3. Get By ID
    if user_id:
        print(f"\n3. GET /{user_id} (Public view)")
        r = requests.get(f"{BASE_URL}/api/v1/profiles/{user_id}", headers=headers)
        print(f"Status: {r.status_code}")
        print(r.json())

if __name__ == "__main__":
    test_profiles()
