from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import reverse
from accounts.models import User
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from accounts.utils import send_verification_email
from .serializers import RegisterSerializer, ProfileSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model, authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .tokens import account_activation_token
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password


User = get_user_model()

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

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        return Response({"message": "User created successfully"})
    
class ProfileView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    

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

class VerifyEmailView(APIView):
    def get(self, request, uid, token):
        user = get_object_or_404(User, id=uid)

        if account_activation_token.check_token(user, token):
            user.is_verified = True
            user.save()
            return Response({"message": "Email verified successfully"})

        return Response({"error": "Invalid token"}, status=400)   

class RequestPasswordResetView(APIView):
    def post(self, request):
        email = request.data.get("email")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "If email exists, reset link sent"})

        token = account_activation_token.make_token(user)

        reset_link = f"http://localhost:3000/reset-password/{user.id}/{token}/"

        send_mail(
            "Password Reset Request",
            f"Click to reset password: {reset_link}",
            "noreply@civilcalc.com",
            [email],
            fail_silently=False,
        )

        return Response({"message": "Reset link sent"})         
    
class ResetPasswordView(APIView):
    def post(self, request, uid, token):
        password = request.data.get("password")

        user = User.objects.filter(id=uid).first()

        if user and account_activation_token.check_token(user, token):
            user.password = make_password(password)
            user.save()
            return Response({"message": "Password reset successful"})

        return Response({"error": "Invalid token"}, status=400)
    
@api_view(['POST'])
def login_view(request):
    username = request.data['username']
    password = request.data['password']

    user = authenticate(username=username, password=password)

    if user:
        return Response({"message": "Login successful"})
    return Response({"error": "Invalid credentials"}, status=400)    