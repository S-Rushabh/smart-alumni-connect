import requests

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

def test_moderation():
    print("\n--- Testing Content Moderation ---")
    
    token = get_token("mod_test@example.com", "Password123!", "Mod Tester")
    if not token:
        print("Failed to get token.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Try to create Offensive Job
    print("\n1. Creating Offensive Job Post")
    job_bad = {
        "title": "Make easy money fast",
        "company": "Scam Corp", 
        "location": "Remote",
        "description": "This is not a scam trust me.",
        "requirements": "None",
        "job_type": "Contract"
    }
    r = requests.post(f"{BASE_URL}/api/v1/jobs/", headers=headers, json=job_bad)
    print(f"Status: {r.status_code}")
    if r.status_code == 400:
        print("SUCCESS: Offensive content blocked.")
        print(r.json())
    else:
        print("FAILURE: Offensive content allowed.")

    # 2. Try to create Clean Job
    print("\n2. Creating Clean Job Post")
    job_good = {
        "title": "Software Engineer",
        "company": "Tech Corp",
        "location": "Remote",
        "description": "Write clean code.",
        "requirements": "Python, FastAPI",
        "job_type": "Full-time"
    }
    r = requests.post(f"{BASE_URL}/api/v1/jobs/", headers=headers, json=job_good)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("SUCCESS: Clean content allowed.")
    else:
        print("FAILURE: Clean content blocked.")


if __name__ == "__main__":
    test_moderation()
