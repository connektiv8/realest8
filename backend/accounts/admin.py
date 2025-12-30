from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_vendor', 'is_staff']
    list_filter = ['is_vendor', 'is_staff', 'is_active']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Vendor Information', {'fields': ('is_vendor', 'phone', 'company_name')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Vendor Information', {'fields': ('is_vendor', 'phone', 'company_name')}),
    )
