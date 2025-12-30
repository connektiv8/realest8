from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property, PropertyImage, Commission
from .serializers import PropertySerializer, PropertyListSerializer, PropertyImageSerializer, CommissionSerializer

class IsVendorOrReadOnly(permissions.BasePermission):
    """Custom permission: only vendors can create properties, anyone can view"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_vendor
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.vendor == request.user

class PropertyViewSet(viewsets.ModelViewSet):
    """ViewSet for property listings with vendor portal support"""
    queryset = Property.objects.filter(status='available')
    permission_classes = [IsVendorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_vendor_terms', 'is_deceased_estate', 'city', 'state', 'status']
    search_fields = ['title', 'description', 'address', 'city']
    ordering_fields = ['price', 'created_at', 'bedrooms', 'bathrooms']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        return PropertySerializer
    
    def get_queryset(self):
        queryset = Property.objects.all()
        
        # Filter by price range
        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        min_price = self.request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        
        # Show only eligible properties to public
        if not self.request.user.is_authenticated or not self.request.user.is_vendor:
            queryset = queryset.filter(status='available')
        
        return queryset
    
    def perform_create(self, serializer):
        """Automatically set the vendor to the current user"""
        property_instance = serializer.save(vendor=self.request.user)
        # Create commission record automatically
        Commission.objects.create(property=property_instance)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_listings(self, request):
        """Get all properties listed by the current vendor"""
        if not request.user.is_vendor:
            return Response(
                {"detail": "Only vendors can access this endpoint."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        properties = Property.objects.filter(vendor=request.user)
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

class PropertyImageViewSet(viewsets.ModelViewSet):
    """ViewSet for property images"""
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save()
