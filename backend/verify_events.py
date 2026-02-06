import requests
from datetime import datetime, timedelta

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

def test_events():
    print("\n--- Testing Events ---")
    
    # 1. Create User (Organizer)
    token = get_token("organizer@example.com", "Password123!", "Event Organizer")
    print(f"Token: {token[:10]}...")
    if not token:
        print("Failed to get token.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Event
    print("\n1. Creating Event")
    start = (datetime.utcnow() + timedelta(days=7)).isoformat()
    end = (datetime.utcnow() + timedelta(days=7, hours=2)).isoformat()
    
    event_data = {
        "title": "Alumni Meetup 2026",
        "description": "Annual global alumni meetup.",
        "event_type": "virtual",
        "start_time": start,
        "end_time": end,
        "location": "https://zoom.us/j/123456789",
        "max_attendees": 100
    }
    r = requests.post(f"{BASE_URL}/api/v1/events/", headers=headers, json=event_data)
    print(f"Status: {r.status_code}")
    print(r.json())
    event_id = r.json().get("id")

    # 3. List Events
    print("\n2. Listing Events")
    r = requests.get(f"{BASE_URL}/api/v1/events/", headers=headers)
    print(f"Status: {r.status_code}")
    events = r.json()
    print(f"Found {len(events)} events")
    
    # 4. Get Event Details
    if event_id:
        print(f"\n3. Get Event Details ({event_id})")
        r = requests.get(f"{BASE_URL}/api/v1/events/{event_id}", headers=headers)
        print(f"Status: {r.status_code}")
        print(r.json())

if __name__ == "__main__":
    test_events()
