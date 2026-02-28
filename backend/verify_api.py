import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_full_auth_flow():
    print("--- Starting Auth Verification Test ---")
    
    # 1. Test Registration (Matching signup.jsx formData)
    signup_data = {
        "email": "student_v6@test.com",
        "password": "testpassword123",
        "confirmPassword": "testpassword123",
        "role": "student",
        "fullName": "Test Student",
        "phone": "0123456789",
        "interest": "Computer Science"
    }
    
    print(f"\n[1] Testing Registration for {signup_data['email']}...")
    reg_res = requests.post(f"{BASE_URL}/register/", json=signup_data)
    print(f"Status: {reg_res.status_code}")
    print(f"Response: {reg_res.json()}")

    # 2. Test Login (Matching login.jsx)
    login_data = {
        "email": "student@test.com",
        "password": "testpassword123"
    }
    
    print(f"\n[2] Testing Login...")
    login_res = requests.post(f"{BASE_URL}/login/", json=login_data)
    print(f"Status: {login_res.status_code}")
    auth_data = login_res.json()
    access_token = auth_data.get('tokens', {}).get('access')
    refresh_token = auth_data.get('tokens', {}).get('refresh')
    
    if access_token:
        print("Login Successful! Received JWT tokens.")
    else:
        print("Login Failed!")
        return

    # 3. Test Profile Retrieval (Authenticated)
    print(f"\n[3] Testing Authenticated Profile Fetch...")
    headers = {"Authorization": f"Bearer {access_token}"}
    profile_res = requests.get(f"{BASE_URL}/profile/", headers=headers)
    print(f"Status: {profile_res.status_code}")
    print(f"Response: {profile_res.json()}")

    # 4. Test Forgot Password
    print(f"\n[4] Testing Forgot Password Request...")
    forgot_res = requests.post(f"{BASE_URL}/password-reset/", json={"email": "student@test.com"})
    print(f"Status: {forgot_res.status_code}")
    print(f"Response: {forgot_res.json()}")

    # 5. Test Logout
    print(f"\n[5] Testing Logout (Blacklisting)...")
    logout_res = requests.post(f"{BASE_URL}/logout/", json={"refresh": refresh_token}, headers=headers)
    print(f"Status: {logout_res.status_code}")
    print(f"Response: {logout_res.json()}")

    print("\n--- Auth Verification Test Complete ---")

if __name__ == "__main__":
    # Note: Ensure the Django server is running (python manage.py runserver) before executing this.
    try:
        test_full_auth_flow()
    except requests.exceptions.ConnectionError:
        print("\nERROR: Could not connect to the backend.")
        print("Make sure to run 'python manage.py runserver' in the backend directory first.")
