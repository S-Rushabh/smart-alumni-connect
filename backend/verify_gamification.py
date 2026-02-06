import requests

BASE_URL = "http://127.0.0.1:8000"

def get_token(email, password, name):
    login_data = {"username": email, "password": password}
    r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    if r.status_code == 200:
        return r.json().get("access_token")
    
    register_data = {"email": email, "password": password, "full_name": name, "role": "student"}
    requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    
    r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    if r.status_code == 200:
        return r.json().get("access_token")
    return None

def test_gamification():
    print("\n--- Testing Gamification ---")
    
    # 1. Create User (Gamer)
    token = get_token("gamer@example.com", "Password123!", "Pro Gamer")
    if not token:
        print("Failed to get token.")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # Ensure profile created
    requests.get(f"{BASE_URL}/api/v1/profiles/me", headers=headers)

    # 2. Award Points
    print("\n1. Awarding Points")
    r = requests.post(f"{BASE_URL}/api/v1/gamification/award-points", headers=headers, json={"points": 50})
    print(f"Status: {r.status_code}")
    print(r.json())

    # 3. Check Leaderboard
    print("\n2. Checking Leaderboard")
    r = requests.get(f"{BASE_URL}/api/v1/gamification/leaderboard", headers=headers)
    print(f"Status: {r.status_code}")
    leaderboard = r.json()
    for entry in leaderboard:
        print(f"{entry['full_name']}: {entry['points']} points")

    # 4. Create Badge
    print("\n3. Creating Badge")
    badge_data = {
        "name": "Early Adopter",
        "description": "Joined during beta.",
        "icon_url": "http://example.com/badge.png"
    }
    r = requests.post(f"{BASE_URL}/api/v1/gamification/badges", headers=headers, json=badge_data)
    print(f"Status: {r.status_code}")
    print(r.json())
    
    # 5. List Badges
    print("\n4. Listing Badges")
    r = requests.get(f"{BASE_URL}/api/v1/gamification/badges", headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Found {len(r.json())} badges")

if __name__ == "__main__":
    test_gamification()
