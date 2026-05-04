from django.urls import path
from .views import (
    RegisterView,
    ProfileView,
    LogoutView,
    VerifyEmailView,
    login_view,
    forgot_password,
    reset_password,
)

urlpatterns = [

    path('register/', RegisterView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

  
    path('profile/', ProfileView.as_view(), name='profile'),

  
    path('verify/<int:uid>/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),

    # Step 1: send email link
    path('forgot-password/', forgot_password, name='forgot-password'),

    # Step 2: reset password using link
    path(
        'reset-password/<uidb64>/<token>/',
        reset_password,
        name='reset-password'
    ),
]