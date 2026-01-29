from django.urls import path
from .views import run_compiler

urlpatterns = [
    path('compiler/', run_compiler),
]