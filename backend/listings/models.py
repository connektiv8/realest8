from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Property(models.Model):
    """Property listing model"""
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('pending', 'Pending'),
        ('sold', 'Sold'),
    ]
    
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=200)
    description = models.TextField()
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    is_vendor_terms = models.BooleanField(default=False, help_text="Property available on vendor terms")
    is_deceased_estate = models.BooleanField(default=False, help_text="Deceased estate property")
    bedrooms = models.IntegerField(validators=[MinValueValidator(0)])
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, validators=[MinValueValidator(0)])
    square_feet = models.IntegerField(validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Properties'
    
    def __str__(self):
        return f"{self.title} - ${self.price}"
    
    def is_eligible(self):
        """Check if property meets platform criteria (under $200k or vendor terms)"""
        return self.price <= 200000 or self.is_vendor_terms

class PropertyImage(models.Model):
    """Property image model"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/')
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
    
    def __str__(self):
        return f"Image for {self.property.title}"

class Commission(models.Model):
    """Commission tracking model - flat $1,000 per sale"""
    FLAT_RATE = 1000.00
    
    property = models.OneToOneField(Property, on_delete=models.CASCADE, related_name='commission')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=FLAT_RATE)
    paid = models.BooleanField(default=False)
    paid_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Commission for {self.property.title} - ${self.amount}"
    
    def save(self, *args, **kwargs):
        """Ensure commission is always the flat rate"""
        self.amount = self.FLAT_RATE
        super().save(*args, **kwargs)
