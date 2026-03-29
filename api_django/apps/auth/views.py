from django.shortcuts import render

# Create your views here.
from rest_framework_simplejwt.views import TokenObtainPairView

class LoginView(TokenObtainPairView):
    pass