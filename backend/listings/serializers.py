from rest_framework import serializers
from .models import Property, PropertyImage, Commission

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'caption', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class CommissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commission
        fields = ['id', 'amount', 'paid', 'paid_date', 'created_at']
        read_only_fields = ['id', 'amount', 'created_at']

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    commission = CommissionSerializer(read_only=True)
    vendor_name = serializers.CharField(source='vendor.get_full_name', read_only=True)
    is_eligible = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Property
        fields = [
            'id', 'vendor', 'vendor_name', 'title', 'description', 'address', 'city', 
            'state', 'zip_code', 'price', 'is_vendor_terms', 'is_deceased_estate',
            'bedrooms', 'bathrooms', 'square_feet', 'status', 'created_at', 
            'updated_at', 'images', 'commission', 'is_eligible'
        ]
        read_only_fields = ['id', 'vendor', 'created_at', 'updated_at']
    
    def validate_price(self, value):
        """Ensure price is eligible for the platform"""
        if value > 200000:
            # Check if it will have vendor terms
            is_vendor_terms = self.initial_data.get('is_vendor_terms', False)
            if not is_vendor_terms:
                raise serializers.ValidationError(
                    "Properties over $200,000 must be available on vendor terms."
                )
        return value

class PropertyListSerializer(serializers.ModelSerializer):
    """Simplified serializer for property listings"""
    vendor_name = serializers.CharField(source='vendor.get_full_name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'vendor_name', 'title', 'address', 'city', 'state', 
            'price', 'is_vendor_terms', 'is_deceased_estate', 'bedrooms', 
            'bathrooms', 'square_feet', 'status', 'primary_image'
        ]
    
    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            return primary.image.url
        first = obj.images.first()
        return first.image.url if first else None
