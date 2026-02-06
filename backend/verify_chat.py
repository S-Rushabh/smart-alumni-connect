import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def get_token(email, password, name):
    login_data = {"username": email, "password": password}
    r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    if r.status_code == 200:
        return r.json().get("access_token"), None
    
    register_data = {"email": email, "password": password, "full_name": name, "role": "alumni"}
    r = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    if r.status_code != 200:
        print(f"Registration failed for {email}: {r.text}")
        return None, None
        
    r = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    if r.status_code == 200:
        return r.json().get("access_token"), None
    return None, None

def get_user_id(token):
     headers = {"Authorization": f"Bearer {token}"}
     r = requests.get(f"{BASE_URL}/api/v1/profiles/me", headers=headers)
     if r.status_code == 200:
         return r.json().get("user_id") # Profile has user_id
     return None

def test_chat():
    print("\n--- Testing Chat ---")
    
    # 1. Login User A (Sender)
    token_a, _ = get_token("alice@chat.com", "Password123!", "Alice Chat")
    id_a = get_user_id(token_a)
    print(f"User A: ID {id_a}")
    
    # 2. Login User B (Recipient)
    token_b, _ = get_token("bob@chat.com", "Password123!", "Bob Chat")
    id_b = get_user_id(token_b)
    print(f"User B: ID {id_b}")

    if not token_a or not token_b:
        print("Failed to get tokens.")
        return

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. User A sends message to B (via HTTP fallback)
    print(f"\n1. Alice sends message to Bob (ID {id_b})")
    msg_data = {"recipient_id": id_b, "content": "Hello Bob! How are you?"}
    r = requests.post(f"{BASE_URL}/api/v1/chat/send", headers=headers_a, json=msg_data)
    print(f"Status: {r.status_code}")
    print(r.json())
    
    # 4. Bob checks history with Alice
    print(f"\n2. Bob checks history with Alice (ID {id_a})")
    r = requests.get(f"{BASE_URL}/api/v1/chat/history/{id_a}", headers=headers_b)
    print(f"Status: {r.status_code}")
    history = r.json()
    print(f"Found {len(history)} messages:")
    for msg in history:
        print(f"- From {msg['sender_id']}: {msg['content']}")
        
    # 5. Bob replies
    print(f"\n3. Bob replies to Alice (ID {id_a})")
    reply_data = {"recipient_id": id_a, "content": "Hi Alice! I'm good, thanks!"}
    requests.post(f"{BASE_URL}/api/v1/chat/send", headers=headers_b, json=reply_data)
    
    # 6. Alice checks history
    print(f"\n4. Alice checks history with Bob (ID {id_b})")
    r = requests.get(f"{BASE_URL}/api/v1/chat/history/{id_b}", headers=headers_a)
    history = r.json()
    print(f"Found {len(history)} messages.")

if __name__ == "__main__":
    test_chat()
