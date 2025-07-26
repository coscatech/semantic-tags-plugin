import requests
import json

# Network calls - should be tagged as "Network Call"
response = requests.get('https://api.example.com')
fetch_data = http.get('/api/users')

# Debug statements - should be tagged as "Debug Statement"
print("Debug message")
console.log("Another debug")
debugger()

# TODOs - should be tagged as "Unfinished Block"
# TODO: Add error handling
# FIXME: This function is broken
# HACK: Temporary fix for the bug
# NOTE: Remember to update this

# Database operations - should be tagged as "Database Operation"
user = User.objects.get(id=1)
query = "SELECT * FROM users WHERE active = 1"
User.create(name="John", email="john@example.com")
users.save()

# Error handling - should be tagged as "Error Handling"
try:
    risky_operation()
except Exception as e:
    print(f"Error: {e}")
    raise ValueError("Custom error")

# Authentication - should be tagged as "Authentication"
token = generate_jwt_token(user_id)
if user.is_authenticated():
    login_user(user)
password_hash = hash_password(password)

# Configuration - should be tagged as "Configuration"
api_key = os.environ.get('API_KEY')
config = load_config_file()
settings = get_app_settings()