from django.urls import path
from .views import (
    RegisterView,
    ProfileView,
    LogoutView,
    RequestPasswordResetView,
    ResetPasswordView,
    VerifyEmailView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Email verification
    path('verify/<int:uid>/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),

    #Password reset
    path('password-reset/', RequestPasswordResetView.as_view(), name='password-reset-request'),
    path('reset/<int:uid>/<str:token>/', ResetPasswordView.as_view(), name='password-reset'),
]