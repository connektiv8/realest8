from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Custom user model for vendors and buyers"""
    is_vendor = models.BooleanField(default=False)
    phone = models.CharField(max_length=20, blank=True)
    company_name = models.CharField(max_length=200, blank=True)
    
    def __str__(self):
        return self.email or self.username
