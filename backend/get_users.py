from django.contrib.auth import get_user_model
User = get_user_model()
print("\n--- USERS ---")
for u in User.objects.all():
    print(f"Email: {u.email}, Role: {getattr(u, 'role', 'N/A')}")
print("-------------\n")
