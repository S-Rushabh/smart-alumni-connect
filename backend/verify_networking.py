import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def get_token(email, password, name):
    print(f"getting token for {email}...")
    login_data = {"username": email, "password": password}
    r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    if r.status_code == 200:
        return r.json().get("access_token"), r.json().get("token_type")
    
    # Try register if login fails
    print(f"Login failed, registering {email}...")
    register_data = {"email": email, "password": password, "full_name": name}
    r = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    if r.status_code not in [200, 400]: # 400 is fine if exists but login failed implies maybe password mismatch?
        print(f"Register failed: {r.text}")
        return None, None
        
    # Login again
    r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    if r.status_code == 200:
        return r.json().get("access_token"), r.json().get("token_type")
    return None, None

def test_networking():
    print("\n--- Testing Networking ---")
    
    # 1. Create User A (Alice) and User B (Bob)
    token_a, _ = get_token("alice@example.com", "Password123!", "Alice Alum")
    token_b, _ = get_token("bob@example.com", "Password123!", "Bob Builder")
    
    if not token_a or not token_b:
        print("Failed to get tokens for test users.")
        return

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Setup Profiles first (needed for search)
    requests.get(f"{BASE_URL}/api/v1/profiles/me", headers=headers_a)
    requests.get(f"{BASE_URL}/api/v1/profiles/me", headers=headers_b)

    # 2. Search for Bob (as Alice)
    print("\n1. Alice searches for 'Bob'")
    r = requests.get(f"{BASE_URL}/api/v1/networking/search?q=Bob", headers=headers_a)
    print(f"Status: {r.status_code}")
    results = r.json()
    print(f"Found: {len(results)}")
    
    bob_id = None
    for p in results:
        if "Bob" in p['full_name']:
            bob_id = p['user_id']
            break
            
    if not bob_id:
        print("Could not find Bob's ID from search. Aborting.")
        # Try to guess ID? No, endpoint depends on it. 
        # Attempt to get Bob's ID from his profile view (Need to implement GET /me returning ID... it does)
        r = requests.get(f"{BASE_URL}/api/v1/profiles/me", headers=headers_b)
        bob_id = r.json()['user_id']
        print(f"Got Bob's ID directly: {bob_id}")

    # 3. Request Connection (Alice -> Bob)
    print(f"\n2. Alice sends request to Bob ({bob_id})")
    r = requests.post(f"{BASE_URL}/api/v1/networking/connect/{bob_id}", headers=headers_a)
    print(f"Status: {r.status_code}")
    print(r.text)
    
    # 4. List Received Requests (Bob)
    print("\n3. Bob checks received requests")
    r = requests.get(f"{BASE_URL}/api/v1/networking/requests/received", headers=headers_b)
    print(f"Status: {r.status_code}")
    requests_list = r.json()
    print(f"Pending Requests: {len(requests_list)}")
    
    if len(requests_list) == 0:
        print("No requests found. Maybe already connected?")
        return

    request_id = requests_list[0]['id']

    # 5. Accept Request (Bob)
    print(f"\n4. Bob accepts request ({request_id})")
    update_data = {"status": "accepted"}
    r = requests.put(f"{BASE_URL}/api/v1/networking/connect/{request_id}", headers=headers_b, json=update_data)
    print(f"Status: {r.status_code}")
    print(r.json())

    # 6. Verify Connection List (Alice)
    print("\n5. Alice checks connections")
    r = requests.get(f"{BASE_URL}/api/v1/networking/connections", headers=headers_a)
    print(f"Status: {r.status_code}")
    print(r.json())

if __name__ == "__main__":
    test_networking()
