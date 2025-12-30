from django.contrib import admin
from .models import Property, PropertyImage, Commission

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'vendor', 'price', 'city', 'state', 'status', 'is_vendor_terms', 'is_deceased_estate', 'created_at']
    list_filter = ['status', 'is_vendor_terms', 'is_deceased_estate', 'state', 'created_at']
    search_fields = ['title', 'description', 'address', 'city']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PropertyImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('vendor', 'title', 'description', 'status')
        }),
        ('Location', {
            'fields': ('address', 'city', 'state', 'zip_code')
        }),
        ('Property Details', {
            'fields': ('price', 'is_vendor_terms', 'is_deceased_estate', 'bedrooms', 'bathrooms', 'square_feet')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ['property', 'caption', 'is_primary', 'uploaded_at']
    list_filter = ['is_primary', 'uploaded_at']
    search_fields = ['property__title', 'caption']

@admin.register(Commission)
class CommissionAdmin(admin.ModelAdmin):
    list_display = ['property', 'amount', 'paid', 'paid_date', 'created_at']
    list_filter = ['paid', 'created_at']
    readonly_fields = ['amount', 'created_at']
    search_fields = ['property__title']
