from django.urls import path
from .views import (
    RegisterView,
    ProfileView,
    LogoutView,
    ResourceListView,
    ResourceByCategoryView,
    ResourceDetailView,
    ResourceByIdView,
    ResourceSlugView,
    VerifyEmailView,
    get_calculators,
    get_converters,
    get_resources,
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
    path('reset-password/<uidb64>/<token>/', reset_password, name='reset-password'),

    path("resources/", get_resources),
    path("resources/<int:id>/", ResourceByIdView.as_view()),
    path("resources/slug/<slug:slug>/", ResourceSlugView.as_view()),
    path("calculators/", get_calculators),
    path("converters/", get_converters),

    path("resources/", ResourceListView.as_view()),
    path("resources/<str:category>/", ResourceByCategoryView.as_view()),
    path("resources/<str:category>/<int:sub>/", ResourceDetailView.as_view()),
]