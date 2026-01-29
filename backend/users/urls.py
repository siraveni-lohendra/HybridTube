from django.urls import path
from .views import signup
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('signup/', signup),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]