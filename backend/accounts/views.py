from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.mail import send_mail

from accounts.serializers import ConverterSerializer, RegisterSerializer, ProfileSerializer, ResourceSerializer, CalculatorSerializer
from .models import Converter, Resource, Calculator
from accounts.tokens import account_activation_token
from .models import Converter, Resource

User = get_user_model()

# =========================
# REGISTER
# =========================

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User created successfully"})
    return Response(serializer.errors, status=400)


class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not email or not password:
            return Response({"error": "All fields required"}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=400)

        User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        return Response({"message": "User created successfully"})


# =========================
# LOGIN
# =========================

@api_view(['POST'])
def login_view(request):
    username = request.data['username']
    password = request.data['password']

    user = authenticate(username=username, password=password)

    if user:
        return Response({"message": "Login successful"})
    return Response({"error": "Invalid credentials"}, status=400)


# =========================
# PROFILE
# =========================

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)


# =========================
# LOGOUT
# =========================

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"})
        except Exception:
            return Response({"error": "Invalid token"}, status=400)


# =========================
# EMAIL VERIFICATION
# =========================

class VerifyEmailView(APIView):
    def get(self, request, uid, token):
        user = get_object_or_404(User, id=uid)

        if account_activation_token.check_token(user, token):
            user.is_verified = True
            user.save()
            return Response({"message": "Email verified successfully"})

        return Response({"error": "Invalid token"}, status=400)


# =========================
# FORGOT PASSWORD (STEP 1)
# =========================

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get("email")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "If account exists, email sent"})

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_link = f"http://localhost:3000/reset-password/{uid}/{token}"

    send_mail(
        "Reset Your Password",
        f"""
Forgot your password?

Click below to reset:

{reset_link}

If you didn’t request this, ignore this email.
""",
        "noreply@civilcalc.com",
        [email],
        fail_silently=False,
    )

    return Response({"message": "If account exists, email sent"})


# =========================
# RESET PASSWORD (STEP 2)
# =========================

@api_view(['POST'])
def reset_password(request, uidb64, token):
    new_password = request.data.get("password")

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except:
        return Response({"error": "Invalid link"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired link"}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successful"})

@api_view(['GET'])
def get_resources(request):
    data = Resource.objects.prefetch_related(
        "subitems",
        "chapters",
        "content_blocks",
    ).all()
    serializer = ResourceSerializer(data, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(['GET'])
def get_calculators(request):
    data = Calculator.objects.all()
    serializer = CalculatorSerializer(data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_converters(request):
    data = Converter.objects.all()
    serializer = ConverterSerializer(data, many=True)
    return Response(serializer.data)

# GET all categories
class ResourceListView(APIView):
    def get(self, request):
        resources = Resource.objects.prefetch_related(
            "subitems",
            "chapters",
            "content_blocks",
        ).all()
        serializer = ResourceSerializer(resources, many=True, context={"request": request})
        return Response(serializer.data)


# GET by category
class ResourceByCategoryView(APIView):
    def get(self, request, category):
        resources = Resource.objects.prefetch_related(
            "subitems",
            "chapters",
            "content_blocks",
        ).filter(category=category)
        serializer = ResourceSerializer(resources, many=True, context={"request": request})
        return Response(serializer.data)


# GET single resource (with subitems + files)
class ResourceDetailView(APIView):
    def get(self, request, category, sub):
        try:
            resource = Resource.objects.get(category=category, id=sub)
            serializer = ResourceSerializer(resource, context={"request": request})
            return Response(serializer.data)
        except Resource.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

class ResourceByIdView(APIView):
    def get(self, request, id):
        resource = get_object_or_404(
            Resource.objects.prefetch_related(
                "subitems__files",
                "subitems__questions",
                "subitems__chapters__content_blocks",
                "subitems__chapters__questions",
                "subitems__content_blocks",
                "chapters__content_blocks",
                "chapters__questions",
                "content_blocks",
            ),
            id=id,
        )
        serializer = ResourceSerializer(resource, context={"request": request})
        return Response(serializer.data)

class ResourceSlugView(APIView):
    def get(self, request, slug):
        resource = get_object_or_404(
            Resource.objects.prefetch_related(
                "subitems__files",
                "subitems__questions",
                "subitems__chapters__content_blocks",
                "subitems__chapters__questions",
                "subitems__content_blocks",
                "chapters__content_blocks",
                "chapters__questions",
                "content_blocks",
            ),
            slug=slug,
        )
        serializer = ResourceSerializer(resource, context={"request": request})
        return Response(serializer.data)
