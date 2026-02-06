import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def get_token(email, password, name):
    login_data = {"username": email, "password": password}
    r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    if r.status_code == 200:
        return r.json().get("access_token")
    
    # Try register if login fails
    register_data = {"email": email, "password": password, "full_name": name, "role": "alumni"}
    requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    
    # Login again
    r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    if r.status_code == 200:
        return r.json().get("access_token")
    return None

def test_jobs():
    print("\n--- Testing Job Board ---")
    
    # 1. Create User (Alumni)
    token = get_token("recruiter@example.com", "Password123!", "Recruiter Rick")
    if not token:
        print("Failed to get token.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Post a Job
    print("\n1. Posting a Job")
    job_data = {
        "title": "Senior React Developer",
        "company": "Tech Corp",
        "location": "Remote",
        "description": "We are looking for an experienced React Native developer.",
        "job_type": "full-time",
        "apply_link": "mailto:jobs@techcorp.com"
    }
    r = requests.post(f"{BASE_URL}/api/v1/jobs/", headers=headers, json=job_data)
    print(f"Status: {r.status_code}")
    print(r.json())
    job_id = r.json().get("id")

    # 3. List Jobs
    print("\n2. Listing Jobs")
    r = requests.get(f"{BASE_URL}/api/v1/jobs/", headers=headers)
    print(f"Status: {r.status_code}")
    jobs = r.json()
    print(f"Found {len(jobs)} jobs")
    
    # 4. Get Job Details
    if job_id:
        print(f"\n3. Get Job Details ({job_id})")
        r = requests.get(f"{BASE_URL}/api/v1/jobs/{job_id}", headers=headers)
        print(f"Status: {r.status_code}")
        print(r.json())

if __name__ == "__main__":
    test_jobs()
