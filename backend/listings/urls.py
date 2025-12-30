from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, PropertyImageViewSet

app_name = 'listings'

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'images', PropertyImageViewSet, basename='propertyimage')

urlpatterns = [
    path('', include(router.urls)),
]
