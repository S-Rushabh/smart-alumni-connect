import requests
import datetime

BASE_URL = "http://127.0.0.1:8000"

def get_token(email, password, name):
    login_data = {"username": email, "password": password}
    r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    if r.status_code == 200:
        return r.json().get("access_token")
    
    register_data = {"email": email, "password": password, "full_name": name, "role": "admin"}
    requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    
    r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    if r.status_code == 200:
        return r.json().get("access_token")
    return None

def test_donations():
    print("\n--- Testing Donations ---")
    
    # 1. Create User (Alumni)
    token = get_token("donor@example.com", "Password123!", "Richie Rich")
    if not token:
        print("Failed to get token.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Campaign
    print("\n1. Creating Campaign")
    campaign_data = {
        "title": "Scholarship Fund 2026",
        "description": "Helping students in need.",
        "goal_amount": 50000.0,
        "end_date": (datetime.datetime.utcnow() + datetime.timedelta(days=365)).isoformat()
    }
    r = requests.post(f"{BASE_URL}/api/v1/donations/campaigns", headers=headers, json=campaign_data)
    print(f"Status: {r.status_code}")
    print(r.json())
    campaign_id = r.json().get("id")

    # 3. List Campaigns
    print("\n2. Listing Campaigns")
    r = requests.get(f"{BASE_URL}/api/v1/donations/campaigns", headers=headers)
    print(f"Status: {r.status_code}")
    campaigns = r.json()
    print(f"Found {len(campaigns)} campaigns")
    
    # 4. Make Donation
    if campaign_id:
        print(f"\n3. Making Donation to Campaign {campaign_id}")
        donation_data = {
            "campaign_id": campaign_id,
            "amount": 1000.0
        }
        r = requests.post(f"{BASE_URL}/api/v1/donations/donate", headers=headers, json=donation_data)
        print(f"Status: {r.status_code}")
        print(r.json())

    # 5. Verify Campaign Update
    print("\n4. Verifying Campaign Amount")
    r = requests.get(f"{BASE_URL}/api/v1/donations/campaigns", headers=headers)
    updated_campaigns = r.json()
    for c in updated_campaigns:
        if c['id'] == campaign_id:
            print(f"Campaign: {c['title']}, Current Amount: {c['current_amount']}")
            if c['current_amount'] >= 1000.0:
                print("SUCCESS: Donation reflected.")
            else:
                print("FAILURE: Amount not updated.")

if __name__ == "__main__":
    test_donations()
